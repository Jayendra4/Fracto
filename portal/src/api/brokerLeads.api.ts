import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';

export interface BrokerLead {
  id: number;
  referralUsesType: 'InvestorSignup' | 'AssetOwnerSignup' | 'AssetPromotion';
  usageCount?: number;
  rewardLimit?: number;
  isCompleted: boolean;
  firstUsedAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    type: string;
    kycStatus: 'Approved' | 'Submitted' | 'Pending' | 'Rejected';
    kyc?: {
      status: 'Approved' | 'Submitted' | 'Pending' | 'Rejected';
      address?: {
        city: string;
        state: string;
      };
    };
  };
  referralCode: string;
  referredCode?: string;
  referredPropertyInvited: any;
}

export interface BrokerLeadsResponse {
  count: number;
  skip: number;
  take: number;
  data: BrokerLead[];
}

const fetchBrokerLeadsApi = async (params: {
  skip: number;
  take: number;
  type?: string;
  brokerId?: number;
  search?: string;
}): Promise<IApiResponse<BrokerLeadsResponse>> => {
  return axiosRequest<BrokerLeadsResponse>({
    method: 'GET',
    endpoint: '/broker/leads',
    params,
  });
};

export function useBrokerLeads(params: {
  skip: number;
  take: number;
  type?: string;
  brokerId?: number;
  search?: string;
}) {
  return useQuery<IApiResponse<BrokerLeadsResponse>>({
    queryKey: [
      'broker-leads',
      params.skip,
      params.take,
      params.type,
      params.brokerId,
      params.search,
    ],
    queryFn: () => fetchBrokerLeadsApi(params),
    placeholderData: keepPreviousData,
    enabled: !!params.brokerId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
