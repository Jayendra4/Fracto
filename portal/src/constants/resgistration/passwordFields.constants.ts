import type { IFieldConfig } from '@/interface';

export const passwordFields: IFieldConfig[] = [
  {
    name: 'password',
    label: 'Create Password',
    type: 'password',
    placeholder: 'Enter a strong password',
    validation: {
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters',
      },
      pattern: {
        value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        message:
          'Password must include 1 uppercase, 1 number, and 1 special character',
      },
    },
    required: true,
    showToggle: true,
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Re-enter your password',
    validation: {
      required: 'Confirm Password is required',
    },
    required: true,
    showToggle: true,
  },
];
