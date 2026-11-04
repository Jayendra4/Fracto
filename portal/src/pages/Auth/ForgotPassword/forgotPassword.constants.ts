import type { IFieldConfig } from '@/interface';

export const getForgotFields = (
  activeTab: 'email' | 'mobile'
): IFieldConfig[] => {
  if (activeTab === 'email') {
    return [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter Your Email',
        validation: {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email address',
          },
        },
      },
    ];
  }

  return [
    {
      name: 'mobile',
      label: 'Mobile',
      type: 'contact',
      placeholder: 'Enter Your Mobile Number',
      validation: {
        required: 'Mobile number is required',
        validate: (value: string) =>
          /^(\+91[6-9]\d{9}|\+971\d{9})$/.test(value) ||
          'Enter a valid mobile number',
      },
    },
  ];
};


export const MOBILE_REGEX = {
  INDIA: /^\+91[6-9]\d{9}$/,
  UAE: /^\+971\d{9}$/,
};

export const isValidMobile = (mobile: string): boolean => {
  return (
    MOBILE_REGEX.INDIA.test(mobile) ||
    MOBILE_REGEX.UAE.test(mobile)
  );
};


