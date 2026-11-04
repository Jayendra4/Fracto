import { Prisma } from '../../src/generated/prisma/client';
import { PERMISSION_CATALOG } from '../../src/roles/permission-catalog.constant';

export const permissions: Prisma.PermissionCreateManyInput[] =
  PERMISSION_CATALOG.map((permission) => ({
    key: permission.key,
    module: permission.module,
    action: permission.action,
    description: permission.description,
  }));
