import { apiSlice } from './apiSlice';
import { Admin } from '@/types';

export interface UpdateAdminPayload {
  firstname: string;
  lastname: string;
  dialCode?: string;
  mobile?: string;
  profileImage?: string | null;
  country?: string;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET profile
    getAdminProfile: builder.query<Admin, void>({
      query: () => '/admin',
      providesTags: ['User'],
    }),

    // PATCH profile
    updateAdminProfile: builder.mutation<void, UpdateAdminPayload>({
      query: (body) => ({
        url: '/admin',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<void, { oldPassword: string; newPassword: string }>({
      query: (body) => ({
        url: '/admin/change-password',
        method: 'POST',
        body,
      }),
    }),
    changeProfileImage: builder.mutation<{ profileImage: string }, { profileImage: string }>({
      query: (body) => ({
        url: '/admin/profile-image',
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
