import type { IFieldConfig } from '@/interface';
import { passwordValidation } from './password.validation';
export const resetFields: IFieldConfig[] = [
  {
    name: 'otp',
    label: 'OTP Verification',
    type: 'otp',
    required: true,
  },
  {
    name: 'password',
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
        value === formValues.password || 'Passwords do not match',
    },
    required: true,
    showToggle: true,
  },
];
