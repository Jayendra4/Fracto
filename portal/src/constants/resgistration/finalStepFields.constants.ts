import type { IFieldConfig } from '@/interface';

export const buildFinalStepFields = (
  countries: { id: string; name: string }[]
): IFieldConfig[] => [
  {
    name: 'accountType',
    label: 'Account Type',
    type: 'select',
    required: true,
    placeholder: 'Select account type',
    options: [
      { label: 'Company', value: 'Company' },
      // { label: 'Developer', value: 'Developer' },
      // { label: 'SPV', value: 'Spv' },
      { label: 'Channel Partner', value: 'Broker' },
      { label: 'Asset Owner', value: 'AssetOwner' },
    ],
    validation: {
      required: 'Account type is required',
    },
  },

  {
    name: 'countryId',
    label: 'Country',
    type: 'select',
    required: true,
    placeholder: 'Select country',

    options: countries.map((c) => ({
      label: c.name,
      value: c.id,
    })),

    validation: {
      required: 'Country is required',
    },
  },

  {
    name: 'referralCode',
    label: 'Referral Code',
    type: 'text',
    placeholder: 'Enter referral code',
    required: false,
  },
];
