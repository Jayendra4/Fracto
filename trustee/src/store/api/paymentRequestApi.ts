import apiSlice from './apiSlice';

export type PaymentRequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type PaymentRequestType = 'Deposit' | 'Withdraw';

export interface PaymentRequestResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

// paymentRequestApi.ts
export const paymentRequestApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentRequests: builder.query<PaymentRequestResponse<any>, any>({
      query: (params) => ({
        url: '/payment-request',
        method: 'GET',
        params,
      }),
      providesTags: ['PaymentRequest'],
    }),

    updatePaymentRequestStatus: builder.mutation<
      void,
      {
        id: number;
        status: 'Approved' | 'Rejected';
        remark: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/payment-request/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['PaymentRequest'],
    }),
  }),
});

export const { useGetPaymentRequestsQuery, useUpdatePaymentRequestStatusMutation } =
  paymentRequestApi;
