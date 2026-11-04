/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed endpoints, see IAssetDetail below for the typed pattern */
import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useQuery } from '@tanstack/react-query';

export interface ICreateAssetPayload {
  basicInfo: any;
  meta: any[];
  documents: any[];
}

export interface IUpdateAssetPayload {
  assetId: number;
  status: 'Approved' | 'Rejected';
}
export const createAssetApi = async (
  data: ICreateAssetPayload
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'POST',
    endpoint: '/assets',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
export const UpdateAssetApi = async (
  data: IUpdateAssetPayload
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'PATCH',
    endpoint: '/assets',
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateStepsAssetApi = async (
  assetId: number | string,
  data: ICreateAssetPayload
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'PATCH', // backend confirm kare to PUT bhi ho sakta hai
    endpoint: `/assets/${assetId}`, // ✅ correct endpoint
    data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const requestListingApi = async (
  assetId: number | string
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'PATCH',
    endpoint: `/assets/${assetId}/request-listing`,
  });
};

export const getMeAssetsApi = async (params?: {
  skip?: number;
  take?: number;
  assetStatus?: string;
}): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'GET',
    endpoint: '/assets/me',
    params,
  });
};

export const getIconListApi = async (): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'GET',
    endpoint: '/icon',
  });
};

export interface IAssetDetailMeta {
  id: number;
  assetId: number;
  metaKey: string;
  metaValue: string;
  metaType: string;
  isVerified: boolean;
  remark: string | null;
  createdAt: string;
}

export interface IAssetDetailDocument {
  id: number;
  assetId: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  uploadedAt: string;
  isVerified: boolean;
  remark: string | null;
  url: string;
}

export interface IAssetDetail {
  id: number;
  accountId: number;
  assetType: string;
  assetSubType: string | null;
  assetTitle: string;
  currentOwnerName: string;
  mapUrl?: string | null;
  ownershipModel: string;
  ownershipModelOther?: string | null;
  status: 'Draft' | 'Reviewed' | 'Rejected' | (string & {});
  newStatus?: string;
  ownerStatus: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason: string | null;
  updateAsset: boolean;
  steps?: string;
  isVisible: boolean;
  isVerified: boolean;
  groupId: number | null;
  tempGroupIds?: number[];
  meta: IAssetDetailMeta[];
  documents: IAssetDetailDocument[];
  propertyInterest: {
    iconId?: number;
    title: string;
    description: string;
    icon: string;
  }[];
  assetOwner: {
    id: number;
    assetId: number;
    name: string;
    email: string;
    mobile: string;
  } | null;
  rwaRequest: {
    id: number;
    assetId: number;
    status: string;
    newRwaStatus?: string;
    trusteeComment: string | null;
    rejectionReason: string | null;
    fractionalizationStatus: string;
    statusForDueDiligence?: string;
    statusForValuation?: string;
    statusForLegal?: string;
    dueDiligenceRejectionReason?: string | null;
    valuationRejectionReason?: string | null;
    legalRejectionReason?: string | null;
  } | null;
  secondaryClubId?: number | null;
  hasVoted?: boolean;
  choice?: 'Yes' | 'No' | 'Abstain' | (string & {}) | null;
  voteStartDate?: string | null;
  voteEndDate?: string | null;
  voteStatus?: 'Scheduled' | 'Active' | 'Ended' | (string & {}) | null;
  spvCreated?: boolean;
  spvId?: number | null;
  spvStatus?: string | null;
  isVotingDisabled?: boolean;
  votingDisabledReason?: string | null;
}

export const getAssetByIdApi = async (
  id: string
): Promise<IApiResponse<IAssetDetail>> => {
  return axiosRequest<IAssetDetail>({
    method: 'GET',
    endpoint: `/assets/${id}`,
  });
};

export function useAssetById(id?: string | number) {
  return useQuery({
    queryKey: ['asset-by-id', id],
    queryFn: () => getAssetByIdApi(String(id)),
    enabled: !!id,
    // Fetch immediately every time this mounts with an id (e.g. navigating
    // back to /dashboard/add-asset?id=X), then poll while it stays mounted.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 30_000,
  });
}

export const getAssetByBrokerApi = async (params?: {
  skip?: number;
  take?: number;
  search?: string;
  ownerStatus?: string;
}): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'GET',
    endpoint: `/broker/owner-approval-assets`,
    params,
  });
};

export const getAssetPurchaseHistoryApi = async (
  assetId: string | number,
  params?: {
    skip?: number;
    take?: number;
  }
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'GET',
    endpoint: `/asset-purchase/${assetId}/purchase-history`,
    params,
  });
};
