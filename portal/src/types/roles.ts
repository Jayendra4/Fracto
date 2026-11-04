export const companyRoles = [
  'company',
  'developer',
  'assetowner',
  'spv',
] as const;

export type Roles =
  | 'corporateinvestor'
  | 'broker'
  | (typeof companyRoles)[number];

export const formatRole = (role?: string) => {
  if (!role) return '';

  return role
    .replace(/([a-z])([A-Z])/g, '$1 $2')

    .replace(/investor/i, ' Investor')
    .replace(/asset/i, 'Asset ')
    .replace(/owner/i, 'Owner')
    .replace(/spv/i, 'SPV')
    .trim()

    .replace(/\b\w/g, (char) => char.toUpperCase());
};
