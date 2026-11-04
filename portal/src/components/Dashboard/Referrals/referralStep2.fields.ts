import type { IFieldConfig } from '@/interface';
import { MOBILE_REGEX } from '@/pages/Auth/ForgotPassword/forgotPassword.constants';

export const getReferralStep2Fields = (
  referralType: 'asset' | 'investor'
): IFieldConfig[] => {
  const isAsset = referralType === 'asset';

  return [
    // Name
    {
      name: 'name',
      label: isAsset ? 'Asset Owner’s Name' : 'Investor’s Name',
      type: 'text',
      placeholder: isAsset
        ? 'Enter Asset Owner’s Name'
        : 'Enter Investor’s Name',
      validation: {
        required: 'Name is required',
      },
    },

    // Email
    {
      name: 'email',
      label: isAsset ? 'Asset Owner’s Email' : 'Investor’s Email',
      type: 'email',
      placeholder: isAsset
        ? 'Enter Asset Owner’s Email'
        : 'Enter Investor’s Email',
      validation: {
        required: 'Email is required',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Invalid email address',
        },
      },
    },

    // Mobile (optional)
    {
      name: 'mobile',
      label: `${isAsset ? 'Asset Owner’s' : 'Investor’s'} Mobile Number`,
      type: 'contact',
      placeholder: isAsset
        ? 'Enter Asset Owner’s Mobile Number'
        : 'Enter Investor’s Mobile Number',
      validation: {
        validate: (value: string) =>
          !value ||
          MOBILE_REGEX.INDIA.test(value) ||
          MOBILE_REGEX.UAE.test(value) ||
          'Enter a valid mobile number',
      },
      extraText: '(Optional)',
    },
  ];
};
