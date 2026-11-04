/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed payloads, matches the pattern in rwa.api.ts */
// Split out of group.api.ts (secondary-marketplace trading domain: asks,
// bids, listings, order book, charts) — re-exported from group.api.ts so
// existing `from '@/api/group.api'` imports keep working unchanged.
import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AssetMeta } from './group.api';

/* ================= MARKETPLACE ================= */

export interface MarketplaceAsset {
  groupId: number;
  groupTitle: string;
  sharedAssetId: number;
  assetId: number;
  assetTitle: string;
  assetType: string;
  currentOwnerName: string;
  status: string;
  tokenAmount: string;
  isPaid: boolean;
  isMarketplace?: boolean;
  price: {
    id: number;
    assetId: number;
    initialPricePerFraction: string;
    currentPricePerFraction: string;
  } | null;
  meta: AssetMeta[];
  priceHistory: { date: string; price: number }[];
  change7d: number;
  changeAmount: number;
  isPositive: boolean;
  marketStat: null | Record<string, unknown>;
}

export interface MarketplaceResponse {
  data: MarketplaceAsset[];
  count: number;
  skip: number;
  take: number;
}

interface FetchMarketplaceParams {
  skip?: number;
  take?: number;
  search?: string;
}

const fetchMarketplaceAssets = async ({
  skip = 0,
  take = 12,
  search = '',
}: FetchMarketplaceParams): Promise<IApiResponse<MarketplaceResponse>> => {
  return axiosRequest<MarketplaceResponse>({
    method: 'GET',
    endpoint: '/group/user-in-marketplace',
    params: {
      skip,
      take,
      search: search || undefined,
    },
  });
};

export const useMarketplaceAssets = ({
  skip = 0,
  take = 12,
  search = '',
}: FetchMarketplaceParams = {}) => {
  return useQuery({
    queryKey: ['marketplace-assets', skip, take, search],
    queryFn: () => fetchMarketplaceAssets({ skip, take, search }),
    staleTime: 30000,
    select: (res) => {
      if (res.success) return res.data as MarketplaceResponse;
      return { data: [], count: 0, skip: 0, take } as MarketplaceResponse;
    },
  });
};

/* ================= MARKETPLACE Ask ================= */

interface MarketplaceAskDto {
  assetId: number;
  pricePerUnit: number;
  totalUnits: number;
}

export const createMarketplaceAskApi = async (
  data: MarketplaceAskDto
): Promise<IApiResponse<any>> => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/marketplace/ask',
    data,
  });
};

export const useCreateMarketplaceAsk = () => {
  return useMutation({
    mutationFn: createMarketplaceAskApi,
  });
};

/* ================= MARKETPLACE Bid ================= */

interface MarketplaceBidDto {
  assetId: number;
  bidPricePerUnit: number;
  units: number;
}

export const createMarketplaceBidApi = async (
  data: MarketplaceBidDto
): Promise<IApiResponse<any>> => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/marketplace/bid',
    data,
  });
};

export const useCreateMarketplaceBid = () => {
  return useMutation({
    mutationFn: createMarketplaceBidApi,
  });
};

/* ================= MARKETPLACE MY LISTINGS ================= */

export interface MyListing {
  id: number;
  assetId: number;
  accountId: number;
  type: 'Ask' | 'Bid';
  pricePerUnit: string;
  totalUnits: number;
  remainingUnits: number;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  asset: { assetTitle: string };
}

export interface MyListingsResponse {
  count: number;
  skip: number;
  take: number;
  data: MyListing[];
}

export const fetchMyListings = async (params: {
  assetId: number;
  type?: 'Ask' | 'Bid';
  skip: number;
  take: number;
}): Promise<IApiResponse<MyListingsResponse>> => {
  return axiosRequest({
    method: 'GET',
    endpoint: '/marketplace/my-listings',
    params: {
      assetId: params.assetId,
      ...(params.type ? { type: params.type } : {}),
      skip: params.skip,
      take: params.take,
    },
  });
};

export const useMyListings = (params: {
  assetId: number;
  type?: 'Ask' | 'Bid';
  skip: number;
  take: number;
}) => {
  return useQuery({
    queryKey: [
      'my-listings',
      params.assetId,
      params.type,
      params.skip,
      params.take,
    ],
    queryFn: () => fetchMyListings(params),
    staleTime: 0,
    refetchOnMount: 'always',
    enabled: !!params.assetId,
  });
};

/* ================= MARKETPLACE ASSET LISTINGS ================= */

export interface AssetListing {
  id: number;
  assetId: number;
  accountId: number;
  type: 'Ask' | 'Bid';
  pricePerUnit: string;
  totalUnits: number;
  remainingUnits: number;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  account: { id: number; firstname: string; lastname: string };
}

export interface AssetListingsResponse {
  count: number;
  skip: number;
  take: number;
  data: AssetListing[];
}

export const fetchAssetListings = async (
  assetId: number,
  params: {
    type: 'Ask' | 'Bid';
    skip: number;
    take: number;
    search?: string;
    listingStatus?: string;
  }
): Promise<IApiResponse<AssetListingsResponse>> => {
  return axiosRequest({
    method: 'GET',
    endpoint: `/marketplace/${assetId}/listings`,
    params,
  });
};

export const useAssetListings = (
  assetId: number,
  params: {
    type: 'Ask' | 'Bid';
    skip: number;
    take: number;
    search?: string;
    listingStatus?: string;
  }
) => {
  return useQuery({
    queryKey: [
      'asset-listings',
      assetId,
      params.type,
      params.skip,
      params.take,
      params.search,
      params.listingStatus,
    ],
    queryFn: () => fetchAssetListings(assetId, params),
    staleTime: 0,
    enabled: !!assetId,
  });
};

/* ================= MARKETPLACE Immediate SELL ================= */

interface MarketplaceImmediateSellDto {
  assetId: number;
  units: number;
  password: string;
}

export const createMarketplaceImmediateSellApi = async (
  data: MarketplaceImmediateSellDto
): Promise<IApiResponse<any>> => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/marketplace/immediate-sell',
    data,
  });
};

export const useCreateMarketplaceImmediateSell = () => {
  return useMutation({
    mutationFn: createMarketplaceImmediateSellApi,
  });
};

/* ================= MARKETPLACE OVERVIEW ================= */

export interface MarketplaceOverview {
  assetId: number;
  asset: {
    id: number;
    assetTitle: string;
    assetType: string;
    assetSubType: string | null;
    currentOwnerName: string;
    assetAppreciation: string;
    totalFractions: number;
    soldFractions: number;
    remainingFractions: number;
    yieldPercentage: number;
    isSoldOut: boolean;
    isMarketplace: boolean;
    status: string;
    isVerified: boolean;
    ownershipModel: string;
    price: {
      id: number;
      assetId: number;
      initialPricePerFraction: string;
      currentPricePerFraction: string;
    } | null;
    meta: AssetMeta[];
  };
  totalPnL: number;
  returnPercent: number;
  isPositive: boolean;
  currentValue: number;
  investedAmount: number;
  unitsOwned: number;
  ownershipPercent: number;
  yieldPA: number;
  pricePerUnit: number;
  propertyDetails: {
    totalUnits: number;
    assetTitle: string;
    assetSubType: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
    currentOwnerName: string;
    propertyType: string;
    yearBuilt: string;
    expectedHolding: string;
    roi5Y: string;
  };
  priceHistory?: { date: string; price: number }[];
  change7d?: number;
  changeAmount?: number;
  isPayment?: boolean;
}

const fetchMarketplaceOverview = async (
  assetId: string | number
): Promise<IApiResponse<MarketplaceOverview>> => {
  return axiosRequest<MarketplaceOverview>({
    method: 'GET',
    endpoint: `/marketplace/${assetId}/overview`,
  });
};

export const useMarketplaceOverview = (assetId?: string | number) => {
  return useQuery({
    queryKey: ['marketplace-overview', assetId],
    queryFn: () => fetchMarketplaceOverview(assetId as string | number),
    enabled: !!assetId,
    staleTime: 30000,
    select: (res) => {
      if (res.success) return res.data as MarketplaceOverview;
      return null;
    },
  });
};

/* ================= MARKETPLACE DIRECT BUY ================= */

interface MarketplaceDirectBuyDto {
  listingId: number;
  units: number;
}

export const createMarketplaceDirectBuyApi = async (
  data: MarketplaceDirectBuyDto
): Promise<IApiResponse<any>> => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/marketplace/direct-buy',
    data,
  });
};

export const useCreateMarketplaceDirectBuy = () => {
  return useMutation({
    mutationFn: createMarketplaceDirectBuyApi,
  });
};

/* ================= MARKETPLACE DIRECT SELL ================= */

interface MarketplaceDirectSellDto {
  listingId: number;
  units: number;
}

export const createMarketplaceDirectSellApi = async (
  data: MarketplaceDirectSellDto
): Promise<IApiResponse<any>> => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/marketplace/direct-sell',
    data,
  });
};

export const useCreateMarketplaceDirectSell = () => {
  return useMutation({
    mutationFn: createMarketplaceDirectSellApi,
  });
};

/* ================= MARKETPLACE Immediate SELL LIST ================= */

export interface ImmediateSellRecord {
  id: number;
  asset: { id: number; assetTitle: string; assetType: string };
  pricePerUnit: number;
  units: number;
  totalAmount: number;
  fee: number;
  netAmount: number;
  soldTo: string;
  buyer: { id: number; name: string; email: string };
  tradedAt: string;
}

export interface ImmediateSellListResponse {
  count: number;
  skip: number;
  take: number;
  data: ImmediateSellRecord[];
}

export const fetchImmediateSellList = async (params: {
  assetId: number;
  skip: number;
  take: number;
}): Promise<IApiResponse<ImmediateSellListResponse>> => {
  return axiosRequest({
    method: 'GET',
    endpoint: '/marketplace/immediate-sell/list',
    params,
  });
};

export const useImmediateSellList = (params: {
  assetId: number;
  skip: number;
  take: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['immediate-sell-list', params.assetId, params.skip, params.take],
    queryFn: () => fetchImmediateSellList(params),
    staleTime: 0,
    enabled: !!params.assetId && (params.enabled ?? true),
  });
};

/* ================= MARKETPLACE ORDERBOOK ================= */

export interface OrderBookData {
  assetId: number;
  marketPrice: number;
  changePercent: number;
  isPositive: boolean;
  sellOrders: { price: number; units: number }[];
  buyOrders: { price: number; units: number }[];
  recentTrades: {
    price: number;
    units: number;
    type: 'ASK_FULFILLED' | 'BID_FULFILLED';
    tradedAt: string;
    timeAgo: string;
  }[];
}

export const fetchOrderBook = async (
  assetId: number
): Promise<IApiResponse<OrderBookData>> => {
  return axiosRequest({
    method: 'GET',
    endpoint: `/marketplace/${assetId}/orderbook`,
  });
};

export const useOrderBook = (assetId: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['orderbook', assetId],
    queryFn: () => fetchOrderBook(assetId),
    enabled: !!assetId && enabled,
    staleTime: 0,
    refetchInterval: 10000,
    select: (res) => (res.success ? (res.data as OrderBookData) : null),
  });
};

/* ================= MARKETPLACE CHART ================= */

export interface MarketplaceChart {
  assetId: number;
  currentPrice: number;
  changePercent: number;
  opening: number;
  high: number;
  low: number;
  close: number;
  priceHistory: { date: string; price: number }[];
  volumeHistory: { date: string; volume: number }[];
}

const fetchMarketplaceChart = async (
  assetId: number,
  period: '1M' | '3M' | '6M' | '1Y'
): Promise<IApiResponse<MarketplaceChart>> => {
  return axiosRequest({
    method: 'GET',
    endpoint: `/marketplace/${assetId}/chart`,
    params: { period },
  });
};

export const useMarketplaceChart = (
  assetId: number,
  period: '1M' | '3M' | '6M' | '1Y'
) => {
  return useQuery({
    queryKey: ['marketplace-chart', assetId, period],
    queryFn: () => fetchMarketplaceChart(assetId, period),
    enabled: !!assetId,
    staleTime: 30000,
    select: (res) => (res.success ? (res.data as MarketplaceChart) : null),
  });
};

/* ================= DASHBOARD OVERVIEW MARKETPLACE ================= */

export interface DashboardOverviewData {
  activeListings: number;
  totalMarketValue: number;
  stats: {
    activeBids: number;
    askRequests: number;
    myListings: number;
  };
  weeklyTradeVolume: number;
  trendingAssets: {
    assetId: number;
    assetTitle: string;
    priceChange24h: number;
    trend: 'UP' | 'DOWN';
  }[];
  communities: {
    groupsJoined: number;
    totalMembers: number;
    assetsShared: number;
    mySharedAssets: number;
    newMembersThisWeek: number;
    mostActiveGroup: {
      id: number;
      title: string;
      memberCount: number;
    } | null;
  };
}

const fetchDashboardOverview = async (): Promise<
  IApiResponse<DashboardOverviewData>
> => {
  return axiosRequest({
    method: 'GET',
    endpoint: '/overview/marketplace',
  });
};

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard-overview-marketplace'],
    queryFn: fetchDashboardOverview,
    staleTime: 60000,
    select: (res) => (res.success ? (res.data as DashboardOverviewData) : null),
  });
};
