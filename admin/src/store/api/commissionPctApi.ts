import { apiSlice } from './apiSlice';

export const commissionPctApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommissionsPct: builder.query<
      any,
      {
        skip: number;
        take: number;
        search?: string;
        status?: string;
        brokerId?: number;
        assetOwnerStatus?: string;
        adminStatus?: string;
        isAssetOnboarding: boolean;
      }
    >({
      query: (params) => ({
        url: '/broker/invite-owners',
        method: 'GET',
        params: {
          skip: params.skip,
          take: params.take,
          ...(params.brokerId ? { brokerId: params.brokerId } : {}),
          ...(params.search ? { search: params.search } : {}),
          ...(params.assetOwnerStatus && {
            assetOwnerStatus: params.assetOwnerStatus,
          }),
          ...(params.adminStatus && {
            adminStatus: params.adminStatus,
          }),
          ...(params.isAssetOnboarding !== undefined && {
            isAssetOnboarding: params.isAssetOnboarding,
          }),
        },
      }),
      providesTags: ['Commissions'],
    }),
    approveOrRejectCommission: builder.mutation<
      any,
      {
        assetOwnerInviteId: number;
        status: 'Approved' | 'Rejected';
        remarks?: string;
      }
    >({
      query: ({ assetOwnerInviteId, status, remarks }) => ({
        url: `/broker/${assetOwnerInviteId}/approve-commission`,
        method: 'PATCH',
        body: {
          status,
          remarks,
        },
      }),
      invalidatesTags: ['Commissions'],
    }),
    getCommissionPctById: builder.query<any, number>({
      query: (id) => `/broker/invite-owners/${id}`,
      providesTags: ['Commissions'],
    }),
  }),
});

export const {
  useGetCommissionsPctQuery,
  useGetCommissionPctByIdQuery,
  useApproveOrRejectCommissionMutation,
} = commissionPctApi;
