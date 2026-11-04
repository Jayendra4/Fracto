import type { IFieldConfig } from '@/interface';

export const loginFields2: IFieldConfig[] = [
  {
    name: 'mobile',
    label: 'Mobile',
    type: 'contact',
    placeholder: 'Enter Your Mobile Number',
    validation: {
      required: ' Mobile Number is required',
      pattern: {
        value: /^(\+?\d{10,15}|[^\s@]+@[^\s@]+\.[^\s@]+)$/,
        message: 'Enter a valid Mobile Number ',
      },
    },
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter Your Password',
    validation: {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters long',
      },
    },
    showToggle: true,
  },
];
