import type { IFieldConfig } from '@/interface';

export const getReferralStep1Fields = (): IFieldConfig[] => [
  {
    name: 'referralType',
    label: 'How Referral Is For?',
    type: 'select',
    placeholder: 'Select The User Type',
    options: [
      { label: 'Asset Owner Referrals', value: 'asset' },
      { label: 'Investor Referrals', value: 'investor' },
    ],
    validation: {
      required: 'Referral type is required.',
    },
  },
];
