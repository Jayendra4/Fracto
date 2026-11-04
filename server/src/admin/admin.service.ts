import { join } from 'node:path';
import { Cache } from 'cache-manager';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { adminConfigFactory } from '@Config';
import {
  AuthenticatedUser,
  AuthorizationService,
  StorageService,
  UtilsService,
  ValidatedUser,
  UserType,
  getAccessGuardCacheKey,
} from '@Common';
import { AuditService } from '../audit';
import { PERMISSION_CATALOG, STANDARD_ACCESS_ROLE_NAME } from '../roles';
import { PrismaService } from '../prisma';
import { Admin, AdminMeta, Prisma } from '../generated/prisma/client';
import { AdminStatus, AdminType } from '../generated/prisma/enums';

@Injectable()
export class AdminService {
  constructor(
    @Inject(adminConfigFactory.KEY)
    private readonly config: ConfigType<typeof adminConfigFactory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly storageService: StorageService,
    private readonly authorizationService: AuthorizationService,
    private readonly auditService: AuditService,
  ) {}

  private getProfileImageUrl(profileImage: string): string {
    return this.storageService.getFileUrl(
      profileImage,
      this.config.profileImagePath,
    );
  }

  private hashPassword(password: string): { salt: string; hash: string } {
    const salt = this.utilsService.generateSalt(this.config.passwordSaltLength);
    const hash = this.utilsService.hashPassword(
      password,
      salt,
      this.config.passwordHashLength,
    );
    return { salt, hash };
  }

  async isEmailExist(email: string, excludeAdminId?: number): Promise<boolean> {
    return (
      (await this.prisma.admin.count({
        where: {
          email: email.toLowerCase(),
          NOT: {
            id: excludeAdminId,
          },
        },
      })) !== 0
    );
  }

  async getById(adminId: number): Promise<Admin> {
    return await this.prisma.admin.findUniqueOrThrow({
      where: {
        id: adminId,
      },
    });
  }

  async getByEmail(email: string): Promise<Admin | null> {
    return await this.prisma.admin.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async getMetaById(adminId: number): Promise<AdminMeta> {
    return await this.prisma.adminMeta.findUniqueOrThrow({
      where: {
        adminId,
      },
    });
  }

  async authenticate(adminId: number, password: string): Promise<Admin> {
    const admin = await this.getById(adminId);
    const validation = await this.validateCredentials(admin.email, password);

    if (!validation === null) throw new Error('Admin not found');
    if (validation === false) throw new Error('Incorrect password');

    return admin;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<ValidatedUser | false | null> {
    const admin = await this.getByEmail(email);
    if (!admin) return null;
    if (admin.status !== AdminStatus.Active) {
      throw new Error(
        'Your account has been temporarily suspended/blocked by the system',
      );
    }
    await this.authorizationService.assertRoleActive(admin.roleId);

    const adminMeta = await this.getMetaById(admin.id);
    const passwordHash = this.utilsService.hashPassword(
      password,
      adminMeta.passwordSalt || '',
      adminMeta.passwordHash
        ? adminMeta.passwordHash.length / 2
        : this.config.passwordHashLength,
    );

    if (adminMeta.passwordHash !== passwordHash) {
      return false;
    }

    return {
      id: admin.id,
      type: UserType.Admin,
    };
  }

  async getProfile(adminId: number): Promise<
    Admin & {
      role: { id: number; name: string } | null;
      permissions: string[];
    }
  > {
    const admin = await this.prisma.admin.findUniqueOrThrow({
      where: { id: adminId },
      include: { role: { select: { id: true, name: true } } },
    });
    if (admin.profileImage) {
      admin.profileImage = this.getProfileImageUrl(admin.profileImage);
    }

    const effective = await this.authorizationService.getEffectivePermissions({
      id: admin.id,
      type: UserType.Admin,
    });

    const permissions = effective.isSuperAdmin
      ? PERMISSION_CATALOG.map((permission) => permission.key)
      : Array.from(effective.permissions);

    return { ...admin, permissions };
  }

  async updateProfileDetails(
    adminId: number,
    data: {
      firstname?: string;
      lastname?: string;
      email?: string;
    },
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<Admin> {
    const prismaClient = options?.tx ? options.tx : this.prisma;

    const admin = await prismaClient.admin.findUniqueOrThrow({
      where: { id: adminId },
    });
    if (data.email && (await this.isEmailExist(data.email, adminId))) {
      throw new Error('Email already exist');
    }

    return await prismaClient.admin.update({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email && data.email.toLowerCase(),
      },
      where: {
        id: admin.id,
      },
    });
  }

  async updateProfileImage(
    adminId: number,
    profileImage: string,
  ): Promise<{ profileImage: string | null }> {
    const admin = await this.getById(adminId);

    return await this.prisma.$transaction(async (tx) => {
      await tx.admin.update({
        where: { id: adminId },
        data: { profileImage },
      });

      // Remove previous profile image from storage
      if (admin.profileImage) {
        await this.storageService.removeFile(
          join(this.config.profileImagePath, admin.profileImage),
        );
      }
      await this.storageService.move(
        profileImage,
        this.config.profileImagePath,
      );

      return {
        profileImage: this.getProfileImageUrl(profileImage),
      };
    });
  }

  async changePassword(
    adminId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<Admin> {
    const admin = await this.getById(adminId);
    const adminMeta = await this.getMetaById(admin.id);

    const hashedPassword = this.utilsService.hashPassword(
      oldPassword,
      adminMeta.passwordSalt || '',
      adminMeta.passwordHash
        ? adminMeta.passwordHash.length / 2
        : this.config.passwordHashLength,
    );

    if (hashedPassword !== adminMeta.passwordHash)
      throw new Error('Password does not match');

    const { salt, hash } = this.hashPassword(newPassword);
    const passwordSalt = salt;
    const passwordHash = hash;

    await this.prisma.adminMeta.update({
      data: {
        passwordHash,
        passwordSalt,
      },
      where: {
        adminId,
      },
    });
    return admin;
  }

  async setStatus(userId: number, status: AdminStatus): Promise<Admin> {
    await this.cacheManager.del(
      getAccessGuardCacheKey({ id: userId, type: UserType.Admin }),
    );
    return await this.prisma.admin.update({
      data: { status },
      where: {
        id: userId,
      },
    });
  }

  async listAdmins(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Admin[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.AdminWhereInput = {};

    if (search) {
      const buildSearchFilter = (search: string): Prisma.AdminWhereInput[] => [
        {
          firstname: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastname: {
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

    const totalAdmins = await this.prisma.admin.count({
      where,
    });
    const subAdmins = await this.prisma.admin.findMany({
      where,
      include: { role: { select: { id: true, name: true } } },
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });

    return {
      count: totalAdmins,
      skip: pagination.skip,
      take: pagination.take,
      data: subAdmins,
    };
  }

  async getAdminById(
    adminId: number,
  ): Promise<Admin & { role: { id: number; name: string } | null }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      include: { role: { select: { id: true, name: true } } },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  /**
   * Creates a Sub Admin. `type` is intentionally never accepted from the
   * caller — Super Admin only ever exists via the seed — and an explicit
   * `roleId` is checked against the creator's own effective permissions so a
   * Sub Admin can never delegate more than it holds. Omitting `roleId`
   * defaults the new admin to the minimal "Standard Access" role.
   */
  async createSubAdmin(
    actingUser: AuthenticatedUser,
    data: {
      firstname: string;
      lastname: string;
      email: string;
      password: string;
      roleId?: number;
    },
  ): Promise<Admin> {
    if (await this.isEmailExist(data.email)) {
      throw new ConflictException('Email already exist');
    }

    let roleId = data.roleId;
    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
        include: { permissions: { include: { permission: true } } },
      });
      if (!role) throw new NotFoundException('Role not found');
      await this.authorizationService.assertDelegatable(
        actingUser,
        role.permissions.map((rp) => rp.permission.key),
      );
    } else {
      const defaultRole = await this.prisma.role.findUniqueOrThrow({
        where: { name: STANDARD_ACCESS_ROLE_NAME },
      });
      roleId = defaultRole.id;
    }

    const { salt, hash } = this.hashPassword(data.password);
    const admin = await this.prisma.admin.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email.toLowerCase(),
        type: AdminType.SubAdmin,
        roleId,
        createdByAdminId: actingUser.id,
        meta: {
          create: {
            passwordSalt: salt,
            passwordHash: hash,
          },
        },
      },
    });

    await this.auditService.log({
      actorAdminId: actingUser.id,
      action: 'admin.created',
      targetType: 'Admin',
      targetId: admin.id,
      metadata: { email: admin.email, roleId },
    });

    return admin;
  }

  async assignRole(
    actingUser: AuthenticatedUser,
    targetAdminId: number,
    roleId: number,
  ): Promise<Admin> {
    const target = await this.getAdminById(targetAdminId);
    if (target.type === AdminType.SuperAdmin) {
      throw new ForbiddenException("The Super Admin's role cannot be changed");
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    await this.authorizationService.assertDelegatable(
      actingUser,
      role.permissions.map((rp) => rp.permission.key),
    );

    const admin = await this.prisma.admin.update({
      where: { id: targetAdminId },
      data: { roleId },
    });

    await this.authorizationService.invalidate({
      id: targetAdminId,
      type: UserType.Admin,
    });
    await this.auditService.log({
      actorAdminId: actingUser.id,
      action: 'admin.role_assigned',
      targetType: 'Admin',
      targetId: targetAdminId,
      metadata: { roleId },
    });

    return admin;
  }

  /**
   * Hierarchy-guarded status change: nobody (including itself) may block the
   * Super Admin, and only the Super Admin may block/reactivate a Sub Admin —
   * this is what stops one Sub Admin from disabling another.
   */
  async setAdminStatusGuarded(
    actingUser: AuthenticatedUser,
    targetAdminId: number,
    status: AdminStatus,
  ): Promise<Admin> {
    const actingAdmin = await this.getAdminById(actingUser.id);
    const target = await this.getAdminById(targetAdminId);

    if (target.type === AdminType.SuperAdmin) {
      throw new ForbiddenException(
        'The Super Admin account cannot be modified',
      );
    }
    if (
      actingAdmin.type !== AdminType.SuperAdmin &&
      target.type === AdminType.SubAdmin
    ) {
      throw new ForbiddenException(
        'Only the Super Admin can block or reactivate a Sub Admin',
      );
    }

    const admin = await this.setStatus(targetAdminId, status);

    await this.auditService.log({
      actorAdminId: actingUser.id,
      action: 'admin.status_changed',
      targetType: 'Admin',
      targetId: targetAdminId,
      metadata: { status },
    });

    return admin;
  }
}
