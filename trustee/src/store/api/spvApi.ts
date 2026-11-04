import { apiSlice } from './apiSlice';

export interface SpvItem {
  id: number | string;
  spvName?: string;
  spv?: string;
  name?: string;
  secondaryClub?: string;
  secondaryClubName?: string;
  asset?: string;
  assetName?: string;
  members?: number;
  membersCount?: number;
  shareholders?: number;
  status?: boolean | string;
  isActive?: boolean;
  [key: string]: any;
}

export interface PaginatedSpvResponse {
  data: SpvItem[];
  count?: number;
  totalCount?: number;
  total?: number;
  skip?: number;
  take?: number;
}

export interface SPVShareholderMember {
  accountId: number;
  name: string;
  email: string;
  mobile: string;
  fractionUnits: number;
  totalPaidAmount: number;
  purchaseDate: string | null;
  hasVoted?: boolean;
  voteChoice?: string | null;
  consent?: boolean;
}

export interface SPVShareholderRecord {
  spvId: number;
  spvName: string;
  status: string;
  assetId: number;
  assetTitle: string;
  totalMembersCount: number;
  members: SPVShareholderMember[];
}

export interface SPVShareholderRegisterResponse {
  count: number;
  skip: number;
  take: number;
  data: SPVShareholderRecord[];
}

export interface SPVVotingStatusItem {
  spvId: number;
  spvName: string;
  spvStatus: string;
  secondaryClubId: number;
  assetId: number;
  assetTitle: string;
  totalMembers: number;
  votedMembers: number;
  notVotedMembers: number;
  assetStatus: string;
  rwaStatus: string;
}

export interface SPVVotingStatusResponse {
  count: number;
  skip: number;
  take: number;
  data: SPVVotingStatusItem[];
}

export interface SPVVerifierCheckpoint {
  checkpoint: string;
  verifiedBy: string;
  date: string;
  status: string;
}

export interface SPVVerifierRecord {
  spvId: number;
  spvName: string;
  assetId: number;
  assetTitle: string;
  rwaStatus: string;
  checkpoints: SPVVerifierCheckpoint[];
}

export interface SPVVerifierTrackerResponse {
  count: number;
  skip: number;
  take: number;
  data: SPVVerifierRecord[];
}

export interface DocumentInfo {
  documentId: number;
  name: string;
  type: string;
  url: string;
  isVerified: boolean;
  remark: string | null;
  uploadedAt: string;
}

export interface AssetDocumentsInfo {
  assetId: number;
  assetTitle: string;
  documentsCount: number;
  documents: DocumentInfo[];
}

export interface SPVAssetsDocumentsRecord {
  spvId: number;
  spvName: string;
  spvCode: string;
  assets: AssetDocumentsInfo[];
}

export interface SPVAssetsDocumentsResponse {
  count: number;
  skip: number;
  take: number;
  data: SPVAssetsDocumentsRecord[];
}

export interface ExitLiquidationStatus {
  hasSecondaryClub: boolean;
  secondaryClubId: number | null;
  fractionalizationStatus: string;
  legalStatus: string;
  valuationStatus?: string;
  dueDiligence?: string;
  hasSpv: boolean;
  spvId: number | null;
  spvName: string | null;
  isFunded: boolean;
  hasSecondaryMarketplace: boolean;
}

export interface ExitLiquidationExitInfo {
  hasActiveExit: boolean;
  statusLabel: string;
  message: string;
}

export interface ExitLiquidationRecord {
  assetId: number;
  assetTitle: string;
  status: ExitLiquidationStatus;
  exit: ExitLiquidationExitInfo;
  marketValue?: number;
  shareholderVote?: {
    totalShareholders: number;
    votedShareholders: number;
    notVotedShareholders: number;
    closesAt: string;
  };
}

export interface ExitLiquidationTrackerResponse {
  count: number;
  skip: number;
  take: number;
  data: ExitLiquidationRecord[];
}

export const spvApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSpvList: builder.query<
      PaginatedSpvResponse | SpvItem[],
      { skip?: number; take?: number; search?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.skip !== undefined) queryParams.skip = params.skip;
        if (params?.take !== undefined) queryParams.take = params.take;
        if (params?.search) queryParams.search = params.search;

        return {
          url: '/spv',
          ...(Object.keys(queryParams).length > 0 ? { params: queryParams } : {}),
        };
      },
      providesTags: ['Spv'],
    }),
    getSpvShareholderRegister: builder.query<
      SPVShareholderRegisterResponse,
      { skip?: number; take?: number; search?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.skip !== undefined) queryParams.skip = params.skip;
        if (params?.take !== undefined) queryParams.take = params.take;
        if (params?.search) queryParams.search = params.search;

        return {
          url: '/spv/shareholder-register',
          params: queryParams,
        };
      },
      providesTags: ['Spv'],
    }),
    getSpvVotingStatus: builder.query<
      SPVVotingStatusResponse,
      { skip?: number; take?: number; search?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.skip !== undefined) queryParams.skip = params.skip;
        if (params?.take !== undefined) queryParams.take = params.take;
        if (params?.search) queryParams.search = params.search;

        return {
          url: '/spv/voting-status',
          params: queryParams,
        };
      },
      providesTags: ['Spv'],
    }),
    getTrusteeVerifierTracker: builder.query<
      SPVVerifierTrackerResponse,
      { skip?: number; take?: number; search?: string; rwaStatus?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.skip !== undefined) queryParams.skip = params.skip;
        if (params?.take !== undefined) queryParams.take = params.take;
        if (params?.search) queryParams.search = params.search;
        if (params?.rwaStatus) queryParams.rwaStatus = params.rwaStatus;

        return {
          url: '/trustee/verifier-tracker',
          params: queryParams,
        };
      },
      providesTags: ['Spv'],
    }),
    getSpvAssetsDocuments: builder.query<
      SPVAssetsDocumentsResponse,
      { skip?: number; take?: number; search?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.skip !== undefined) queryParams.skip = params.skip;
        if (params?.take !== undefined) queryParams.take = params.take;
        if (params?.search) queryParams.search = params.search;

        return {
          url: '/spv/assets/documents',
          params: queryParams,
        };
      },
      providesTags: ['Spv'],
    }),
    getExitLiquidationTracker: builder.query<
      ExitLiquidationTrackerResponse,
      { skip?: number; take?: number; search?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.skip !== undefined) queryParams.skip = params.skip;
        if (params?.take !== undefined) queryParams.take = params.take;
        if (params?.search) queryParams.search = params.search;

        return {
          url: '/spv/exit-liquidation-tracker',
          params: queryParams,
        };
      },
      providesTags: ['Spv'],
    }),
    toggleSpvStatus: builder.mutation<any, { id: number | string; status?: boolean }>({
      query: ({ id, status }) => ({
        url: `/spv/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Spv'],
    }),
    sendVotingReminder: builder.mutation<any, number | string>({
      query: (id) => ({
        url: `/spv/${id}/voting/reminder`,
        method: 'POST',
      }),
      invalidatesTags: ['Spv'],
    }),
  }),
});

export const {
  useGetSpvListQuery,
  useGetSpvShareholderRegisterQuery,
  useGetSpvVotingStatusQuery,
  useGetTrusteeVerifierTrackerQuery,
  useToggleSpvStatusMutation,
  useSendVotingReminderMutation,
  useGetSpvAssetsDocumentsQuery,
  useGetExitLiquidationTrackerQuery,
} = spvApi;
