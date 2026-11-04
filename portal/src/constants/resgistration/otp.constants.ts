import type { IFieldConfig } from '@/interface';

export const verifyOtps: IFieldConfig[] = [
  {
    name: 'emailOTP',
    label: 'Verify Email',
    type: 'otp',
    length: 6,
    inputType: 'email',
    validation: {
      required: 'Email OTP is required',
      minLength: { value: 6, message: 'Enter the 6-digit OTP' },
      maxLength: { value: 6, message: 'Enter the 6-digit OTP' },
    },
    required: true,
    extraText: 'Enter the OTP sent to your email',
    autoFocus: true,
  },
  {
    name: 'mobileOTP',
    label: 'Verify Mobile Number',
    type: 'otp',
    length: 6,
    inputType: 'mobile',
    validation: {
      required: 'Mobile OTP is required',
      minLength: { value: 6, message: 'Enter the 6-digit OTP' },
      maxLength: { value: 6, message: 'Enter the 6-digit OTP' },
    },
    required: true,
    extraText: 'Enter the OTP sent to your mobile number',
    autoFocus: false,
  },
];
