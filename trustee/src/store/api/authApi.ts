import { apiSlice } from './apiSlice';
import {
  CountryData,
  LoginCredentials,
  LoginResponse,
  RegisterUserPayload,
  sendOtpPayload,
} from '@/types';

export interface RegisterInvestorResponse {
  message: string;
}
export interface sendOtpResponse {
  message: string;
}
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    registerUser: builder.mutation<RegisterInvestorResponse, RegisterUserPayload>({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Auth'],
    }),
    sendOtp: builder.mutation<sendOtpResponse, sendOtpPayload>({
      query: (payload) => ({
        url: '/auth/send-code',
        method: 'POST',
        body: payload,
      }),
      // invalidatesTags: ['Accounts'],
    }),
    getCountries: builder.query<CountryData, void>({
      query: () => ({
        url: '/location/countries',
        method: 'GET',
      }),
    }),
    forgotPassword: builder.mutation<void, { mobile?: string; email?: string }>({
      query: (payload) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: payload,
      }),
    }),
    resetPassword: builder.mutation<
      void,
      { code: string; newPassword: string; mobile?: string; email?: string }
    >({
      query: (payload) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCountriesQuery,
  useRegisterUserMutation,
  useSendOtpMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
