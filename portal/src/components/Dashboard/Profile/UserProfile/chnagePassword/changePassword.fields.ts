import type { IFieldConfig } from '@/interface';
import { passwordValidation } from '@/pages/Auth/ForgotPassword/password.validation';

export const changePasswordFields: IFieldConfig[] = [
  {
    name: 'oldPassword',
    label: 'Current Password',
    type: 'password',
    placeholder: 'Enter current password',
    required: true,
    validation: {
      required: 'Current password is required',
    },
    showToggle: true,
  },
  {
    name: 'newPassword',
    label: 'New Password',
    type: 'password',
    placeholder: 'Enter Your Password',
    validation: passwordValidation,
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
      validate: (value, formValues) =>
        value === formValues.newPassword || 'Passwords do not match',
    },
    required: true,
    showToggle: true,
  },
];
