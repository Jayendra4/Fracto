import {
  Account,
  AccountDetail,
  BankAccount,
  CountryData,
  PaginatedResponse,
  RegisterUserPayload,
  UpiAccount,
} from '@/types';
import { apiSlice } from './apiSlice';
import { RegisterInvestorResponse } from './authApi';
import { PaymentRequestResponse } from './paymentRequestApi';

export const accountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<
      PaginatedResponse<Account>,
      {
        skip?: number;
        take?: number;
        search?: string;
        email?: string;
        phone?: string;
        accountType?: string;
        fromDate?: string;
        toDate?: string;
        kycStatus?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, accountType, fromDate, toDate, email, phone, kycStatus }) => ({
        url: '/accounts',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          accountType,
          fromDate,
          toDate,
          kycStatus,
        },
      }),
      // one new update - This ensures the cache resets whenever ANY parameter changes
      providesTags: (result, error, arg) => [
        { type: 'Accounts', id: 'LIST' },
        { type: 'Accounts', id: `${arg.accountType}-${arg.kycStatus}-${arg.search}-${arg.skip}` }
      ],
    }),
  //   providesTags: ['Accounts'],
  // }),
  getAccountById: builder.query<AccountDetail, number>({
    query: (accountId) => `/accounts/${accountId}`,
    providesTags: ['Accounts'],
  }),

  getCountries: builder.query<CountryData, void>({
    query: () => ({
      url: '/location/countries',
      method: 'GET',
    }),
  }),

  registerUser: builder.mutation<RegisterInvestorResponse, RegisterUserPayload>({
    query: (payload) => ({
      url: '/accounts/create',
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
  updateUserStatus: builder.mutation<
    void,
    {
      accountId: number;
      status?: 'Active' | 'Suspended' | 'Blocked';
      isDeleted?: boolean;
    }
  >({
    query: ({ accountId, ...body }) => ({
      url: `/accounts/${accountId}`,
      method: 'PATCH',
      body,
    }),
    invalidatesTags: ['Accounts'],
  }),
}),
});

export const {
  useGetAccountsQuery,
  useGetCountriesQuery,
  useGetAccountByIdQuery,
  useRegisterUserMutation,
  useGetUserBankAccountsQuery,
  useGetUserUpiAccountsQuery,
  useGetAccountStatementQuery,
  useUpdateUserStatusMutation,
} = accountsApi;
