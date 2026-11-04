import { RoleType } from '../../src/generated/prisma/client';
import {
  ADMINISTRATOR_ROLE_NAME,
  PERMISSION_CATALOG,
  STANDARD_ACCESS_ROLE_NAME,
  STANDARD_ACCESS_ROLE_PERMISSIONS,
} from '../../src/roles/permission-catalog.constant';

export interface RoleSeed {
  name: string;
  description: string;
  type: RoleType;
  isProtected: boolean;
  permissionKeys: string[];
}

/** All catalog permission keys belonging to any of the given modules. */
function permissionsForModules(modules: string[]): string[] {
  return PERMISSION_CATALOG.filter((permission) =>
    modules.includes(permission.module),
  ).map((permission) => permission.key);
}

// System roles. `isProtected: true` means the role can never be deleted
// (see RolesService.deleteRole) — Administrator backs the Super Admin (whose
// type-based bypass makes its permission list mostly cosmetic) and Standard
// Access is the minimal fallback assigned to any admin/user without an
// explicit role.
export const roles: RoleSeed[] = [
  {
    name: ADMINISTRATOR_ROLE_NAME,
    description:
      'Full access to every module. Reserved for the Super Admin account.',
    type: RoleType.System,
    isProtected: true,
    permissionKeys: PERMISSION_CATALOG.map((permission) => permission.key),
  },
  {
    name: STANDARD_ACCESS_ROLE_NAME,
    description:
      'Minimal default access granted until an explicit role is assigned.',
    type: RoleType.System,
    isProtected: true,
    permissionKeys: STANDARD_ACCESS_ROLE_PERMISSIONS,
  },
];

/**
 * Business-aligned starting points for Sub Admins, built only from
 * permissions that exist in the catalog above. Custom (not System) and not
 * protected — created once if missing (see prisma/seed.ts), never re-synced,
 * so a Super Admin is free to edit or delete them after the first seed run.
 */
export const businessRoles: RoleSeed[] = [
  {
    name: 'Asset Manager',
    description:
      'Reviews the asset pipeline, manages property categories, primary group properties, and the secondary marketplace listing switch.',
    type: RoleType.Custom,
    isProtected: false,
    permissionKeys: permissionsForModules([
      'asset',
      'category',
      'primary_group',
      'secondary_marketplace',
    ]),
  },
  {
    name: 'KYC Manager',
    description: 'Reviews and approves/rejects KYC submissions.',
    type: RoleType.Custom,
    isProtected: false,
    permissionKeys: permissionsForModules(['kyc']),
  },
  {
    name: 'Broker Manager',
    description:
      'Manages broker leads, commissions, and commission approval/withdrawal requests.',
    type: RoleType.Custom,
    isProtected: false,
    permissionKeys: permissionsForModules(['broker']),
  },
  {
    name: 'Finance Manager',
    description:
      'Reviews manual payments, deposit and withdrawal requests, manual wallet adjustments, and user investment history.',
    type: RoleType.Custom,
    isProtected: false,
    permissionKeys: permissionsForModules([
      'manual_payment',
      'deposit_request',
      'withdrawal_request',
      'wallets',
      'transactions',
    ]),
  },
  {
    name: 'Compliance Manager',
    description: 'Exports compliance CSV reports.',
    type: RoleType.Custom,
    isProtected: false,
    permissionKeys: permissionsForModules(['compliance_report', 'reports']),
  },
  {
    name: 'Group & Club Manager',
    description:
      'Manages groups (and their categories), primary/secondary group membership, NDA consent, club voting, and SPVs.',
    type: RoleType.Custom,
    isProtected: false,
    permissionKeys: permissionsForModules([
      'category',
      'group',
      'primary_group',
      'secondary_group',
      'club_membership',
      'vote',
      'spv',
    ]),
  },
  {
    name: 'User Manager',
    description: 'Manages customer accounts.',
    type: RoleType.Custom,
    isProtected: false,
    permissionKeys: permissionsForModules(['users']),
  },
];
