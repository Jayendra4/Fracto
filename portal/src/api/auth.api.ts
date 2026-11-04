import type {
  IApiResponse,
  IAuthLoginReq,
  IAuthLoginRes,
  IAuthRegisterReq,
  IAuthRegisterRes,
  IAuthSendCodeReq,
  IAuthSendCodeRes,
  IAuthVerifyCodeReq,
  IAuthVerifyCodeRes,
  IAuthForgotPasswordReq,
  IAuthForgotPasswordRes,
  IAuthResetPasswordReq,
  IAuthResetPasswordRes,
  ICheckIdentifierReq,
  ICheckIdentifierRes,
  IUpdateProfileReq,
} from '@/interface';
import { axiosRequest } from '@/services';
import { useMutation, useQuery } from '@tanstack/react-query';

export const authLoginApi = async (
  data: IAuthLoginReq
): Promise<IApiResponse<IAuthLoginRes>> => {
  return axiosRequest<IAuthLoginRes>({
    method: 'POST',
    endpoint: '/auth/login',
    data,
  });
};

export const authSendOtpCodeApi = async (
  data: IAuthSendCodeReq
): Promise<IApiResponse<IAuthSendCodeRes>> => {
  return axiosRequest<IAuthSendCodeRes>({
    method: 'POST',
    endpoint: '/auth/send-code',
    data,
  });
};

export const authVerifyCodeApi = async (
  data: IAuthVerifyCodeReq
): Promise<IApiResponse<IAuthVerifyCodeRes>> => {
  return axiosRequest<IAuthVerifyCodeRes>({
    method: 'POST',
    endpoint: '/auth/verify-code',
    data,
  });
};

export const authRegisterApi = async (
  data: IAuthRegisterReq
): Promise<IApiResponse<IAuthRegisterRes>> => {
  return axiosRequest<IAuthRegisterRes>({
    method: 'POST',
    endpoint: '/auth/register',
    data,
  });
};

export const authCheckIdentifierApi = async (
  data: ICheckIdentifierReq
): Promise<IApiResponse<ICheckIdentifierRes>> => {
  return axiosRequest<ICheckIdentifierRes>({
    method: 'POST',
    endpoint: '/auth/check-identifier',
    data,
  });
};

export const authUpdateProfileApi = async (
  data: IUpdateProfileReq
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'PATCH',
    endpoint: '/accounts/me',
    data,
  });
};

export const fetchProfileApi = async (token: string) => {
  return await axiosRequest<any>({
    method: 'GET',
    endpoint: '/accounts/me',
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });
};

export const authVerifyPasswordApi = async (data: {
  email?: string;
  mobile?: string;
  password: string;
}): Promise<IApiResponse<{ valid: boolean }>> => {
  return axiosRequest<{ valid: boolean }>({
    method: 'POST',
    endpoint: '/auth/verify-password',
    data,
  });
};

export function useLogin() {
  return useMutation({
    mutationFn: (data: IAuthLoginReq) => authLoginApi(data),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (data: IAuthSendCodeReq) => authSendOtpCodeApi(data),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: IAuthVerifyCodeReq) => authVerifyCodeApi(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: IAuthRegisterReq) => authRegisterApi(data),
  });
}

export function useCheckIdentifier() {
  return useMutation({
    mutationFn: (data: ICheckIdentifierReq) => authCheckIdentifierApi(data),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: IUpdateProfileReq) => authUpdateProfileApi(data),
  });
}

export function useProfile(token?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['profile', token],
    queryFn: () => fetchProfileApi(token!),

    enabled: (options?.enabled ?? true) && !!token,

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,

    retry: (count, error: any) => {
      if (error?.response?.status === 401) return false;
      return count < 2;
    },
  });
}

export function useVerifyPassword() {
  return useMutation({
    mutationFn: (data: { email?: string; mobile?: string; password: string }) =>
      authVerifyPasswordApi(data),
  });
}

export const authForgotPasswordApi = async (
  data: IAuthForgotPasswordReq
): Promise<IApiResponse<IAuthForgotPasswordRes>> => {
  return axiosRequest<IAuthForgotPasswordRes>({
    method: 'POST',
    endpoint: '/auth/forgot-password',
    data,
  });
};

export const authResetPasswordApi = async (
  data: IAuthResetPasswordReq
): Promise<IApiResponse<IAuthResetPasswordRes>> => {
  return axiosRequest<IAuthResetPasswordRes>({
    method: 'POST',
    endpoint: '/auth/reset-password',
    data,
  });
};

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: IAuthForgotPasswordReq) => authForgotPasswordApi(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: IAuthResetPasswordReq) => authResetPasswordApi(data),
  });
}
