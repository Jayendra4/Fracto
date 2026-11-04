import { Account, AccountDetail, CompanyKycDetailsResponse, PaginatedResponse } from '@/types';
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

export enum KycStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Pending = 'Pending',
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
  kybSubmittedAt: string | number | Date;
  createdAt: string | number | Date;
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
        userType?: string;
      }
    >({
      query: (params) => {
        const queryParams: any = {
          skip: params.skip ?? 0,
          take: params.take ?? 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.status) queryParams.status = params.status;
        if (params.fromDate) queryParams.fromDate = params.fromDate;
        if (params.toDate) queryParams.toDate = params.toDate;
        if (params.userType) queryParams.userType = params.userType;

        return {
          url: '/kyc',
          params: queryParams,
        };
      },
      providesTags: ['Kyc'],
    }),
    getCompanyKycAccounts: builder.query<
      PaginatedResponse<KycRequestCompany>,
      {
        skip?: number;
        take?: number;
        search?: string;
        status?: KycStatus;
        fromDate?: string;
        toDate?: string;
      }
    >({
      query: (params) => {
        const queryParams: any = {
          skip: params.skip ?? 0,
          take: params.take ?? 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.status) queryParams.status = params.status;
        if (params.fromDate) queryParams.fromDate = params.fromDate;
        if (params.toDate) queryParams.toDate = params.toDate;

        return {
          url: '/kyc/company',
          params: queryParams,
        };
      },
      providesTags: ['Kyc'],
    }),
    getTrusteeKycAccounts: builder.query<
      PaginatedResponse<KycRequest>,
      {
        skip?: number;
        take?: number;
        search?: string;
        status?: KycStatus;
        fromDate?: string;
        toDate?: string;
        accountType?: string;
      }
    >({
      query: (params) => {
        const queryParams: any = {
          skip: params.skip ?? 0,
          take: params.take ?? 10,
          userType: 'Trustee',
        };
        if (params.search) queryParams.search = params.search;
        if (params.status) queryParams.status = params.status;
        if (params.accountType) queryParams.accountType = params.accountType;

        return {
          url: '/kyc',
          params: queryParams,
        };
      },
      providesTags: ['Kyc'],
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
      invalidatesTags: ['Kyc'],
    }),
    getCompanyKycDetailsId: builder.query<CompanyKycDetailsResponse, number>({
      query: (companyId) => ({
        url: `/kyc/company/${companyId}`,
        method: 'GET',
      }),
      providesTags: ['Kyc'],
    }),
  }),
});

export const {
  useSubmitKycMutation,
  useGetTrusteeKycAccountsQuery,
  useUpdateKycStatusMutation,
  useGetCompanyKycDetailsIdQuery,
  useGetKycAccountsQuery,
  useGetCompanyKycAccountsQuery,
  useUpdateCompanyKycStatusMutation,
} = kycApi;
