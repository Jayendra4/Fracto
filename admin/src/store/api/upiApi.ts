import { UpiAccount } from '@/types';
import { apiSlice } from './apiSlice';

export const upiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUpiAccounts: builder.query<UpiAccount[], { search?: string; fromDate?: string; toDate?: string } | void>({
      query: (params) => ({
        url: '/upi-account/me',
        params: params?.search ? { search: params.search } : {},
      }),
      providesTags: ['UpiAccount'],
    }),

    toggleUpiStatus: builder.mutation<void, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/upi-account/upi-account/${id}/active`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['UpiAccount'],
    }),
    createUpiAccount: builder.mutation<
      any,
      {
        upiId: string;
        qrCode: string | null;
      }
    >({
      query: (body) => ({
        url: '/upi-account',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UpiAccount'],
    }),
  }),
});

export const { useGetUpiAccountsQuery, useToggleUpiStatusMutation, useCreateUpiAccountMutation } =
  upiApi;
