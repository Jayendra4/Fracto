// /assets/all

import { RwaStatus, Asset, PaginatedResponse, RwaNewStatus } from '@/types';
import { apiSlice } from './apiSlice';

export interface PaginatedResponseAssets<T> {
  data: T[];
  count: number;
  skip: number;
  take: number;
}

export const assetsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAssets: builder.query<
      PaginatedResponseAssets<Asset>,
      {
        skip?: number;
        take?: number;
        search?: string;
        rwaStatus?: RwaStatus;
        subType?: string;
        assetType?: string;
        assetStatus?: string;
        soldout?: boolean;
        newlyAdded?: boolean;
        available?: boolean;
        isVisible?: boolean;
        fromDate?: string;
        toDate?: string;
        newRWAStatus?: string;
        steps?: number;
      }
    >({
      query: ({
        skip = 0,
        take = 10,
        search,
        subType,
        assetType,
        soldout,
        newlyAdded,
        available,
        assetStatus,
        rwaStatus,
        fromDate,
        toDate,
        newRWAStatus,
        steps,
      }) => ({
        url: '/assets',
        params: {
          skip,
          take,
          assetStatus,
          rwaStatus,
          fromDate,
          // newRWAStatus,
          toDate,
          ...(search ? { search } : {}),
          ...(subType ? { subType } : {}),
          ...(assetType ? { assetType } : {}),
          ...(soldout !== undefined ? { soldout } : {}),
          ...(newlyAdded !== undefined ? { newlyAdded } : {}),
          ...(available !== undefined ? { available } : {}),
          ...(newRWAStatus ? { newRWAStatus } : {}),
          ...(steps !== undefined ? { steps } : {}),
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
    updateAssetStatus: builder.mutation<
      void,
      {
        id: number;
        status: string;
        newStatus: string;
        trusteeComment?: string;
        rejectionReason?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/trustee/${id}/review`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Assets'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllAssetsQuery,
  useGetAssetByIdQuery,
  useGetUserReferredAssetsQuery,
  useGetUserInvestedAssetsQuery,
  useGetUserUploadedAssetsQuery,
  useUpdateAssetStatusMutation,
} = assetsApi;
