import { apiSlice } from './apiSlice';

/* =========================
   TYPES
========================= */
export interface CreateGroupPayload {
  title: string;
  description: string;
  categoryId: number;
  image: string;
}

export interface Group {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  image: string | null;
  groupStatus: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt?: string;
  _count: {
    groupMember: number;
    sharedAssetGroups: number;
  };
  category: {
    id: number;
    name: string;
  };
}

export interface SPVShareholderMember {
  accountId: number;
  name: string;
  email: string;
  mobile: string;
  fractionUnits: number;
  totalPaidAmount: number;
  purchaseDate: string;
  consent: boolean;
}

export interface SPVShareholderRecord {
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

export interface GroupResponse {
  count: number;
  skip: number;
  take: number;
  data: Group[];
}

/* =========================
   API
========================= */
export const allGroupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ✅ GET GROUPS */
    getGroups: builder.query<
      GroupResponse,
      {
        search?: string;
        fromDate?: string;
        toDate?: string;
        skip?: number;
        take?: number;
        groupStatus?: string;
      }
    >({
      query: ({ search, fromDate, toDate, skip, take, groupStatus }) => ({
        url: '/group',
        params: { search, fromDate, toDate, skip, take, groupStatus },
      }),
      providesTags: ['Group'],
    }),
    getGroupById: builder.query<Group, number>({
      query: (id) => `/group/${id}`,
    }),

    getGroupMemberById: builder.query<
      any,
      {
        groupId: number;
        skip?: number;
        take?: number;
        search?: string;
      }
    >({
      query: ({ groupId, skip = 0, take = 10, search }) => ({
        url: `/group/group-member/${groupId}`,
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
        },
      }),

      providesTags: ['GroupMembers'], // ✅ ADD THIS
    }),

    getInterestedMember: builder.query<
      any,
      {
        groupId: number;
        assetId: number;
        skip?: number;
        take?: number;
        search?: string;
      }
    >({
      query: ({ groupId, skip = 0, take = 10, search, assetId }) => ({
        url: `/share-asset/${groupId}/interest-list/${assetId}`,
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
        },
      }),

      providesTags: ['GroupMembers'], // ✅ ADD THIS
    }),

    getAssetsInGroup: builder.query<
      any,
      {
        groupId: number;
        search?: string;
        skip?: number;
        take?: number;
        status?: 'Pending' | 'Approved' | 'Rejected';
        AssetStatus?: string;
        RwaStatus?: string;
      }
    >({
      query: ({ groupId, search, skip = 0, take = 10, status, AssetStatus, RwaStatus }) => ({
        url: `/group/assets-in-group/${groupId}`,
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}), // ✅ only send when filter applied
          ...(AssetStatus ? { AssetStatus } : {}),
          ...(RwaStatus ? { RwaStatus } : {}),
        },
      }),

      providesTags: ['GroupAssets'], // optional but recommended
    }),

    /* ✅ CREATE GROUP */
    createGroupApi: builder.mutation<Group, CreateGroupPayload>({
      query: (body) => ({
        url: '/group',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group'],
    }),

    /* ✅ DELETE GROUP */
    deleteGroup: builder.mutation<void, number>({
      query: (groupId) => ({
        url: `/group/${groupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Group'], // auto refresh
    }),

    /* ✅ UPDATE STATUS */
    updateGroupStatus: builder.mutation<void, { id: number; status: 'Active' | 'Inactive' }>({
      query: ({ id, status }) => ({
        url: `/group/${id}/${status}`,
        method: 'POST', // backend agar POST use kare to change kar lena
      }),
      invalidatesTags: ['Group'],
    }),
    /* ✅ REMOVE GROUP MEMBER */
    removeGroupMember: builder.mutation<void, { groupId: number; accountId: number }>({
      query: ({ groupId, accountId }) => ({
        url: `/join-group/${groupId}/member/${accountId}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['GroupMembers'], // ✅ MATCH
    }),

    updateSharedAsset: builder.mutation<
      any,
      {
        sharedAssetId: number;
        status: 'Approved' | 'Rejected';
        tokenAmount?: number;
        rejectNote?: string;
      }
    >({
      query: (body) => ({
        url: '/share-asset',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroupAssets'],
    }),
    shareAssetInGroup: builder.mutation<
      any,
      {
        sharedAssetId: number;
        groupIds: number[];
      }
    >({
      query: (body) => ({
        url: '/share-asset/in-group',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['GroupAssets'], // optional but recommended
    }),
    getGroupListByAsset: builder.query<
      any,
      {
        assetId: number;
      }
    >({
      query: ({ assetId }) => ({
        url: `/share-asset/group-list/${assetId}`,
      }),

      providesTags: ['GroupAssets'], // optional
    }),

    getAllPaidAssets: builder.query<
      any,
      {
        assetId?: number;
        skip?: number;
        take?: number;
        search?: string;
        memberSkip?: number;
        memberTake?: number;
      }
    >({
      query: (params) => ({
        url: '/share-asset/interest/all-paid-assets',
        method: 'GET',
        params,
      }),
      providesTags: ['GroupMembers'],
    }),
    createInterestGroup: builder.mutation<
      any,
      {
        assetId: number;
        title: string;
        startDate?: string;
        endDate?: string;
        description?: string;
      }
    >({
      query: ({ assetId, title, startDate, endDate, description }) => ({
        url: `/share-asset/interest/${assetId}/create-group`,
        method: 'POST',
        body: { title, startDate, endDate, description },
      }),
      invalidatesTags: ['Group', 'GroupMembers'],
    }),

    getClubMemberships: builder.query<
      any,
      {
        skip?: number;
        take?: number;
        search?: string;
        secondaryClubId?: number;
        status?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, secondaryClubId, status }) => ({
        url: '/club-membership',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
          ...(secondaryClubId ? { secondaryClubId } : {}),
          ...(status && status !== 'ALL' ? { status } : {}),
        },
      }),
      providesTags: ['GroupMembers'],
    }),

    reviewClubMembership: builder.mutation<
      any,
      {
        requestId: number;
        status: string;
      }
    >({
      query: ({ requestId, status }) => ({
        url: `/club-membership/${requestId}/review`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['GroupMembers'],
    }),

    getSpvs: builder.query<
      any,
      {
        search?: string;
        skip?: number;
        take?: number;
      }
    >({
      query: ({ search, skip = 0, take = 10 }) => ({
        url: '/spv',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['GroupMembers'],
    }),

    createSpv: builder.mutation<
      any,
      {
        name: string;
        secondaryClubId: number;
        accountIds: number[];
      }
    >({
      query: (body) => ({
        url: '/spv',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroupMembers'],
    }),

    updateSpvStatus: builder.mutation<
      any,
      {
        id: number;
        status: 'Active' | 'Disabled';
      }
    >({
      query: ({ id, status }) => ({
        url: `/spv/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['GroupMembers'],
    }),

    getSpvShareholderRegister: builder.query<
      SPVShareholderRegisterResponse,
      {
        skip?: number;
        take?: number;
        search?: string;
      }
    >({
      query: (params) => ({
        url: '/spv/shareholder-register',
        method: 'GET',
        params,
      }),
    }),
  }),
});

/* =========================
   EXPORT HOOKS
========================= */
export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useGetGroupMemberByIdQuery,
  useGetInterestedMemberQuery,
  useCreateGroupApiMutation,
  useDeleteGroupMutation,
  useUpdateGroupStatusMutation,
  useRemoveGroupMemberMutation,
  useGetAssetsInGroupQuery,
  useUpdateSharedAssetMutation,
  useShareAssetInGroupMutation,
  useGetGroupListByAssetQuery,
  useGetAllPaidAssetsQuery,
  useCreateInterestGroupMutation,
  useGetClubMembershipsQuery,
  useReviewClubMembershipMutation,
  useCreateSpvMutation,
  useGetSpvsQuery,
  useUpdateSpvStatusMutation,
  useGetSpvShareholderRegisterQuery,
} = allGroupApi;
