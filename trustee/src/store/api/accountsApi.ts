import {
  Account,
  AccountDetail,
  BankAccount,
  PaginatedResponse,
  RegisterInvestorPayload,
  UpiAccount,
} from '@/types';
import { apiSlice } from './apiSlice';
import { RegisterInvestorResponse } from './authApi';

export interface PaymentRequestResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

export const accountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<
      PaginatedResponse<Account>,
      {
        skip?: number;
        take?: number;
        search?: string;
        accountType?: string;
        fromDate?: string;
        toDate?: string;
        status?: string;
        kycStatus?: string;
      }
    >({
      query: ({
        skip = 0,
        take = 10,
        search,
        accountType,
        fromDate,
        toDate,
        status,
        kycStatus,
      }) => ({
        url: '/accounts',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
          ...(accountType ? { accountType } : {}),
          ...(fromDate ? { fromDate } : {}),
          ...(toDate ? { toDate } : {}),
          ...(status ? { status } : {}),
          ...(kycStatus ? { kycStatus } : {}),
        },
      }),
      providesTags: ['Accounts'],
    }),
    getAccountById: builder.query<AccountDetail, number>({
      query: (accountId) => `/accounts/${accountId}`,
      providesTags: ['Accounts'],
    }),
    registerInvestor: builder.mutation<RegisterInvestorResponse, RegisterInvestorPayload>({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Accounts'],
    }),

    getUserBankAccounts: builder.query<BankAccount[], number>({
      query: (accountId) => ({
        url: `/accounts/${accountId}/bank-accounts`,
        method: 'GET',
      }),
      providesTags: ['Accounts'],
    }),
    getAccountStatement: builder.query<PaymentRequestResponse<any>, any>({
      query: (params) => ({
        url: '/payment-request',
        method: 'GET',
        params,
      }),
      providesTags: ['Accounts'],
    }),
    getUserUpiAccounts: builder.query<UpiAccount[], number>({
      query: (accountId) => ({
        url: `/accounts/${accountId}/upi-accounts`,
        method: 'GET',
      }),
      providesTags: ['Accounts'],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useLazyGetAccountByIdQuery,
  useRegisterInvestorMutation,
  useGetUserBankAccountsQuery,
  useGetUserUpiAccountsQuery,
  useGetAccountStatementQuery,
} = accountsApi;
