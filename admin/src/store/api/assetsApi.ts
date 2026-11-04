// /assets/all

import { Asset, AssetType, PaginatedResponse, RwaStatus } from '@/types';
import { apiSlice } from './apiSlice';
export interface PaginatedResponseAssets<T> {
  data: T[];
  count: number;
  skip: number;
  take: number;
}

export interface AdminAsset {
  assetId: number;
  assetTitle: string;
  location: {
    address: string | null;
    city: string;
    state: string;
  } | null;
  assetStatus: string;
  currentStep: number;
  rwaStatus: string;
}

export interface OverviewAdminAsset {
  assetTitle: string;
  spvName: string | null;
  shareholdersCount: number;
  governanceVoteCount: number;
  votePercentage: number;
}

export interface OverviewAdminResponse {
  totalAssets: number;
  availableAssetsCount: number;
  spvCreatedCount: number;
  pendingRwaStatus: {
    legal: number;
    valuation: number;
    dueDiligence: number;
    total: number;
  };
  assets: {
    data: OverviewAdminAsset[];
    count: number;
  };
}

export interface AssetPayload {
  skip?: number;
  take?: number;
  search?: string;
  rwaStatus?: RwaStatus;
  subType?: string;
  assetStatus?: string;
  soldout?: boolean;
  newlyAdded?: boolean;
  available?: boolean;
  isVisible?: boolean;
  assetType?: AssetType;
  fromDate?: string;
  toDate?: string;
}

export interface IconItem {
  id: number;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAssetPayload {
  id: number;
  basicInfo?: {
    assetType?: string;
    assetTitle?: string;
    assetSubType?: string;
    currentOwnerName?: string;
    ownershipModel?: string;
  };
  price?: {
    priceId?: number;
    currentPricePerFraction?: string;
  };
  meta?: {
    metaKey: string;
    metaValue: string;
    metaType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN';
  }[];
  documents?: {
    documentType: string;
    documentName: string;
    documentUrl: string;
    remarks: string;
  }[];
}

export const assetsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAssets: builder.query<PaginatedResponseAssets<Asset>, AssetPayload>({
      query: ({
        skip = 0,
        take = 10,
        search,
        subType,
        soldout,
        newlyAdded,
        available,
        assetStatus,
        rwaStatus,
        assetType,
        fromDate,
        toDate,
      }) => ({
        url: '/assets',
        params: {
          skip,
          take,
          assetStatus,
          rwaStatus,
          assetType,
          fromDate,
          toDate,
          ...(search ? { search } : {}),
          ...(subType ? { subType } : {}),
          ...(soldout !== undefined ? { soldout } : {}),
          ...(newlyAdded !== undefined ? { newlyAdded } : {}),
          ...(available !== undefined ? { available } : {}),
        },
      }),
      providesTags: ['Assets'],
    }),
    getAssetById: builder.query<Asset, number>({
      query: (assetId) => `/assets/${assetId}`,
      providesTags: ['Assets'],
    }),
    getUserInvestedAssets: builder.query<
      PaginatedResponse<Asset>,
      {
        skip?: number;
        take?: number;
        search?: string;
        accountId?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, accountId }) => ({
        url: '/asset-purchase/me',
        params: {
          skip,
          take,
          accountId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Assets'],
    }),

    getUserReferredAssets: builder.query<
      PaginatedResponse<Asset>,
      {
        skip?: number;
        take?: number;
        search?: string;
        accountId?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, accountId }) => ({
        url: '/broker/invite-owners',
        params: {
          skip,
          take,
          brokerId: accountId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Assets'],
    }),
    getUserUploadedAssets: builder.query<
      PaginatedResponse<Asset>,
      {
        skip?: number;
        take?: number;
        search?: string;
        accountId?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, accountId }) => ({
        url: '/assets/admin',
        params: {
          skip,
          take,
          accountId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Assets'],
    }),
    fractionalizeAsset: builder.mutation<
      void,
      {
        id: number;
        totalFractions: number;
        pricePerFraction: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/assets/${id}/fractionalize`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Assets'],
    }),
    updateAsset: builder.mutation<void, UpdateAssetPayload>({
      query: ({ id, ...body }) => ({
        url: `/assets/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Assets'],
    }),
    getIconList: builder.query<IconItem[], void>({
      query: () => ({
        url: '/icon', // 👈 backend endpoint confirm kar lena
      }),
      providesTags: ['Assets'],
    }),
    switchToMarketplace: builder.mutation<
      {
        data: any;
        message: string;
      },
      number
    >({
      query: (id) => ({
        url: `/assets/${id}/switch-to-marketplace`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Assets'],
    }),
    getImmediateSaleList: builder.query<
      {
        count: number;
        skip: number;
        take: number;
        data: {
          id: number;
          asset: { id: number; assetTitle: string; assetType: string };
          pricePerUnit: number;
          units: number;
          totalAmount: number;
          netAmount: number;
          soldTo: string;
          buyer: { id: number; name: string; email?: string };
          tradedAt: string;
        }[];
      },
      { assetId: number; skip?: number; take?: number; search?: string }
    >({
      query: ({ assetId, skip = 0, take = 10, search }) => ({
        url: '/marketplace/immediate-sell/list',
        params: { assetId, skip, take, tradeType: 'MARKET_SELL', ...(search ? { search } : {}) },
      }),
    }),
    getAssetInvoiceList: builder.query<
      {
        count: number;
        skip: number;
        take: number;
        data: {
          id: number;
          accountId: number | null;
          assetId: number;
          firstName: string;
          lastName: string;
          email: string;
          mobile: string;
          tokenAmount: number;
          orderId: string;
          rozarpayPaymentId: string;
          assetTitle: string;
          invoiceUrl: string;
          paidAt: string;
          createdAt: string;
          updatedAt: string;
        }[];
      },
      { assetId: number; skip?: number; take?: number; search?: string }
    >({
      query: ({ assetId, skip = 0, take = 10, search }) => ({
        url: `/share-asset/invoice-list/${assetId}`,
        params: { skip, take, ...(search ? { search } : {}) },
      }),
      providesTags: ['Assets'],
    }),
    adminReviewAsset: builder.mutation<
      void,
      {
        assetId: number;
        status: string;
        newStatus: string;
        rejectionReason?: string;
      }
    >({
      query: ({ assetId, ...body }) => ({
        url: `/assets/${assetId}/admin-review`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Assets'],
    }),
    finalizeListing: builder.mutation<
      void,
      {
        assetId: number;
        status: string;
        listingAmount: number;
        name?: string;
        secondaryClubId?: number;
        totalFractions?: number;
        pricePerFraction?: number;
        rejectionReason?: string;
      }
    >({
      query: ({ assetId, ...body }) => ({
        url: `/assets/${assetId}/finalize-listing`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Assets'],
    }),
    getAdminAssets: builder.query<
      { data: AdminAsset[]; count: number },
      { skip: number; take: number; newlyAdded?: boolean; search?: string }
    >({
      query: ({ skip = 0, take = 10, newlyAdded = true, search }) => ({
        url: '/assets/admin',
        params: {
          skip,
          take,
          newlyAdded,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Assets'],
    }),
    getOverviewAdmin: builder.query<
      OverviewAdminResponse,
      { skip: number; take: number; search?: string }
    >({
      query: ({ skip = 0, take = 10, search }) => ({
        url: '/overview/admin',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Assets'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllAssetsQuery,
  useGetAssetByIdQuery,
  useGetUserInvestedAssetsQuery,
  useGetUserReferredAssetsQuery,
  useGetUserUploadedAssetsQuery,
  useFractionalizeAssetMutation,
  useUpdateAssetMutation,
  useGetIconListQuery,
  useSwitchToMarketplaceMutation,
  useGetAssetInvoiceListQuery,
  useGetImmediateSaleListQuery,
  useAdminReviewAssetMutation,
  useFinalizeListingMutation,
  useGetAdminAssetsQuery,
  useGetOverviewAdminQuery,
} = assetsApi;
