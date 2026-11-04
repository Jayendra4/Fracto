import { Account, AccountDetail, CompanyKycDetailsResponse, Kyc, PaginatedResponse } from '@/types';
import { apiSlice } from './apiSlice';

export interface KycPayload {
  panNumber: string;
  dob: string;
  occupation: string;
  monthlyIncome: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  documents: {
    type: string;
    url: string;
  }[];
}

export interface KycDetail {
  id: number;
  accountId: number;
  status: string;
  panNumber: string | null;
  dateOfBirth: string | null;
  passportNumber: string | null;
  occupation: string | null;
  monthlyIncome: string | null;
  [key: string]: any;
}
export enum KycStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
}
export enum KybStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface KycRequest {
  id: number;
  status: KycStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  verifier: string;
  account: Account;
}
export interface KycRequestCompany {
  id: number;
  kycStatus: KycStatus;
  kybStatus: KycStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  verifier: string;
  account: Account;
  overallStatus: string;
}

export const kycApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitKyc: builder.mutation<void, { id: string; payload: KycPayload }>({
      query: ({ id, payload }) => ({
        url: `/kyc/${id}`,
        method: 'POST',
        body: payload,
      }),
    }),
    getKycAccounts: builder.query<
      PaginatedResponse<KycRequest>,
      {
        skip?: number;
        take?: number;
        search?: string;
        status?: KycStatus;
        fromDate?: string;
        toDate?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, status, fromDate, toDate }) => ({
        url: '/kyc',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(fromDate ? { fromDate } : {}),
          ...(toDate ? { toDate } : {}),
        },
      }),
      providesTags: ['Kyc'],
    }),
    getCompanyKycAccounts: builder.query<
      PaginatedResponse<KycRequestCompany>,
      { skip?: number; take?: number; search?: string; status?: KycStatus; fromDate?: string; toDate?: string }
    >({
      query: ({ skip = 0, take = 10, search, status, fromDate, toDate }) => ({
        url: '/kyc/company',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
          status,
          fromDate,
          toDate,
        },
      }),
      providesTags: ['CompanyKyc'],
    }),
    updateKycStatus: builder.mutation<
      void,
      {
        id: number;
        action: KycStatus;
        rejectionReason?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/kyc/${id}/verify`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Kyc', 'Accounts'],
    }),
    updateCompanyKycStatus: builder.mutation<
      void,
      {
        id: number;
        status: KycStatus;
        remarks?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/kyc/company/${id}/verify`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CompanyKyc', 'Accounts'],
    }),
    createKyc: builder.mutation<any, any>({
      query: (payload) => ({
        url: '/accounts/kyc/update',
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['Kyc'],
    }),
    getCompanyKycDetailsId: builder.query<CompanyKycDetailsResponse, number>({
      query: (companyId) => ({
        url: `/kyc/company/${companyId}`,
        method: 'GET',
      }),
      providesTags: ['Accounts'],
    }),
    getKycById: builder.query<KycDetail, number>({
      query: (kycId) => ({
        url: `/kyc/${kycId}`,
        method: 'GET',
      }),
      providesTags: ['Kyc'],
    }),
  }),
});

export const {
  useSubmitKycMutation,
  useGetKycAccountsQuery,
  useUpdateKycStatusMutation,
  useCreateKycMutation,
  useGetCompanyKycAccountsQuery,
  useGetCompanyKycDetailsIdQuery,
  useUpdateCompanyKycStatusMutation,
  useGetKycByIdQuery,
} = kycApi;
