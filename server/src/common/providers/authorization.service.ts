import { Cache } from 'cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../../prisma';
import { AuthenticatedUser, UserType } from '../types';
import { AdminType, RoleStatus } from '../../generated/prisma/client';

export const getPermissionsCacheKey = (user: { id: number; type: string }) =>
  `${user.type}-${user.id}-permissions`.toLowerCase();

export interface EffectivePermissions {
  isSuperAdmin: boolean;
  roleId: number | null;
  permissions: Set<string>;
}

interface CachedPermissions {
  isSuperAdmin: boolean;
  roleId: number | null;
  permissions: string[];
}

@Injectable()
export class AuthorizationService {
  private readonly cacheTtl = 300000;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async getEffectivePermissions(
    user: AuthenticatedUser,
  ): Promise<EffectivePermissions> {
    const cacheKey = getPermissionsCacheKey(user);
    const cached = await this.cacheManager.get<CachedPermissions>(cacheKey);
    if (cached) {
      return {
        isSuperAdmin: cached.isSuperAdmin,
        roleId: cached.roleId,
        permissions: new Set(cached.permissions),
      };
    }

    const resolved = await this.resolve(user);
    await this.cacheManager.set(
      cacheKey,
      {
        isSuperAdmin: resolved.isSuperAdmin,
        roleId: resolved.roleId,
        permissions: Array.from(resolved.permissions),
      },
      this.cacheTtl,
    );
    return resolved;
  }

  hasPermission(effective: EffectivePermissions, permission: string): boolean {
    return effective.isSuperAdmin || effective.permissions.has(permission);
  }

  hasAllPermissions(
    effective: EffectivePermissions,
    permissions: string[],
  ): boolean {
    return (
      effective.isSuperAdmin ||
      permissions.every((permission) => effective.permissions.has(permission))
    );
  }

  /**
   * Enforces a single permission for one branch of a status/type-driven
   * endpoint (e.g. the `approve` vs `reject` outcome of a single "review"
   * route) where a blanket `@RequirePermissions` on the whole handler can't
   * express which key applies. Mirrors `PermissionsGuard`'s own rule: a
   * no-op for any non-Admin actor, since granular permissions only ever
   * govern what an Admin/Sub Admin can do.
   */
  async assertPermission(
    user: AuthenticatedUser,
    permission: string,
  ): Promise<void> {
    if (user.type !== UserType.Admin) return;

    const effective = await this.getEffectivePermissions(user);
    if (!this.hasPermission(effective, permission)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
  }

  /**
   * Throws unless every requested permission key is already held by `user`.
   * This is the single choke point that stops a Sub Admin from granting (via
   * a role they author or assign) a permission they don't themselves have.
   */
  async assertDelegatable(
    user: AuthenticatedUser,
    requestedPermissionKeys: string[],
  ): Promise<void> {
    const effective = await this.getEffectivePermissions(user);
    if (effective.isSuperAdmin) return;

    const missing = requestedPermissionKeys.filter(
      (key) => !effective.permissions.has(key),
    );
    if (missing.length > 0) {
      throw new ForbiddenException(
        `Cannot grant permissions you do not have: ${missing.join(', ')}`,
      );
    }
  }

  async invalidate(user: { id: number; type: string }): Promise<void> {
    await this.cacheManager.del(getPermissionsCacheKey(user));
  }

  /**
   * Login-time gate: whoever holds a disabled role can't sign in, regardless
   * of their own account status. A `null` roleId (no role assigned, or a
   * Super Admin who bypasses roles entirely) is always allowed through.
   */
  async assertRoleActive(roleId: number | null): Promise<void> {
    if (!roleId) return;

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { status: true },
    });
    if (role?.status === RoleStatus.InActive) {
      throw new Error(
        'Your assigned role has been inactive. Please contact your administrator.',
      );
    }
  }

  private async resolve(
    user: AuthenticatedUser,
  ): Promise<EffectivePermissions> {
    if (user.type === UserType.Admin) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: user.id },
        select: { type: true, roleId: true },
      });
      if (!admin) {
        return { isSuperAdmin: false, roleId: null, permissions: new Set() };
      }
      if (admin.type === AdminType.SuperAdmin) {
        return {
          isSuperAdmin: true,
          roleId: admin.roleId,
          permissions: new Set(),
        };
      }
      return {
        isSuperAdmin: false,
        roleId: admin.roleId,
        permissions: await this.getRolePermissions(admin.roleId),
      };
    }

    if (user.type === UserType.User) {
      const record = await this.prisma.account.findUnique({
        where: { id: user.id },
        select: { roleId: true },
      });
      return {
        isSuperAdmin: false,
        roleId: record?.roleId ?? null,
        permissions: await this.getRolePermissions(record?.roleId ?? null),
      };
    }

    return { isSuperAdmin: false, roleId: null, permissions: new Set() };
  }

  private async getRolePermissions(
    roleId: number | null,
  ): Promise<Set<string>> {
    if (!roleId) return new Set();

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) return new Set();

    return new Set(role.permissions.map((rp) => rp.permission.key));
  }
}
