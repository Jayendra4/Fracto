/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed group/asset payloads, matches the pattern in rwa.api.ts */
import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/* ================= TYPES ================= */

export interface Group {
  id: number;
  title: string;
  description: string;
  image: string;
  groupStatus: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  isJoined?: boolean;
  category: {
    name: string;
    categoryStatus: 'Active' | 'Inactive';
  };
  _count: { groupMember: number };
}

export interface GroupsResponse {
  data: Group[];
  count: number;
  skip: number;
  take: number;
}

interface FetchGroupsParams {
  pageParam?: number;
  take?: number;
  groupStatus?: string;
  accountId?: number;
  search?: string;
}

interface UseGroupsParams {
  pageParam?: number;
  take?: number;
  groupStatus?: string;
  accountId?: number;
  search?: string;
}

export type AssetStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AssetMeta {
  id: number;
  metaKey: string;
  metaValue: string;
  metaType: 'String' | 'Number' | 'Boolean';
}

export interface AssetDocument {
  id: number;
  documentName: string;
  documentUrl: string;
  documentType: string;
}

export interface AssetDetails {
  id: number;
  assetTitle: string;
  assetType: string;
  assetSubType: string | null;
  currentOwnerName: string;
  status: string;
  newStatus: string;
  meta: AssetMeta[];
  documents: AssetDocument[];
  updateAsset: boolean;
}

export interface GroupShare {
  id: number;
  groupId: number;
}

export interface UserAsset {
  id: number;
  assetId: number;
  sharedById: number;
  tokenAmount: number | null;
  status: AssetStatus;
  approvedBy: number | null;
  approvedAt: string | null;
  rejectNote: string | null;
  createdAt: string;
  updatedAt: string;

  asset: AssetDetails;
  groupShares: GroupShare[];
}

export interface UserAssetResponse {
  data: UserAsset[];
  count: number;
  skip: number;
  take: number;
}

interface UseAssetsParams {
  accountId?: number;
  groupId?: number;
  skip?: number;
  take?: number;
  search?: string;
  assetStatus?: AssetStatus;
}

interface FetchAssetsParams {
  accountId?: number;
  groupId?: number;
  skip?: number;
  take?: number;
  search?: string;
  assetStatus?: AssetStatus;
}

export interface GroupAssetItem {
  id: number;
  sharedAssetId: number;
  groupId: number;
  paidInterestCount: number;
  isInterested: boolean;
  isSecondaryClubCreated?: boolean;
  isSpvCreated?: boolean;
  sharedAsset: {
    id: number;
    assetId: number;
    sharedById: number;
    status: AssetStatus;
    createdAt: string;
    updatedAt: string;
    tokenAmount: string;
    asset: AssetDetails;
  };
}

export interface GroupAssetResponse {
  data: GroupAssetItem[];
  count: number;
  skip: number;
  take: number;
}
export type VerifyPaymentDto = {
  razorpay_order_id: string;
  razorpay_signature: string;
  interestId: number;
};
/* ================= API FUNCTION ================= */

const fetchGroups = async ({
  pageParam = 0,
  take = 1000,
  groupStatus = 'Active',
  accountId,
  search,
}: FetchGroupsParams = {}): Promise<IApiResponse<GroupsResponse>> => {
  return axiosRequest<GroupsResponse>({
    method: 'GET',
    endpoint: '/group',
    params: {
      skip: pageParam,
      take,
      groupStatus,
      ...(accountId ? { accountId } : {}),
      ...(search ? { search } : {}),
    },
  });
};

const fetchHighlightedGroups = async (): Promise<
  IApiResponse<GroupsResponse>
> => {
  return axiosRequest<GroupsResponse>({
    method: 'GET',
    endpoint: '/group/highlighted',
    params: { skip: 0, take: 3 },
  });
};

export const useHighlightedGroups = () => {
  return useQuery({
    queryKey: ['highlighted-groups'],
    queryFn: fetchHighlightedGroups,
    staleTime: 30000,
    select: (res) => {
      if (res.success) return res.data;
      return undefined;
    },
  });
};

/* ================= JOIN GROUP ================= */

export const joinGroupApi = async (
  groupId: number | number[]
): Promise<IApiResponse<any>> => {
  const groupIds = Array.isArray(groupId) ? groupId : [groupId];
  const res = await axiosRequest({
    method: 'POST',
    endpoint: '/join-group',
    data: { groupIds },
  });

  // 🔥 IMPORTANT FIX
  if (!res.success) {
    throw new Error(res.message || 'Failed to join group');
  }

  return res;
};

/* ================= GET JOINED GROUPS ================= */

export const getJoinedGroupsApi = async (
  accountId: number
): Promise<IApiResponse<Group[]>> => {
  return axiosRequest<Group[]>({
    method: 'GET',
    endpoint: `/join-group/${accountId}`, // ✅ dynamic
  });
};

export const fetchUserAssetsApi = async ({
  accountId,
  groupId,
  skip = 0,
  take = 10,
  search = '',
  assetStatus,
}: FetchAssetsParams): Promise<IApiResponse<UserAssetResponse>> => {
  return axiosRequest<UserAssetResponse>({
    method: 'GET',
    endpoint: `/share-asset/${accountId}/user-own-asset/${groupId}`,
    params: {
      skip,
      take,
      search: search || undefined,
      AssetStatus: assetStatus || undefined,
    },
  });
};

export const fetchGroupassetApi = async ({
  groupId,
  skip = 0,
  take = 10,
  search = '',
  assetStatus,
}: FetchAssetsParams): Promise<IApiResponse<GroupAssetResponse>> => {
  return axiosRequest<GroupAssetResponse>({
    method: 'GET',
    endpoint: `/group/assets-in-group/${groupId}`,
    params: {
      skip,
      take,
      search: search || undefined,
      status: assetStatus || undefined,
    },
  });
};

export const shareAssetInterestApi = async ({
  groupId,
  sharedAssetId,
}: {
  groupId: number;
  sharedAssetId: number;
}) => {
  return axiosRequest({
    method: 'POST',
    endpoint: `/share-asset/interest/${groupId}`,
    data: {
      sharedAssetId,
      status: 'Bank',
      requestType: 'DIRECTPAYMENT',
    },
  });
};

export const onAssetInterestApi = async ({
  groupId,
  sharedAssetId,
}: {
  groupId: number;
  sharedAssetId: number;
}) => {
  return axiosRequest({
    method: 'POST',
    endpoint: `/share-asset/apply-interest/${groupId}`,
    data: {
      sharedAssetId,
    },
  });
};

export interface ManualPaymentInterestPayload {
  name: string;
  mobile: string;
  email: string;
  amount: number;
  utrNumber: string;
  screenshot: string;
  consent?: boolean;
}

export const submitManualPaymentInterestApi = async (
  assetId: number | string,
  payload: ManualPaymentInterestPayload
) => {
  return axiosRequest({
    method: 'POST',
    endpoint: `/share-asset/interest/${assetId}/manual-payment`,
    data: payload,
  });
};

export interface ManualDepositPayload extends ManualPaymentInterestPayload {
  methodType: 'Bank';
}

export const submitManualDepositApi = async (payload: ManualDepositPayload) => {
  return axiosRequest({
    method: 'POST',
    endpoint: `/payment-request/deposit/manual`,
    data: payload,
  });
};

/* ================= Pending SECONDARY CLUB (PRIMARY CLUB) ================= */
// Replaced by /join-group/{accountId}/joined-group below.
//
// export interface PendingSecondaryClub {
//   assetId: number;
//   assetTitle: string;
//   paymentStatus: string;
//   verificationStatus: string;
//   status: string;
//   paymentVerifiedAt: string | null;
// }
//
// export interface PendingSecondaryClubsResponse {
//   count: number;
//   skip: number;
//   take: number;
//   data: PendingSecondaryClub[];
// }
//
// export const fetchPendingSecondaryClubsApi = async (
//   skip = 0,
//   take = 10
// ): Promise<IApiResponse<PendingSecondaryClubsResponse>> => {
//   return axiosRequest<PendingSecondaryClubsResponse>({
//     method: 'GET',
//     endpoint: '/share-asset/pending-secondary-club',
//     params: { skip, take },
//   });
// };
//
// export const usePendingSecondaryClubs = (skip = 0, take = 10) => {
//   return useQuery({
//     queryKey: ['pending-secondary-clubs', skip, take],
//     queryFn: () => fetchPendingSecondaryClubsApi(skip, take),
//     staleTime: 0,
//     refetchOnMount: 'always',
//     refetchInterval: 60_000,
//     select: (res) => {
//       if (res.success) return res.data;
//       return { count: 0, skip, take, data: [] };
//     },
//   });
// };

export interface JoinedGroupItem {
  id: number;
  title: string;
  description: string;
  groupStatus: string;
}

export const fetchJoinedGroupsListApi = async (
  accountId: number
): Promise<IApiResponse<JoinedGroupItem[]>> => {
  return axiosRequest<JoinedGroupItem[]>({
    method: 'GET',
    endpoint: `/join-group/${accountId}/joined-group`,
  });
};

// TODO: no pagination yet — API returns a flat array. Add skip/take once
// the backend supports it.
export const useJoinedGroupsList = (accountId?: number) => {
  return useQuery({
    queryKey: ['joined-groups-list', accountId],
    queryFn: () => fetchJoinedGroupsListApi(accountId as number),
    enabled: !!accountId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 60_000,
    select: (res) => {
      if (res.success) return res.data;
      return [];
    },
  });
};

/* ================= OWNER VOTE STATISTICS ================= */

export interface OwnerVoteStatistic {
  assetId: number;
  assetTitle: string;
  secondaryClubId: number;
  clubTitle: string;
  totalMembers: number;
  totalVotes: number;
  yesCount: number;
  yesPercentage: number;
  noCount: number;
  noPercentage: number;
  abstainCount: number;
  abstainPercentage: number;
  notVotedCount: number;
}

export interface OwnerVoteStatisticsResponse {
  count: number;
  data: OwnerVoteStatistic[];
}

export const fetchOwnerVoteStatisticsApi = async (): Promise<
  IApiResponse<OwnerVoteStatisticsResponse>
> => {
  return axiosRequest<OwnerVoteStatisticsResponse>({
    method: 'GET',
    endpoint: '/vote/owner-statistics',
  });
};

export const useOwnerVoteStatistics = () => {
  return useQuery({
    queryKey: ['owner-vote-statistics'],
    queryFn: fetchOwnerVoteStatisticsApi,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 60_000,
    select: (res) => {
      if (res.success) return res.data;
      return { count: 0, data: [] };
    },
  });
};

/* ================= MY SECONDARY CLUBS ================= */

export interface MySecondaryClub {
  id: number;
  title: string;
  assetId: number;
  assetTitle: string;
  isFractionalized: boolean;
  membersCount: number;
  votesCount: number;
  hasVoted: boolean;
  choice?: 'Yes' | 'No' | 'Abstain' | (string & {}) | null;
  voteStatus?: 'Scheduled' | 'Active' | 'Ended' | (string & {}) | null;
  status?: 'Funded' | (string & {}) | null;
}

export interface MySecondaryClubsResponse {
  count: number;
  skip: number;
  take: number;
  data: MySecondaryClub[];
}

export const fetchMySecondaryClubsApi = async (
  skip = 0,
  take = 10
): Promise<IApiResponse<MySecondaryClubsResponse>> => {
  return axiosRequest<MySecondaryClubsResponse>({
    method: 'GET',
    endpoint: '/share-asset/my-secondary-clubs',
    params: { skip, take },
  });
};

export const useMySecondaryClubs = (skip = 0, take = 10) => {
  return useQuery({
    queryKey: ['my-secondary-clubs', skip, take],
    queryFn: () => fetchMySecondaryClubsApi(skip, take),
    // Fetch immediately every time this mounts (e.g. navigating to
    // /dashboard/my-club), then poll while it stays mounted.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 60_000,
    select: (res) => {
      if (res.success) return res.data;
      return { count: 0, skip, take, data: [] };
    },
  });
};

/* ================= CAST VOTE ================= */

export type VoteChoice = 'Yes' | 'No' | 'Abstain';

export interface CastVotePayload {
  assetId: number;
  secondaryClubId: number;
  choice: VoteChoice;
}

export const castVoteApi = async (payload: CastVotePayload) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/vote',
    data: payload,
  });
};

export const useCastVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CastVotePayload) => castVoteApi(payload),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['asset-by-id', variables.assetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['asset-by-id', String(variables.assetId)],
      });
      queryClient.invalidateQueries({ queryKey: ['my-secondary-clubs'] });
    },
  });
};

/* ================= PAID MEMBERS ================= */

export interface PaidMember {
  id: number;
  sharedAssetId: number;
  accountId: number;
  groupId: number | null;
  tokenAmount: string;
  paymentStatus: string;
  isPayment: boolean;
  paidAt: string | null;
  payerName: string;
  payerMobile: string;
  payerEmail: string;
  amountPaid: string;
  utrNumber: string;
  paymentScreenshot: string;
  rejectionReason: string | null;
  secondaryClubId: number | null;
  createdAt: string;
  updatedAt: string;
  account: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    mobile: string;
  };
}

export interface PaidMembersResponse {
  assetId: number;
  assetDetails: {
    asset: string;
    sharedBy: {
      firstname: string;
      lastname: string;
      email: string;
      mobile: string;
    };
  };
  totalMembers: number;
  members: PaidMember[];
}

interface FetchPaidMembersParams {
  assetId: number | string;
  skip?: number;
  take?: number;
}

export const fetchPaidMembersApi = async ({
  assetId,
  skip = 0,
  take = 10,
}: FetchPaidMembersParams): Promise<IApiResponse<PaidMembersResponse>> => {
  return axiosRequest<PaidMembersResponse>({
    method: 'GET',
    endpoint: `/share-asset/interest/${assetId}/paid-members`,
    params: { memberSkip: skip, memberTake: take },
  });
};

const PAID_MEMBERS_TAKE = 10;

export const usePaidMembers = (assetId?: number | string, page: number = 1) => {
  const skip = (page - 1) * PAID_MEMBERS_TAKE;
  return useQuery({
    queryKey: ['paid-members', assetId, skip],
    queryFn: () =>
      fetchPaidMembersApi({
        assetId: assetId as number | string,
        skip,
        take: PAID_MEMBERS_TAKE,
      }),
    enabled: !!assetId,
    select: (res) => {
      if (res.success) return res.data;
      return { assetId: 0, assetDetails: null, totalMembers: 0, members: [] };
    },
  });
};

/* ================= CLUB MEMBERSHIP (NDA / ADMIN APPROVAL) ================= */

export interface ClubMembershipStatus {
  secondaryClubId: number;
  ndaAccepted: boolean;
  status:
    | 'PENDINGADMINAPPROVAL'
    | 'Approved'
    | 'Rejected'
    | (string & {})
    | null;
  rejectionReason: string | null;
  approvedAt: string | null;
}

export const acceptNdaApi = async (secondaryClubId: number | string) => {
  return axiosRequest({
    method: 'POST',
    endpoint: `/club-membership/${secondaryClubId}/accept-nda`,
  });
};

export const useAcceptNda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (secondaryClubId: number | string) =>
      acceptNdaApi(secondaryClubId),
    onSuccess: (_res, secondaryClubId) => {
      queryClient.invalidateQueries({
        queryKey: ['club-membership-status', secondaryClubId],
      });
      queryClient.invalidateQueries({
        queryKey: ['club-membership-status', String(secondaryClubId)],
      });
    },
  });
};

export const fetchClubMembershipStatusApi = async (
  secondaryClubId: number | string
): Promise<IApiResponse<ClubMembershipStatus>> => {
  return axiosRequest<ClubMembershipStatus>({
    method: 'GET',
    endpoint: `/club-membership/my-status/${secondaryClubId}`,
  });
};

export const useClubMembershipStatus = (secondaryClubId?: number | string) => {
  return useQuery({
    queryKey: ['club-membership-status', secondaryClubId],
    queryFn: () =>
      fetchClubMembershipStatusApi(secondaryClubId as number | string),
    enabled: !!secondaryClubId,
    refetchInterval: 30_000,
    select: (res) => (res.success ? res.data : undefined),
  });
};

/* ================= GET GROUP BY ID ================= */

export const getGroupByIdApi = async (
  groupId: number
): Promise<IApiResponse<Group>> => {
  return axiosRequest<Group>({
    method: 'GET',
    endpoint: `/group/${groupId}`, // ✅ dynamic
  });
};

export const verifyPaymentApi = async ({
  razorpay_order_id,
  razorpay_signature,
  interestId,
}: VerifyPaymentDto) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/share-asset/verify-payment',
    data: {
      razorpay_order_id,
      razorpay_signature,
      interest_id: interestId, // 🔥 mapping here
    },
  });
};

export const leaveGroupApi = async ({
  groupId,
  password,
}: {
  groupId: number;
  password: string;
}): Promise<IApiResponse<any>> => {
  const res = await axiosRequest({
    method: 'DELETE',
    endpoint: `/join-group/${groupId}/exit-group`,
    data: { groupId, password },
  });

  if (!res.success) {
    throw new Error(res.message || 'Failed to leave group');
  }

  return res;
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { groupId: number; password: string }) =>
      leaveGroupApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['joined-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-detail'] });
    },
  });
};

/* ================= CUSTOM HOOK ================= */

export const useGroups = ({
  pageParam = 0,
  take = 1000,
  groupStatus = 'Active',
  accountId,
  search,
}: UseGroupsParams = {}) => {
  return useQuery({
    queryKey: [
      'groups',
      pageParam,
      take,
      groupStatus,
      accountId ?? 'all',
      search ?? '',
    ],
    queryFn: () =>
      fetchGroups({ pageParam, take, groupStatus, accountId, search }),
    staleTime: 0,
    select: (res) => {
      if (res.success) return res.data;
      return undefined;
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: number | number[]) => joinGroupApi(groupId),

    // ✅ optional: auto refresh groups list after join
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['joined-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-detail'] });
    },
  });
};

export const useJoinedGroups = (
  accountId?: number,
  isAuthenticated?: boolean
) => {
  return useQuery({
    queryKey: ['joined-groups', accountId],
    queryFn: () => getJoinedGroupsApi(accountId as number),

    enabled: !!accountId && !!isAuthenticated, // ✅ BOTH CONDITIONS

    select: (res) => {
      if (res.success) return res.data;
      return [];
    },
  });
};

export const useGroupById = (groupId?: number) => {
  return useQuery({
    queryKey: ['group-detail', groupId],
    queryFn: () => getGroupByIdApi(groupId as number),

    enabled: !!groupId, // ✅ id ho tabhi call

    select: (res) => {
      if (res.success) return res.data;
      return undefined;
    },
  });
};

export const useUserAssets = ({
  accountId,
  groupId,
  skip = 0,
  take = 10,
  search = '',
  assetStatus,
}: UseAssetsParams) => {
  return useQuery({
    queryKey: [
      'user-assets',
      accountId,
      groupId,
      skip,
      take,
      search,
      assetStatus,
    ],

    queryFn: () =>
      fetchUserAssetsApi({
        accountId: accountId as number,
        groupId: groupId as number,
        skip,
        take,
        search,
        assetStatus,
      }),

    enabled: !!accountId && !!groupId,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,

    select: (res) => {
      if (res.success) return res.data;

      return {
        data: [],
        count: 0,
        skip: 0,
        take: 0,
      };
    },
  });
};

export const useGroupAssets = ({
  groupId,
  skip = 0,
  take = 10,
  search = '',
  assetStatus,
}: UseAssetsParams) => {
  return useQuery({
    queryKey: ['user-assets', groupId, skip, take, search, assetStatus],
    queryFn: () =>
      fetchGroupassetApi({
        groupId: groupId as number,
        skip,
        take,
        search,
        assetStatus,
      }),
    enabled: !!groupId,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    select: (res) => {
      if (res.success) return res.data as GroupAssetResponse;

      return {
        data: [],
        count: 0,
        skip: 0,
        take: 0,
      };
    },
  });
};

export const useShareInterest = () => {
  return useMutation({
    mutationFn: shareAssetInterestApi,
  });
};

export const useOnInterest = (groupId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onAssetInterestApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-assets', groupId],
      });
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyPaymentApi,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-assets'] });
      queryClient.invalidateQueries({ queryKey: ['property-details'] });
    },
  });
};

// The secondary-marketplace domain (asks, bids, listings, order book,
// charts) previously lived in this file too — moved to marketplace.api.ts
// to keep each file scoped to one feature area. Re-exported here so every
// existing `from '@/api/group.api'` import keeps working unchanged.
export * from './marketplace.api';
