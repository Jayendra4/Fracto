import { BankAccount } from '@/types';
import { apiSlice } from './apiSlice';

export const bankApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccounts: builder.query<
      BankAccount[],
      { search?: string; fromDate?: string; toDate?: string }
    >({
      query: ({ search, fromDate, toDate }) => ({
        url: '/bank-account/me',
        params: { search, fromDate, toDate },
      }),
    }),
    // to new 5 update

    getBankAccountById: builder.query<BankAccount, number>({
      query: (accountId) => `/bank-account/${accountId}`,
      providesTags: ['BankAccount'],
    }),
    toggleBankAccountStatus: builder.mutation<void, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/bank-account/bank-account/${id}/active`,
        method: 'PATCH',
        body: { isActive },
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
} = bankApi;
