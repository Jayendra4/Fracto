import type { IFieldConfig } from '@/interface';

export const loginFields: IFieldConfig[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter Your Email',
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^(\+?\d{10,15}|[^\s@]+@[^\s@]+\.[^\s@]+)$/,
        message: 'Enter a valid email',
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
