// src/store/api/adminApi.ts
import { apiSlice } from './apiSlice';
import { Admin } from '@/types';

export interface UpdateAdminPayload {

  firstname: string;
  lastname: string;
  email: string;
  dialCode?: string;
  mobile?: string;
  profileImage?: string | null;
  country?: string;
  accountType?: string;
  pan?: string;
  dateOfBirth?: string;
  occupation?: string;
  monthlyIncome?: string;
  meta?: {
    panNumber?: string;
    dateOfBirth?: string;
    occupation?: string;
    monthlyIncome?: string;
    passportNumber?: string;
  };
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /accounts/me
    getAdminProfile: builder.query<Admin, void>({
      query: () => '/accounts/me',
      providesTags: ['User'],
    }),

    // PATCH /accounts/me
    updateAdminProfile: builder.mutation<Admin, UpdateAdminPayload>({
      query: (body) => ({
        url: '/accounts/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User', 'Accounts'],
    }),

    // POST /accounts/me/change-password
    changePassword: builder.mutation<void, { oldPassword: string; newPassword: string }>({
      query: (body) => ({
        url: '/accounts/me/change-password',
        method: 'POST',
        body,
      }),
    }),

    // POST /accounts/me/profile-image
    changeProfileImage: builder.mutation<{ profileImage: string }, { profileImage: string }>({
      query: (body) => ({
        url: '/accounts/me/profile-image',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAdminProfileQuery,
  useLazyGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useChangePasswordMutation,
  useChangeProfileImageMutation,
} = adminApi;