export interface IAuthLoginReq {
  email?: string;
  phone?: string;
  password: string;
  userType?: string;
  emailVerificationCode?: string;
  mobileVerificationCode?: string;
  loginPanel: 'User';
}

export interface IAuthLoginRes {
  accessToken: string;
  type: string;
}

export interface IAuthSignupReq {
  username: string;
  email: string;
  password: string;
  dialCode: string;
  mobile: string;
  country: string;
  emailVerificationCode: string;
  mobileVerificationCode: string;
}

export type IAuthSignupRes = IAuthLoginRes;

export interface IAuthSendCodeReq {
  email?: string;
  country?: string;
  mobile?: string;
  type?: string;
}

export interface IAuthSendCodeRes {
  success: boolean;
  message: string;
  email?: string;
  mobile?: string;
}

export interface IAuthVerifyCodeReq {
  email: string;
  emailCode: string;
  mobileCode: string;
  dialCode: string;
  mobile: string;
}

export interface IAuthVerifyCodeRes {
  success: boolean;
  message: string;
  verified: boolean;
}

export interface IAuthRegisterReq {
  firstname: string;
  lastname: string;
  email: string;
  countryId: string;
  dialCode: string;
  emailVerificationCode: string;
  mobileVerificationCode: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  accountType?: string;
  referralCode?: string;
}

export interface IAuthRegisterRes {
  success: boolean;
  message: string;
  user: {
    id: string | number;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken?: string;
  type?: string;
}

// ---- Forgot Password -----------
export interface IAuthForgotPasswordReq {
  email?: string;
  mobile?: string;
}

export interface IAuthForgotPasswordRes {
  message: string;
}

export interface IAuthResetPasswordReq {
  email?: string;
  mobile?: string;
  code: string;
  newPassword: string;
}

export interface IAuthResetPasswordRes {
  message: string;
}

export interface ICheckIdentifierReq {
  email: string;
  mobile: string;
}

export interface ICheckIdentifierRes {
  exists: boolean;
  message?: string;
}

export interface IUpdateProfileReq {
  username?: string;
  firstname?: string;
  lastname?: string;
  type?: string;
  email?: string;
  dialCode?: string;
  mobile?: string;
  country?: string;
  meta?: {
    occupation?: string;
    monthlyIncome?: string;
    panNumber?: string;
    passportNumber?: string;
    dateOfBirth?: string;
  };
}

// --- change password ---
export interface IAuthChangePasswordReq {
  oldPassword: string;
  newPassword: string;
}

export interface IAuthChangePasswordRes {
  message: string;
}
