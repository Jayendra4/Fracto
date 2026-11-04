import { BankAccount } from '@/types';
import { apiSlice } from './apiSlice';

export const accountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccounts: builder.query<BankAccount[], { search?: string } | void>({
      query: (params) => ({
        url: '/bank-account/me',
        params: params?.search ? { search: params.search } : {},
      }),
      providesTags: ['BankAccount'],
    }),

    getBankAccountById: builder.query<BankAccount, number>({
      query: (accountId) => `/bank-account/${accountId}`,
      providesTags: ['BankAccount'],
    }),
    toggleBankAccountStatus: builder.mutation<BankAccount, { id: number }>({
      query: ({ id }) => ({
        url: `/bank-account/bank-account/${id}/active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['BankAccount'],
    }),
    createBankAccount: builder.mutation<
      any,
      {
        accountHolderName: string;
        bankName: string;
        accountNumber: string;
        ifscCode: string;
      }
    >({
      query: (body) => ({
        url: '/bank-account',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BankAccount'],
    }),
  }),
});

export const {
  useGetBankAccountsQuery,
  useGetBankAccountByIdQuery,
  useToggleBankAccountStatusMutation,
  useCreateBankAccountMutation,
} = accountsApi;
