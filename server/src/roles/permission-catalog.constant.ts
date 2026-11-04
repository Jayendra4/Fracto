export interface PermissionDefinition {
  key: string;
  module: string;
  action: string;
  description: string;
}

export interface PermissionGroupDefinition {
  module: string;
  label: string;
}

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'assign'
  | 'activate'
  | 'deactivate'
  | 'approve'
  | 'reject';

const DEFAULT_CRUD_ACTIONS: PermissionAction[] = [
  'view',
  'create',
  'edit',
  'delete',
];

const ACTION_DESCRIPTIONS: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete/block',
  assign: 'Assign',
  activate: 'Activate',
  deactivate: 'Deactivate',
  approve: 'Approve',
  reject: 'Reject',
};

/** One bespoke permission entry for a module whose actions don't fit the
 * shared `PermissionAction` verbs (e.g. `member_view`, `price_update`). */
export interface ExplicitPermissionDefinition {
  action: string;
  description: string;
}

export interface ModuleDefinition {
  key: string;
  module: string;
  label: string;
  /** What this module's records/accounts are called, for permission descriptions (e.g. "Sub Admin accounts"). Required when using `actions`. */
  subject?: string;
  /**
   * Defaults to the standard view/create/edit/delete set — only pass this
   * when a module doesn't support the full set (e.g. dashboard is view-only)
   * or needs an extra action (e.g. roles also supports `assign`). Ignored
   * when `permissions` is given.
   */
  actions?: PermissionAction[];
  /**
   * Explicit override for modules whose real actions don't reduce to the
   * shared verb set (e.g. `asset.finalize`, `broker.commission_withdrawal_approve`).
   * When present, this replaces `actions`/`subject` entirely for the module.
   */
  permissions?: ExplicitPermissionDefinition[];
}

/**
 * One entry per admin-manageable module — each maps to a real, enforced
 * endpoint (see the controller referenced in each module's comment below).
 * Adding a module here is enough: its `module.action` permissions are
 * generated below and picked up by `RolesService.getPermissionCatalog()` and
 * the seed script (`prisma/seeds/permission.seed.ts`, which upserts by key so
 * re-running `db:seed` after adding a module here delivers the new
 * permissions without touching existing role assignments).
 *
 * Deliberately NOT auto-derived from every Prisma model or every admin-usable
 * route: several existing admin-relevant endpoints are shared with non-admin
 * account types via the legacy `Role` enum and have no admin-exclusive
 * action to gate (e.g. `GET /group/:groupId`, `GET /accounts/:accountId`),
 * and a few spec'd admin features (RM Assignment, Tickets, Status Legend)
 * have no backend implementation at all yet — a permission checkbox that
 * isn't backed by a real guard is worse than no permission at all, so those
 * are intentionally absent here (see the RBAC implementation report for the
 * full list of findings).
 */
export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    key: 'mod_1',
    module: 'dashboard',
    label: 'Dashboard',
    subject: 'the admin dashboard',
    actions: ['view'],
  },
  {
    key: 'mod_2',
    module: 'sub-admins',
    label: 'Sub Admin Management',
    subject: 'Super Admin / Sub Admin accounts',
    // admin.controller.ts / admins.controller.ts
  },
  {
    key: 'mod_3',
    module: 'users',
    label: 'User Management',
    // accounts.controller.ts
    permissions: [
      { action: 'view', description: 'View customer account listing' },
      { action: 'create', description: 'Create a customer account' },
      { action: 'edit', description: 'Edit a customer account' },
      { action: 'activate', description: 'Reactivate a customer account' },
      { action: 'deactivate', description: 'Block a customer account' },
      {
        action: 'bank_view',
        description: "View a customer's bank/UPI account details",
      },
    ],
  },
  {
    key: 'mod_4',
    module: 'transactions',
    label: 'User Investments',
    subject: "customers' investments/transactions",
    actions: ['view'],
    // transactions.controller.ts (GET /users/transactions)
  },
  {
    key: 'mod_5',
    module: 'wallets',
    label: 'Wallets',
    // user-wallets.controller.ts
    permissions: [
      { action: 'view', description: "View a user's wallet activity" },
      { action: 'deposit', description: 'Manually credit a wallet' },
      { action: 'withdraw', description: 'Manually debit a wallet' },
    ],
  },
  {
    key: 'mod_6',
    module: 'kyc',
    label: 'KYC Review',
    subject: 'KYC submissions',
    actions: ['view', 'approve', 'reject'],
    // kyc.controller.ts
  },
  {
    key: 'mod_7',
    module: 'asset',
    label: 'Asset Review Queue & Governance',
    // asset.controller.ts — realizes spec's "Asset Review Queue",
    // "Governance & Asset Management", and Primary Group Management's
    // Properties write actions, since they're the same underlying endpoints.
    permissions: [
      { action: 'view', description: 'View the asset review queue' },
      {
        action: 'review_approve',
        description: "Approve an asset's basic information",
      },
      {
        action: 'review_reject',
        description: "Reject an asset's basic information",
      },
      {
        action: 'price_update',
        description: 'Update current price per fraction',
      },
      {
        action: 'finalize',
        description: 'Approve a live request and set the listing amount',
      },
      { action: 'fractionalize', description: 'Fractionalize an asset' },
      { action: 'update', description: 'Edit asset details' },
    ],
  },
  {
    key: 'mod_8',
    module: 'secondary_marketplace',
    label: 'Secondary Marketplace',
    // asset.controller.ts (switchToMarketPlace), marketplace.controller.ts (listings)
    permissions: [
      { action: 'view', description: 'View secondary marketplace listings' },
      {
        action: 'asset_enable',
        description: 'Enable an asset for secondary trading',
      },
    ],
  },
  {
    key: 'mod_9',
    module: 'category',
    label: 'Category Management',
    subject: 'property categories',
    actions: [
      'view',
      'create',
      'delete',
      'activate',
      'deactivate',
      'approve',
      'reject',
    ],
    // category.controller.ts
  },
  {
    key: 'mod_24',
    module: 'group',
    label: 'Group Listing',
    subject: 'investment groups',
    actions: ['view', 'create', 'edit', 'activate', 'deactivate', 'delete'],
    // group.controller.ts — GET endpoints are currently public and unauthenticated,
    // so `group.view` isn't wired to a guard yet (would need an auth requirement
    // added to those routes first) — catalog entry kept for role-design consistency.
  },
  {
    key: 'mod_10',
    module: 'primary_group',
    label: 'Primary Group Management',
    // group.controller.ts + join-group.controller.ts
    permissions: [
      {
        action: 'view',
        description:
          "View a primary group's details (not yet guard-enforced — see group.view)",
      },
      { action: 'member_view', description: "View a group's members" },
      { action: 'member_remove', description: 'Remove a member from a group' },
      {
        action: 'property_view',
        description: "View a group's listed properties",
      },
    ],
  },
  {
    key: 'mod_11',
    module: 'secondary_group',
    label: 'Secondary Group Management',
    // share-assets.controller.ts
    permissions: [
      {
        action: 'view',
        description:
          'View listed secondary-group assets (not yet guard-enforced — the underlying route is public)',
      },
      {
        action: 'club_create',
        description: 'Create a secondary club from paid interested members',
      },
      {
        action: 'manual_payment_view',
        description: 'View manual interest-payment submissions',
      },
      {
        action: 'manual_payment_approve',
        description: 'Approve a manual interest-payment submission',
      },
      {
        action: 'manual_payment_reject',
        description: 'Reject a manual interest-payment submission',
      },
    ],
  },
  {
    key: 'mod_12',
    module: 'nda_consent',
    label: 'NDA Consent',
    // club-membership.controller.ts
    permissions: [
      { action: 'view', description: 'View NDA consent / membership requests' },
      {
        action: 'review_approve',
        description: 'Approve a membership vote / NDA consent request',
      },
      {
        action: 'review_reject',
        description: 'Reject a membership vote / NDA consent request',
      },
    ],
  },
  {
    key: 'mod_13',
    module: 'vote',
    label: 'Club & Vote Management',
    // vote.controller.ts
    permissions: [
      { action: 'view', description: 'View votes' },
      {
        action: 'asset_voting_view',
        description: 'View voting summaries by asset',
      },
    ],
  },
  {
    key: 'mod_14',
    module: 'spv',
    label: 'SPV Management',
    // spv.controller.ts
    permissions: [
      { action: 'view', description: 'View SPVs' },
      { action: 'create', description: 'Create an SPV' },
      { action: 'enable', description: 'Enable an SPV' },
      { action: 'disable', description: 'Disable an SPV' },
      { action: 'members_view', description: "View an SPV's members" },
      {
        action: 'governance_view',
        description:
          'View SPV shareholder register, voting status, exit/liquidation tracker, and documents',
      },
    ],
  },
  {
    key: 'mod_15',
    module: 'broker',
    label: 'Broker Management',
    // broker.controller.ts
    permissions: [
      { action: 'view', description: "View a broker's profile/dashboard" },
      {
        action: 'lead_view',
        description: "View a broker's leads / referred properties",
      },
      {
        action: 'commission_view',
        description: "View a broker's commission history",
      },
      {
        action: 'commission_percentage_approve',
        description: "Approve a broker's commission-percentage request",
      },
      {
        action: 'commission_percentage_reject',
        description: "Reject a broker's commission-percentage request",
      },
      {
        action: 'commission_withdrawal_approve',
        description: "Approve a broker's commission withdrawal request",
      },
      {
        action: 'commission_withdrawal_reject',
        description: "Reject a broker's commission withdrawal request",
      },
    ],
  },
  {
    key: 'mod_16',
    module: 'manual_payment',
    label: 'Manual Payments',
    // payment-request.controller.ts (type: manual) — `view` isn't wired to a
    // guard yet: findAll is a single endpoint shared across all three
    // request types and end users' own history, with no per-type admin
    // listing route to attach a distinct permission to.
    permissions: [
      { action: 'view', description: 'View manual payment requests' },
      { action: 'approve', description: 'Approve a manual payment request' },
      { action: 'reject', description: 'Reject a manual payment request' },
    ],
  },
  {
    key: 'mod_17',
    module: 'deposit_request',
    label: 'Deposit Requests',
    // payment-request.controller.ts (type: deposit, and direct group payments)
    permissions: [
      { action: 'view', description: 'View deposit requests' },
      { action: 'approve', description: 'Approve a deposit request' },
      { action: 'reject', description: 'Reject a deposit request' },
    ],
  },
  {
    key: 'mod_18',
    module: 'withdrawal_request',
    label: 'Withdrawal Requests',
    // payment-request.controller.ts (type: withdrawal)
    permissions: [
      { action: 'view', description: 'View withdrawal requests' },
      { action: 'approve', description: 'Approve a withdrawal request' },
      { action: 'reject', description: 'Reject a withdrawal request' },
    ],
  },
  {
    key: 'mod_19',
    module: 'compliance_report',
    label: 'Compliance Reports',
    // reports/exports.controller.ts
    permissions: [
      { action: 'view', description: 'View compliance report options' },
      { action: 'user_export', description: 'Export users as CSV' },
      { action: 'asset_export', description: 'Export assets as CSV' },
      {
        action: 'transaction_export',
        description: 'Export transactions as CSV',
      },
    ],
  },
  {
    key: 'mod_20',
    module: 'reports',
    label: 'Reports',
    subject: 'platform/KYC/asset/funding/broker CSV reports',
    actions: ['view'],
    // reports/reports.controller.ts — discovered beyond the original spec
  },
  {
    key: 'mod_21',
    module: 'overview',
    label: 'Admin Overview',
    subject: 'the admin overview dashboard',
    actions: ['view'],
    // overview.controller.ts
  },
  {
    key: 'mod_22',
    module: 'roles',
    label: 'Roles & Privileges',
    subject: 'roles and permissions',
    actions: [...DEFAULT_CRUD_ACTIONS, 'assign', 'activate', 'deactivate'],
  },
  {
    key: 'mod_23',
    module: 'system',
    label: 'System Settings',
    subject: 'system settings',
    actions: ['view', 'edit'],
  },
];

// `module` is what actually goes into the DB and into every `@RequirePermissions`
// call throughout the app — it must be unique. `key` (mod_N) is a separate,
// purely cosmetic module identifier not read anywhere else yet; it must also
// be unique on its own, but is NOT part of the permission key (see
// PERMISSION_CATALOG below) — mixing the two up once already produced
// duplicate/broken permission keys.
for (const field of ['module', 'key'] as const) {
  const seen = new Set<string>();
  for (const definition of MODULE_DEFINITIONS) {
    const value = definition[field];
    if (seen.has(value)) {
      throw new Error(
        `Duplicate ModuleDefinition.${field} "${value}" in permission-catalog.constant.ts — every module needs a unique ${field}.`,
      );
    }
    seen.add(value);
  }
}

export const PERMISSION_GROUPS: PermissionGroupDefinition[] =
  MODULE_DEFINITIONS.map((definition) => ({
    module: definition.module,
    label: definition.label,
  }));

export const PERMISSION_CATALOG: PermissionDefinition[] =
  MODULE_DEFINITIONS.flatMap((definition) => {
    const entries: ExplicitPermissionDefinition[] = definition.permissions
      ? definition.permissions
      : (definition.actions ?? DEFAULT_CRUD_ACTIONS).map((action) => ({
          action,
          description: `${ACTION_DESCRIPTIONS[action]} ${definition.subject}`,
        }));

    return entries.map(({ action, description }) => ({
      key: `${definition.module}.${action}`,
      module: definition.module,
      action,
      description,
    }));
  });

export const ADMINISTRATOR_ROLE_NAME = 'Administrator';
export const STANDARD_ACCESS_ROLE_NAME = 'Standard Access';
export const STANDARD_ACCESS_ROLE_PERMISSIONS = ['dashboard.view'];
