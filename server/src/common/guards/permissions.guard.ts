import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators';
import { AuthorizationService } from '../providers';
import { AuthenticatedUser, UserType } from '../types';

/**
 * Granular permission checks are an Admin/Sub Admin concept only. Many
 * routes are shared with non-admin account types (Company, Broker,
 * AssetOwner, Trustee, ...) via the existing `Roles`/`RolesGuard` pair —
 * those callers have no role/permission assignment at all, so this guard
 * no-ops for them and leaves their existing access unchanged. It only ever
 * *tightens* what an authenticated Admin can do.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) return false;
    if (user.type !== UserType.Admin) return true;

    const effective =
      await this.authorizationService.getEffectivePermissions(user);
    if (
      !this.authorizationService.hasAllPermissions(
        effective,
        requiredPermissions,
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
