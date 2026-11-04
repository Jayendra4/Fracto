import apiSlice from './apiSlice';

export interface ManualPayment {
  id: number;
  sharedAssetId: number;
  accountId: number;
  groupId: number | null;
  tokenAmount: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  isPayment: boolean;
  payerName: string;
  payerMobile: string;
  payerEmail: string;
  amountPaid: string;
  paymentScreenshot: string;
  sharedAsset?: {
    assetId: number;
    tokenAmount: string;
    asset?: {
      assetTitle: string;
    };
  };
}

export interface GetManualPaymentsParams {
  skip?: number;
  take?: number;
  page?: number;
  limit?: number;
  pageSize?: number;
  search?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export const manualPaymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getManualPayments: builder.query<PaginatedResponse<ManualPayment>, GetManualPaymentsParams>({
      query: (params) => {
        const skip = params.skip ?? 0;
        const take = params.take ?? 10;
        const limit = params.limit ?? params.pageSize ?? take;
        const page = params.page ?? Math.floor(skip / limit) + 1;

        return {
          url: '/share-asset/interest/manual-payment/list',
          method: 'GET',
          params: {
            skip,
            take: limit,
            page,
            limit,
            pageSize: limit,
            ...(params.search ? { search: params.search } : {}),
            ...(params.paymentStatus && params.paymentStatus !== 'ALL'
              ? { paymentStatus: params.paymentStatus }
              : {}),
          },
        };
      },
      providesTags: (result, error, arg) => [
        { type: 'ManualPayment', id: JSON.stringify(arg) },
        'ManualPayment',
      ],
    }),

    reviewManualPayment: builder.mutation<
      void,
      {
        interestId: number;
        paymentStatus: 'Paid' | 'Failed';
        rejectionReason?: string;
      }
    >({
      query: ({ interestId, paymentStatus, rejectionReason }) => ({
        url: `/share-asset/interest/${interestId}/manual-payment/review`,
        method: 'POST',
        body: {
          paymentStatus,
          status: paymentStatus,
          rejectionReason,
        },
      }),
      invalidatesTags: ['ManualPayment'],
    }),
  }),
});

export const { useGetManualPaymentsQuery, useReviewManualPaymentMutation } = manualPaymentApi;
