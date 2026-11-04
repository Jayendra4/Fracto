import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useQuery } from '@tanstack/react-query';

export interface DueDiligenceDocument {
  documentId: number;
  documentName: string;
  documentType: string;
  documentUrl: string;
  createdAt: string;
}

export type DueDiligenceStatus =
  | 'DueDiligence'
  | 'DueDiligenceRejected'
  | (string & {});

export interface DueDiligenceAsset {
  assetId: number;
  assetName: string;
  status: DueDiligenceStatus;
  rejectionReason: string | null;
  reviewedAt: string;
  documents: DueDiligenceDocument[];
}

export interface DueDiligenceDocumentsResponse {
  count: number;
  skip: number;
  take: number;
  data: DueDiligenceAsset[];
}

export type DueDiligenceStatusFilter = 'DueDiligence' | 'DueDiligenceRejected';

export const fetchDueDiligenceDocumentsApi = async (
  skip = 0,
  take = 10,
  search?: string,
  status?: DueDiligenceStatusFilter
): Promise<IApiResponse<DueDiligenceDocumentsResponse>> => {
  return axiosRequest<DueDiligenceDocumentsResponse>({
    method: 'GET',
    endpoint: '/assets/me/documents/due-diligence',
    params: {
      skip,
      take,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    },
  });
};

export const useDueDiligenceDocuments = (
  skip = 0,
  take = 10,
  search?: string,
  status?: DueDiligenceStatusFilter
) => {
  return useQuery({
    queryKey: [
      'due-diligence-documents',
      skip,
      take,
      search ?? '',
      status ?? 'All',
    ],
    queryFn: () => fetchDueDiligenceDocumentsApi(skip, take, search, status),
    staleTime: 0,
    refetchOnMount: 'always',
    select: (res) => {
      if (res.success) return res.data;
      return { count: 0, skip, take, data: [] };
    },
  });
};
