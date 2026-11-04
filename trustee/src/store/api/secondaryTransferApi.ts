import { apiSlice } from './apiSlice';
import { PaginatedResponse } from '@/types';

export interface MarketplaceMatchParticipant {
  listingId: number;
  accountId: number;
  pricePerUnit: string;
  seller?: string;
  buyer?: string;
}

export interface MarketplaceMatch {
  id: number;
  assetId: number;
  assetTitle: string;
  matchedQuantity: number;
  tradePrice: string;
  status: string;
  ask: MarketplaceMatchParticipant;
  bid: MarketplaceMatchParticipant;
  trusteeId: number | null;
  approvedAt: string | null;
  rejectedBy: number | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export const secondaryTransferApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMarketplaceMatches: builder.query<
      PaginatedResponse<MarketplaceMatch>,
      {
        skip?: number;
        take?: number;
        search?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search }) => ({
        url: '/trustee/marketplace-matches',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['MarketplaceMatch'] as any,
    }),

    approveMarketplaceMatch: builder.mutation<void, number>({
      query: (matchId) => ({
        url: `/trustee/marketplace-matches/${matchId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['MarketplaceMatch'] as any,
    }),

    rejectMarketplaceMatch: builder.mutation<void, { matchId: number; rejectionReason: string }>({
      query: ({ matchId, rejectionReason }) => ({
        url: `/trustee/marketplace-matches/${matchId}/reject`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { rejectionReason },
      }),
      invalidatesTags: ['MarketplaceMatch'] as any,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMarketplaceMatchesQuery,
  useApproveMarketplaceMatchMutation,
  useRejectMarketplaceMatchMutation,
} = secondaryTransferApi;
