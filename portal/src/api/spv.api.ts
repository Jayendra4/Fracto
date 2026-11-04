import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useQuery } from '@tanstack/react-query';

export interface SpvItem {
  id: number;
  name: string;
  secondaryClubId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  secondaryClub: {
    id: number;
    title: string;
    assetId: number;
  };
  _count: {
    members: number;
  };
}

export interface SpvListResponse {
  count: number;
  skip: number;
  take: number;
  data: SpvItem[];
}

interface FetchSpvListParams {
  accountId: number;
  skip?: number;
  take?: number;
  search?: string;
}

const fetchSpvList = ({
  accountId,
  skip = 0,
  take = 10,
  search,
}: FetchSpvListParams): Promise<IApiResponse<SpvListResponse>> =>
  axiosRequest({
    method: 'GET',
    endpoint: '/spv',
    params: {
      accountId,
      skip,
      take,
      ...(search ? { search } : {}),
    },
  });

export const useSpvList = (params: FetchSpvListParams) =>
  useQuery({
    queryKey: [
      'spv-list',
      params.accountId,
      params.skip,
      params.take,
      params.search,
    ],
    queryFn: () => fetchSpvList(params),
    enabled: !!params.accountId,
    staleTime: 0,
    refetchOnMount: 'always',
    select: (res) =>
      res.success
        ? (res.data as SpvListResponse)
        : { count: 0, skip: 0, take: 10, data: [] },
  });

export interface MySpvMember {
  accountId: number;
  profile: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  joinedAt: string;
}

export interface MySpvItem {
  assetId: number;
  assetTitle: string;
  spvId: number;
  spvName: string;
  memberCount: number;
  members: MySpvMember[];
}

export interface MySpvListResponse {
  count: number;
  skip: number;
  take: number;
  data: MySpvItem[];
}

const fetchMySpvList = ({
  accountId,
  skip = 0,
  take = 10,
  search,
}: FetchSpvListParams): Promise<IApiResponse<MySpvListResponse>> =>
  axiosRequest({
    method: 'GET',
    endpoint: '/spv/my-assets-summary',
    params: {
      accountId,
      skip,
      take,
      ...(search ? { search } : {}),
    },
  });

export const useMySpvList = (params: FetchSpvListParams) =>
  useQuery({
    queryKey: [
      'my-spv-list',
      params.accountId,
      params.skip,
      params.take,
      params.search,
    ],
    queryFn: () => fetchMySpvList(params),
    enabled: !!params.accountId,
    staleTime: 0,
    refetchOnMount: 'always',
    select: (res) =>
      res.success
        ? (res.data as MySpvListResponse)
        : { count: 0, skip: 0, take: 10, data: [] },
  });

export interface SpvMember {
  id: number;
  spvId: number;
  accountId: number;
  createdAt: string;
  account: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export interface SpvDetail {
  id: number;
  name: string;
  secondaryClubId: number;
  createdById: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  secondaryClub: {
    id: number;
    title: string;
  };
  members: SpvMember[];
}

const fetchSpvById = (spvId: number): Promise<IApiResponse<SpvDetail>> =>
  axiosRequest({
    method: 'GET',
    endpoint: `/spv/${spvId}`,
  });

export const useSpvById = (spvId?: number | null) =>
  useQuery({
    queryKey: ['spv-by-id', spvId],
    queryFn: () => fetchSpvById(spvId as number),
    enabled: !!spvId,
    staleTime: 0,
    select: (res) => (res.success ? (res.data as SpvDetail) : null),
  });
