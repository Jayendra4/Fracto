import 'dotenv/config';
import { Command } from 'commander';
import { isEmail } from 'class-validator';
import {
  admin,
  allAccountTypeDocs,
  bankLists,
  businessRoles,
  companyDocs,
  countries,
  documents,
  icons,
  permissions,
  roles,
} from './seeds';
import { ADMINISTRATOR_ROLE_NAME } from '../src/roles/permission-catalog.constant';
import { AdminType, PrismaClient } from '../src/generated/prisma/client';

const program = new Command();
program.option('--seed-only <name>', 'Specify a seed name').parse(process.argv);

const prisma = new PrismaClient();

async function main() {
  const options = program.opts();

  // Seed admin default credential
  if (!options.seedOnly || options.seedOnly === 'admin') {
    if (await prisma.admin.count()) {
      console.log('⚠ Skipping seed for `admin`, due to non-empty table');
    } else {
      if (
        isEmail(admin.email) &&
        admin.meta?.create?.passwordHash &&
        admin.meta.create.passwordSalt
      ) {
        await prisma.admin.create({
          data: admin,
        });
      } else {
        console.error(new Error('Invalid default admin credentials found'));
      }
    }

    // Every admin that existed before this RBAC feature had unrestricted
    // access by definition (there was no Sub Admin concept yet). `type`
    // defaults to SubAdmin at the schema level, so without this backfill
    // every pre-existing admin would silently become a Sub Admin with no
    // role/permissions the moment this migration lands. Scoped to
    // `type: SubAdmin, roleId: null` so it only touches admins nobody has
    // migrated yet — safe to re-run.
    const { count: promoted } = await prisma.admin.updateMany({
      where: { type: AdminType.SubAdmin, roleId: null },
      data: { type: AdminType.SuperAdmin },
    });
    if (promoted > 0) {
      console.log(
        `Promoted ${promoted} pre-existing admin(s) to Super Admin (unrestricted access, matching their behavior before this RBAC feature existed)`,
      );
    }
  }
  if (!options?.seedOnly || options.seedOnly === 'countries') {
    for (const country of countries) {
      const existing = await prisma.country.findFirst({
        where: { isoCode: country.isoCode },
      });

      if (existing) {
        await prisma.country.update({
          where: { id: existing.id },
          data: {
            name: country.name,
            dialCode: country.dialCode,
            flag: country.flag,
          },
        });
      } else {
        await prisma.country.create({
          data: country,
        });
      }
    }
    console.log('Countries seeded/upserted');
  }

  if (!options?.seedOnly || options.seedOnly === 'documents') {
    for (const doc of documents) {
      await prisma.document.upsert({
        where: { developerName: doc.developerName },
        update: { name: doc.name },
        create: doc,
      });
    }
    console.log('Documents seeded/upserted');
  }

  if (!options?.seedOnly || options.seedOnly === 'accountRequiredDocuments') {
    for (const doc of companyDocs) {
      // First find document id by developerName
      const document = await prisma.document.findUnique({
        where: { developerName: doc.documentType.connect?.developerName },
      });

      if (!document) {
        console.warn(
          `⚠ Document not found for developerName: ${doc.documentType.connect?.developerName}, skipping`,
        );
        continue;
      }

      await prisma.accountRequiredDocument.upsert({
        where: {
          accountType_documentTypeId: {
            accountType: doc.accountType,
            documentTypeId: document.id,
          },
        },
        update: {
          mandatory: doc.mandatory,
          order: doc.order,
        },
        create: {
          accountType: doc.accountType,
          documentTypeId: document.id,
          mandatory: doc.mandatory,
          order: doc.order,
        },
      });
    }
    console.log('Account required documents seeded/upserted');
  }

  if (
    !options?.seedOnly ||
    options.seedOnly === 'allTypeAccountRequiredDocuments'
  ) {
    for (const doc of allAccountTypeDocs) {
      const document = await prisma.document.findUnique({
        where: { developerName: doc.documentType.connect?.developerName },
      });

      if (!document) {
        console.warn(
          `⚠ Document not found for developerName: ${doc.documentType.connect?.developerName}, skipping`,
        );
        continue;
      }

      await prisma.accountRequiredDocument.upsert({
        where: {
          accountType_documentTypeId: {
            accountType: doc.accountType,
            documentTypeId: document.id,
          },
        },
        update: {
          mandatory: doc.mandatory,
          order: doc.order,
        },
        create: {
          accountType: doc.accountType,
          documentTypeId: document.id,
          mandatory: doc.mandatory,
          order: doc.order,
        },
      });
    }

    console.log('Account required documents seeded for ALL account types');
  }
  if (!options?.seedOnly || options.seedOnly === 'bankDetailsSeed') {
    for (const bank of bankLists) {
      await prisma.bank.upsert({
        where: { code: bank.code },
        update: {
          name: bank.name,
          isActive: true,
        },
        create: {
          name: bank.name,
          code: bank.code,
          isActive: true,
        },
      });
    }

    console.log('Bank master seeded successfully');
  }

  if (!options?.seedOnly || options.seedOnly === 'icons') {
    for (const icon of icons) {
      const existing = await prisma.icons.findFirst({
        where: { name: icon.name },
      });

      if (existing) {
        await prisma.icons.update({
          where: { id: existing.id },
          data: { url: icon.url },
        });
      } else {
        await prisma.icons.create({
          data: icon,
        });
      }
    }
    console.log('Icons seeded/upserted');
  }

  // Seed the permission catalog (must run before `roles`/`admin`, which
  // reference permissions/roles by key/name). Upserted by key so re-running
  // this after adding a new module to permission-catalog.constant.ts
  // delivers the new permissions without touching anything else.
  if (!options.seedOnly || options.seedOnly === 'permissions') {
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { key: permission.key },
        update: {
          module: permission.module,
          action: permission.action,
          description: permission.description,
        },
        create: permission,
      });
    }

    // Prune permissions that no longer exist in the catalog (a renamed or
    // removed module leaves orphaned rows behind, since the loop above only
    // ever upserts). Cascades to `role_permission`, so it also drops the
    // stale permission from every role — including Administrator, which
    // otherwise silently accumulates dead entries forever.
    const { count: pruned } = await prisma.permission.deleteMany({
      where: {
        key: { notIn: permissions.map((permission) => permission.key) },
      },
    });
    if (pruned > 0) {
      console.log(
        `Pruned ${pruned} permission(s) no longer present in the catalog`,
      );
    }
  }

  // Seed system roles (Administrator, Standard Access). Administrator is
  // kept in sync with the full permission catalog on every run, since it's
  // documented as "every permission" — Standard Access and any custom roles
  // are left untouched once created; new permissions are never
  // auto-granted to them (see RolesService).
  if (!options.seedOnly || options.seedOnly === 'roles') {
    for (const role of [...roles, ...businessRoles]) {
      const existing = await prisma.role.findUnique({
        where: { name: role.name },
      });

      if (!existing) {
        await prisma.role.create({
          data: {
            name: role.name,
            description: role.description,
            type: role.type,
            isProtected: role.isProtected,
            permissions: {
              create: role.permissionKeys.map((key) => ({
                permission: { connect: { key } },
              })),
            },
          },
        });
      } else if (role.name === ADMINISTRATOR_ROLE_NAME) {
        for (const key of role.permissionKeys) {
          const permission = await prisma.permission.findUniqueOrThrow({
            where: { key },
          });
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: existing.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: { roleId: existing.id, permissionId: permission.id },
          });
        }
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
