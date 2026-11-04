import type { ReactNode } from 'react';

export interface ISignupModalPayload {
  title: string;
  subtitle?: ReactNode;
  text: string;
}

export type SignupStep = 0 | 1 | 2 | 3 | 4;

export interface ISignupInitialValues {
  firstName?: string;
  lastName?: string;
  email?: string;
  number?: string;

  emailOTP?: string[];
  mobileOTP?: string[];

  password?: string;
  confirmPassword?: string;

  accountType?: string;
  country?: string;
}

export interface SplitDialResult {
  country: string;
  dialCode: string;
  mobile: string;
}
