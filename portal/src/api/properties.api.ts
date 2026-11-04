import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export interface AssetMeta {
  metaKey: string;
  metaValue: string;
}

interface InterestItem {
  icon: string;
  description: string;
  title: string;
}

export interface AssetDocument {
  documentType: 'ASSET_IMAGE' | string;
  documentUrl: string;
  url?: string;
}

export interface Asset {
  propertyInterest: InterestItem[] | undefined;
  id: number;
  accountId?: number;
  assetType?: string;
  assetSubType: string;
  assetTitle: string;
  currentOwnerName?: string;
  assetAppreciation?: string;
  yieldPercentage?: number;
  totalFractions: number;
  tempGroupId: number;

  currentPricePerFraction?: number | string;
  soldFractions: number;
  remainingFractions: number;
  isSoldOut: boolean;
  status: string;
  newStatus: string;
  isVisible: boolean;
  isVerified: boolean;

  isInterest: boolean;
  paymentStatus?: string | null;
  sharedAsset?: { id: number; tokenAmount?: string } | null;

  ownershipModel?: string;
  ownershipModelOther?: string | null;
  createdAt: string;
  updatedAt: string;
  meta: AssetMeta[];
  documents: AssetDocument[];
  groupId: number;
  isDocumentLocked: boolean;
  price?: {
    id?: number;
    assetId?: number;
    initialPricePerFraction?: string | number;
    currentPricePerFraction?: string | number;
  };

  financials?: {
    yield?: {
      actualYieldPercent?: number;
    };
    perFraction?: {
      annualRent?: number;
      price?: number;
    };
    roi?: {
      fiveYearROI?: number;
      appreciation5Y?: number;
    };
  };

  savedAssets?: {
    assetId: number;
    accountId: number;
  }[];

  totalSoldAmount?: number;
  totalBuyersCount?: number;
}

export interface AssetsResponse {
  data: Asset[];
  total: number;
  skip: number;
  take: number;
}

// const fetchProperties = async ({
//   pageParam = 0,
//   filters,
// }: {
//   pageParam?: number;
//   filters: {
//     assetStatus?: 'Available' | 'Funded' | 'Exited';
//     isVisible?: boolean;
//     assetSubType?: string;
//     newlyAdded?: boolean;
//     search?: string;
//   };
// }): Promise<IApiResponse<AssetsResponse>> => {
//   return axiosRequest<AssetsResponse>({
//     method: 'GET',
//     endpoint: '/assets',
//     params: {
//       ...filters,
//       skip: pageParam,
//       take: 12,
//     },
//   });
// };

const fetchProperties = async ({
  pageParam = 0,
  filters,
}: {
  pageParam?: number;
  filters: {
    assetStatus?: 'Available' | 'Funded' | 'Exited';
    isVisible?: boolean;
    assetSubType?: string;
    newlyAdded?: boolean;
    search?: string;
    groupId?: number; // add this
    accountId?: number;
  };
}): Promise<IApiResponse<AssetsResponse>> => {
  const { groupId, accountId, ...rest } = filters;

  return axiosRequest<AssetsResponse>({
    method: 'GET',
    endpoint: '/assets',
    params: {
      ...rest,
      ...(groupId ? { groupId } : {}), // only send if present
      ...(accountId ? { accountId } : {}), // only send if logged in
      skip: pageParam,
      take: 12,
    },
  });
};
export function useProperties(filters: {
  assetStatus?: 'Available' | 'Funded' | 'Exited';
  isVisible?: boolean;
  assetSubType?: string;
  newlyAdded?: boolean;
  search?: string;
  groupId?: number; // add this
  accountId?: number;
}) {
  return useInfiniteQuery({
    queryKey: [
      'properties',
      filters.assetStatus,
      filters.isVisible,
      filters.assetSubType,
      filters.newlyAdded,
      filters.search ?? '', // 🔥 handle empty search
      filters.groupId ?? 'all', // add this
      filters.accountId ?? 'anon',
    ],

    queryFn: ({ pageParam = 0 }) =>
      fetchProperties({
        pageParam,
        filters,
      }),

    initialPageParam: 0,

    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.success) return undefined;

      const items = lastPage.data?.data ?? [];
      if (items.length < 12) return undefined;

      return allPages.length * 12;
    },
  });
}

const fetchPropertyDetails = async (
  id?: string
): Promise<IApiResponse<Asset>> => {
  return axiosRequest({
    method: 'GET',
    endpoint: `/assets/${id}`,
  });
};

export function usePropertyDetails(id?: string) {
  return useQuery({
    queryKey: ['property-details', id],
    queryFn: () => fetchPropertyDetails(id || ''),
    enabled: !!id,

    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    // Keeps the property-details page (price, isPaid, payment status, etc.)
    // fresh while it stays mounted.
    refetchInterval: 45_000,
  });
}

const fetchPreviewProperties = async (filters?: {
  soldout?: boolean;
  newlyAdded?: boolean;
  available?: boolean;
  assetSubType?: string;
  search?: string;
  assetType?: string;
}): Promise<IApiResponse<AssetsResponse>> => {
  return axiosRequest<AssetsResponse>({
    method: 'GET',
    endpoint: '/assets',
    params: {
      assetStatus: 'Available',
      isVisible: true,
      ...filters,
      skip: 0,
      take: 4,
    },
  });
};

export function usePreviewProperties(filters?: {
  soldout?: boolean;
  newlyAdded?: boolean;
  available?: boolean;
  assetSubType?: string;
  search?: string;
  assetType?: string;
}) {
  return useQuery({
    queryKey: ['properties-preview', filters],
    queryFn: () => fetchPreviewProperties(filters),

    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

// GET /assets?assetStatus=Available — used by the Community landing page's
// "Listed Assets" preview. This response shape (count/skip/take) differs
// from AssetsResponse (total/skip/take) above, and includes the
// group-sharing fields (tempGroupId, sharedAsset, isInterest) the older
// Asset type doesn't model, so it gets its own lightweight type here.
export interface IAvailableAsset {
  id: number;
  assetTitle: string;
  assetType: string;
  status: string;
  newStatus?: string;
  currentOwnerName?: string;
  ownershipModel?: string;
  totalFractions: number;
  soldFractions: number;
  remainingFractions: number;
  tempGroupId: number | null;
  sharedAsset: { id: number; tokenAmount?: string } | null;
  isInterest: boolean;
  paymentStatus?: string | null;
  meta: AssetMeta[];
  documents: AssetDocument[];
  propertyInterest: InterestItem[];
  currentPricePerFraction?: number;
  initialPricePerFraction?: number;
  financials?: Asset['financials'];
}

export interface IAvailableAssetsResponse {
  count: number;
  skip: number;
  take: number;
  data: IAvailableAsset[];
}

const fetchAvailableAssets = async (params: {
  skip?: number;
  take?: number;
  accountId?: number;
}): Promise<IApiResponse<IAvailableAssetsResponse>> => {
  return axiosRequest<IAvailableAssetsResponse>({
    method: 'GET',
    endpoint: '/assets',
    params: {
      assetStatus: 'Available',
      skip: params.skip ?? 0,
      take: params.take ?? 3,
      ...(params.accountId ? { accountId: params.accountId } : {}),
    },
  });
};

export function useAvailableAssets(
  params: { skip?: number; take?: number; accountId?: number } = {}
) {
  return useQuery({
    queryKey: [
      'available-assets',
      params.skip ?? 0,
      params.take ?? 3,
      params.accountId ?? 'anon',
    ],
    queryFn: () => fetchAvailableAssets(params),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
