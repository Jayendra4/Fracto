import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

export interface InviteOwner {
  id: number;
  campaignId: number;
  brokerId: number;
  brokerEmail: string;
  assetOwnerEmail: string;
  assetOwnerId: number | null;
  assetId: number | null;
  referralUsesType: string;
  proposedCommissionPct: string;
  finalCommissionPct: string | null;
  assetOwnerStatus: string;
  adminStatus: string;
  isAssetOnBording: boolean;
  remarks: string | null;
  approvedAt: string | null;
  assetOwnerDetails: {
    firstName?: string | null;
    lastName?: string | null;
    mobile?: string | null;
  };
  propertyDetails: {
    city: string;
    state: string;
    country: string;
    pincode: string;
    landArea: string;
    assetType: string;
    assetTitle: string;
    builtupArea: string;
    marketValue: string;
    ownershipModel: string;
  };
  brokerNote: string | null;
  createdAt: string;
  updatedAt: string;
  campaign: {
    id: number;
    code: string;
    ownerId: number;
    referralType: string;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface InviteOwnersResponse {
  count: number;
  skip: number;
  take: number;
  data: InviteOwner[];
}

const fetchInviteOwnersApi = async (params: {
  skip: number;
  take: number;
  brokerId: number;
}) => {
  return axiosRequest<InviteOwnersResponse>({
    method: 'GET',
    endpoint: '/broker/invite-owners',
    params,
  });
};

export function useBrokerInviteOwners(
  params: {
    skip: number;
    take: number;
    brokerId: number;
  },
  options?: any
) {
  return useQuery<IApiResponse<InviteOwnersResponse>>({
    queryKey: [
      'broker-invite-owners',
      params.skip,
      params.take,
      params.brokerId,
    ],
    queryFn: () => fetchInviteOwnersApi(params),
    enabled: !!params.brokerId,
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
}
