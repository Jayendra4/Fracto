import { apiSlice } from './apiSlice';

export const brokerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<
      any,
      { brokerId?: number; take?: number; skip?: number; search?: string; type?: string }
    >({
      query: (params) => ({
        url: '/broker/leads',
        method: 'GET',
        params,
      }),
      providesTags: ['Leads'],
    }),

    getLeadById: builder.query<any, number>({
      query: (id) => ({
        url: `/broker/lead/${id}`,
        method: 'GET',
      }),
      providesTags: ['Leads'],
    }),

    getCommissionPayoutRequests: builder.query<
      any,
      { brokerId: number; skip?: number; take?: number; status?: string }
    >({
      query: ({ brokerId, ...params }) => ({
        url: '/broker/commission-payout-requests',
        method: 'GET',
        params: {
          brokerId,
          ...params,
        },
      }),
      providesTags: ['Commissions'],
    }),

    reviewPayoutRequest: builder.mutation<
      any,
      { requestId: number; status: string; remarks: string }
    >({
      query: ({ requestId, ...body }) => ({
        url: `/broker/${requestId}/payout-review`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Commissions'],
    }),

    approveCommissionPct: builder.mutation<
      any,
      { assetOwnerInviteId: number; status: string; remarks: string }
    >({
      query: ({ assetOwnerInviteId, ...body }) => ({
        url: `/broker/${assetOwnerInviteId}/approve-commission`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),

    getCommissionSummary: builder.query<any, void>({
      query: () => ({
        url: '/broker/commission-summary',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useGetCommissionPayoutRequestsQuery,
  useReviewPayoutRequestMutation,
  useApproveCommissionPctMutation,
  useGetCommissionSummaryQuery,
} = brokerApi;
