import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser, AuthorizationService, UserType } from '@Common';
import { AuditService } from '../audit';
import { PrismaService } from '../prisma';
import { Prisma, Role, RoleStatus } from '../generated/prisma/client';
import { PERMISSION_GROUPS } from './permission-catalog.constant';

export interface RoleResponse {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  status: RoleStatus;
  createdAt: Date;
  updatedAt: Date;
}

type RoleWithPermissions = Role & {
  permissions: { permission: { key: string; module: string } }[];
};

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService,
    private readonly auditService: AuditService,
  ) {}

  private toResponse(role: RoleWithPermissions): RoleResponse {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((rp) => rp.permission.key),
      isSystem: role.isProtected,
      status: role.status,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  private async findRoleOrThrow(id: number): Promise<RoleWithPermissions> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  private async assertPermissionKeysExist(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    const found = await this.prisma.permission.count({
      where: { key: { in: keys } },
    });
    if (found !== new Set(keys).size) {
      throw new BadRequestException('One or more permissions are invalid');
    }
  }

  async getPermissionCatalog(options: { search?: string }): Promise<{
    permissions: {
      key: string;
      module: string;
      action: string;
      description: string | null;
    }[];
    groups: { module: string; label: string; permissions: string[] }[];
  }> {
    const allPermissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    const term = options.search?.trim().toLowerCase();
    const matchingModules = term
      ? new Set(
          PERMISSION_GROUPS.filter(
            (group) =>
              group.module.toLowerCase().includes(term) ||
              group.label.toLowerCase().includes(term),
          ).map((group) => group.module),
        )
      : null;

    const groups = PERMISSION_GROUPS.filter(
      (group) => !matchingModules || matchingModules.has(group.module),
    ).map((group) => ({
      module: group.module,
      label: group.label,
      permissions: allPermissions
        .filter((permission) => permission.module === group.module)
        .map((permission) => permission.key),
    }));

    const permissions = matchingModules
      ? allPermissions.filter((permission) =>
          matchingModules.has(permission.module),
        )
      : allPermissions;

    return { permissions, groups };
  }

  async listRoles(options: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: RoleResponse[];
  }> {
    const search = options.search?.trim().toLowerCase();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.RoleWhereInput = {};

    if (search) {
      const buildSearchFilter = (search: string): Prisma.RoleWhereInput[] => [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
      const parts = search.split(' ');
      if (parts.length !== 0) {
        where.AND = [];
        for (const part of parts) {
          if (part.trim()) {
            where.AND.push({
              OR: buildSearchFilter(part.trim()),
            });
          }
        }
      }
    }
    const totalRoles = await this.prisma.role.count({
      where,
    });

    const roles = await this.prisma.role.findMany({
      where,
      include: { permissions: { include: { permission: true } } },
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });
    const listData = roles.map((role) => this.toResponse(role));
    return {
      count: totalRoles,
      skip: pagination.skip,
      take: pagination.take,
      data: listData,
    };
  }

  async getRole(id: number): Promise<RoleResponse> {
    return this.toResponse(await this.findRoleOrThrow(id));
  }

  async createRole(
    actingUser: AuthenticatedUser,
    data: { name: string; description?: string; permissions: string[] },
  ): Promise<RoleResponse> {
    await this.assertPermissionKeysExist(data.permissions);
    await this.authorizationService.assertDelegatable(
      actingUser,
      data.permissions,
    );

    const existing = await this.prisma.role.count({
      where: { name: data.name },
    });
    if (existing > 0) {
      throw new BadRequestException('A role with this name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        createdByAdminId: actingUser.id,
        updatedByAdminId: actingUser.id,
        permissions: {
          create: data.permissions.map((key) => ({
            permission: { connect: { key } },
          })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    await this.auditService.log({
      actorAdminId: actingUser.id,
      action: 'role.created',
      targetType: 'Role',
      targetId: role.id,
      metadata: { name: role.name, permissions: data.permissions },
    });

    return this.toResponse(role);
  }

  async updateRole(
    actingUser: AuthenticatedUser,
    id: number,
    data: { name?: string; description?: string; permissions?: string[] },
  ): Promise<RoleResponse> {
    const role = await this.findRoleOrThrow(id);
    if (role.isProtected) {
      throw new ForbiddenException(
        'This role is protected and cannot be edited',
      );
    }

    if (data.name && data.name !== role.name) {
      const existing = await this.prisma.role.count({
        where: { name: data.name, NOT: { id } },
      });
      if (existing > 0) {
        throw new BadRequestException('A role with this name already exists');
      }
    }

    if (data.permissions) {
      await this.assertPermissionKeysExist(data.permissions);
      await this.authorizationService.assertDelegatable(
        actingUser,
        data.permissions,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (data.permissions) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
      }

      return await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          updatedByAdminId: actingUser.id,
          ...(data.permissions
            ? {
                permissions: {
                  create: data.permissions.map((key) => ({
                    permission: { connect: { key } },
                  })),
                },
              }
            : {}),
        },
        include: { permissions: { include: { permission: true } } },
      });
    });

    await this.invalidateRoleHolders(id);
    await this.auditService.log({
      actorAdminId: actingUser.id,
      action: 'role.updated',
      targetType: 'Role',
      targetId: id,
      metadata: { name: data.name, permissions: data.permissions },
    });

    return this.toResponse(updated);
  }

  /**
   * Disabling a role locks out login for every Admin/Account currently
   * assigned it (enforced at credential-validation time by
   * `AuthorizationService.assertRoleActive`) — anyone already logged in
   * keeps their existing session until their cached permissions expire.
   */
  async setStatus(
    actingUser: AuthenticatedUser,
    id: number,
    status: RoleStatus,
  ): Promise<RoleResponse> {
    const role = await this.findRoleOrThrow(id);
    if (role.isProtected) {
      throw new ForbiddenException(
        'This role is protected and cannot be inactive',
      );
    }
    await this.authorizationService.assertPermission(
      actingUser,
      status === RoleStatus.InActive ? 'roles.deactivate' : 'roles.activate',
    );

    const updated = await this.prisma.role.update({
      where: { id },
      data: { status, updatedByAdminId: actingUser.id },
      include: { permissions: { include: { permission: true } } },
    });

    await this.invalidateRoleHolders(id);
    await this.auditService.log({
      actorAdminId: actingUser.id,
      action: 'role.status_changed',
      targetType: 'Role',
      targetId: id,
      metadata: { status },
    });

    return this.toResponse(updated);
  }

  async deleteRole(
    actingUser: AuthenticatedUser,
    id: number,
    replacementRoleId?: number,
  ): Promise<void> {
    const role = await this.findRoleOrThrow(id);
    if (role.isProtected) {
      throw new ForbiddenException(
        'This role is protected and cannot be deleted',
      );
    }

    const [adminCount, userCount] = await Promise.all([
      this.prisma.admin.count({ where: { roleId: id } }),
      this.prisma.account.count({ where: { roleId: id } }),
    ]);
    const assignedCount = adminCount + userCount;

    if (assignedCount > 0 && !replacementRoleId) {
      throw new ConflictException(
        'Unassign all users from this role before deleting it',
      );
    }

    let replacementRole: RoleWithPermissions | null = null;
    if (assignedCount > 0 && replacementRoleId) {
      if (replacementRoleId === id) {
        throw new BadRequestException(
          'replacementRoleId must be different from the role being deleted',
        );
      }
      replacementRole = await this.findRoleOrThrow(replacementRoleId);
      await this.authorizationService.assertDelegatable(
        actingUser,
        replacementRole.permissions.map((rp) => rp.permission.key),
      );
    }

    const [affectedAdmins, affectedUsers] = await Promise.all([
      this.prisma.admin.findMany({
        where: { roleId: id },
        select: { id: true },
      }),
      this.prisma.account.findMany({
        where: { roleId: id },
        select: { id: true },
      }),
    ]);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (replacementRole) {
        await tx.admin.updateMany({
          where: { roleId: id },
          data: { roleId: replacementRole.id },
        });
        await tx.account.updateMany({
          where: { roleId: id },
          data: { roleId: replacementRole.id },
        });
      }
      await tx.role.delete({ where: { id } });
    });

    await Promise.all([
      ...affectedAdmins.map((admin) =>
        this.authorizationService.invalidate({
          id: admin.id,
          type: UserType.Admin,
        }),
      ),
      ...affectedUsers.map((user) =>
        this.authorizationService.invalidate({
          id: user.id,
          type: UserType.User,
        }),
      ),
    ]);

    await this.auditService.log({
      actorAdminId: actingUser.id,
      action: 'role.deleted',
      targetType: 'Role',
      targetId: id,
      metadata: { replacementRoleId: replacementRole?.id },
    });
  }

  private async invalidateRoleHolders(roleId: number): Promise<void> {
    const [admins, users] = await Promise.all([
      this.prisma.admin.findMany({ where: { roleId }, select: { id: true } }),
      this.prisma.account.findMany({ where: { roleId }, select: { id: true } }),
    ]);
    await Promise.all([
      ...admins.map((admin) =>
        this.authorizationService.invalidate({
          id: admin.id,
          type: UserType.Admin,
        }),
      ),
      ...users.map((user) =>
        this.authorizationService.invalidate({
          id: user.id,
          type: UserType.User,
        }),
      ),
    ]);
  }
}
