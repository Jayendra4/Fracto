import { apiSlice } from './apiSlice';

export interface VoteAssetSummary {
  assetId: number;
  assetTitle: string;
  secondaryClubId: number;
  voteStatus: string;
  totalMembers: number;
  totalVotes: number;
  notVotedCount: number;
  yesCount: number;
  yesPercentage: number;
  noCount: number;
  noPercentage: number;
  abstainCount: number;
  abstainPercentage: number;
}

export interface VoteAssetSummaryResponse {
  count: number;
  total?: number;
  skip: number;
  take: number;
  data: VoteAssetSummary[];
}

export const voteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVoteAssetSummary: builder.query<
      VoteAssetSummaryResponse,
      {
        skip?: number;
        take?: number;
        search?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search }) => ({
        url: '/vote/asset-summary',
        method: 'GET',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Group'],
    }),

    getVoteAssetSummaryDetail: builder.query<
      any,
      {
        assetId: number;
        search?: string;
      }
    >({
      query: ({ assetId, search }) => ({
        url: `/vote/asset-summary/${assetId}`,
        method: 'GET',
        params: {
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Group'],
    }),
  }),
});

export const {
  useGetVoteAssetSummaryQuery,
  useGetVoteAssetSummaryDetailQuery,
} = voteApi;
