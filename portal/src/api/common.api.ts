import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useMutation, useQuery } from '@tanstack/react-query';

export interface UploadResponse {
  url: string;
  meta: {
    originalname: string;
    filename: string;
    mimetype: string;
    size: number;
  };
}

export const uploadFileApi = async (
  file: File
): Promise<IApiResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosRequest<UploadResponse>({
    method: 'POST',
    endpoint: '/upload',
    data: formData,
    headers: {
      accept: '*/*',
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const fetchCompanyApi = async (token: string) => {
  const timestamp = Date.now();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return axiosRequest<any>({
    method: 'GET',
    endpoint: `/company?timestamp=${timestamp}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export interface IMyAssetMeta {
  metaKey: string;
  metaType: string;
  metaValue: string;
}

export interface IMyAssetDocument {
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

export interface IMyAsset {
  id: number;
  accountId: number;
  assetSubType: string | null;
  assetTitle: string;
  assetType: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  isVisible: boolean;
  isVerified: boolean;
  isSoldOut: boolean;
  currentOwnerName: string;
  isBrokerReferred: boolean;
  ownerStatus: string;
  ownershipModel: string;
  steps?: string;
  totalFractions: number;
  soldFractions: number;
  remainingFractions: number;
  assetAppreciation: string;
  price: {
    id: number;
    assetId: number;
    initialPricePerFraction: string;
    currentPricePerFraction: string;
  } | null;
  propertyInterest: unknown[];
  rwaRequest: {
    status: string;
    statusForLegal?: string;
    statusForValuation?: string;
    statusForDueDiligence?: string;
    rejectionReason: string | null;
    legalRejectionReason?: string | null;
    valuationRejectionReason?: string | null;
    dueDiligenceRejectionReason?: string | null;
    trusteeComment: string | null;
    fractionalizationStatus: string;
    trusteeId: number | null;
  };
  meta: IMyAssetMeta[];
  documents: IMyAssetDocument[];
  currentPricePerFraction: number | null;
  financials: unknown;
}

export interface IMyAssetsResponse {
  count: number;
  brokerReferredAssetsCount: number;
  skip: number;
  take: number;
  data: IMyAsset[];
}

export type MyAssetStatus =
  | 'Draft'
  | 'Reviewed'
  | 'Rejected'
  | 'Available'
  | 'Funded'
  | 'RequestLive';
export type MyAssetRwaStatus =
  | 'LegalReviewed'
  | 'ValuationReviewed'
  | 'DueDiligence'
  | 'LegalRejected'
  | 'ValuationRejected'
  | 'DueDiligenceRejected';

interface IFetchMyAssetsParams {
  skip?: number;
  take?: number;
  search?: string;
  assetStatus?: MyAssetStatus | '';
  rwaStatus?: MyAssetRwaStatus | '';
}

export const fetchMyAssetsApi = async ({
  skip = 0,
  take = 10,
  search = '',
  assetStatus = '',
  rwaStatus = '',
}: IFetchMyAssetsParams) => {
  return axiosRequest<IMyAssetsResponse>({
    method: 'GET',
    endpoint: '/assets/me',
    params: {
      skip,
      take,
      search: search || undefined,
      assetStatus: assetStatus || undefined,
      rwaStatus: rwaStatus || undefined,
    },
  });
};

export const fetchMyBankAccountsApi = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return axiosRequest<any>({
    method: 'GET',
    endpoint: '/bank-account/me',
  });
};

export function useCompany() {
  return useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      const res = await fetchCompanyApi(token);
      return res;
    },
  });
}

export function useMyAssets({
  skip = 0,
  take = 10,
  search = '',
  assetStatus = '',
  rwaStatus = '',
}: IFetchMyAssetsParams = {}) {
  return useQuery({
    queryKey: ['my-assets', skip, take, search, assetStatus, rwaStatus],
    queryFn: () =>
      fetchMyAssetsApi({ skip, take, search, assetStatus, rwaStatus }),
    staleTime: 0,
    refetchOnMount: 'always',
    // Polls while this hook stays mounted (i.e. while the user is on
    // /dashboard/my-assets) — pauses automatically once unmounted.
    refetchInterval: 30_000,
  });
}

export function useMyBankAccounts() {
  return useQuery({
    queryKey: ['my-bank-accounts'],
    queryFn: fetchMyBankAccountsApi,
  });
}
