import { AdminType, Prisma } from '../../src/generated/prisma/client';

export const admin: Prisma.AdminCreateInput = {
  firstname: '',
  lastname: '',
  email: process.env.ADMIN_EMAIL || '',
  type: AdminType.SuperAdmin,
  meta: {
    create: {
      passwordSalt: process.env.ADMIN_PASSWORD_SALT || '',
      passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
    },
  },
};
