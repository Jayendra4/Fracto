import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';

export interface BrokerCommissionLedger {
  commissionId: number;
  status: string;
  referralUsesType: string;
  baseAmount: string;
  commissionPct: string;
  commissionAmount: string;
  createdAt: string;
  campaignCode: string;
  investor: {
    id: number;
    name: string;
    email: string;
  };
  asset: {
    id: number;
    title: string;
  };
}

export interface BrokerCommissionsResponse {
  count: number;
  skip: number;
  take: number;
  data: BrokerCommissionLedger[];
}

const fetchBrokerCommissionsApi = async (params: {
  skip: number;
  take: number;
  brokerId: number;
  type?: 'InvestorSignup' | 'AssetOwnerSignup' | 'AssetPromotion';
}): Promise<IApiResponse<BrokerCommissionsResponse>> => {
  return axiosRequest<BrokerCommissionsResponse>({
    method: 'GET',
    endpoint: '/broker/commissions',
    params,
  });
};

export function useBrokerCommissions(params: {
  skip: number;
  take: number;
  brokerId: number;
  type?: 'InvestorSignup' | 'AssetOwnerSignup' | 'AssetPromotion';
}) {
  return useQuery<IApiResponse<BrokerCommissionsResponse>>({
    queryKey: [
      'broker-commissions',
      params.skip,
      params.take,
      params.brokerId,
      params.type,
    ],
    queryFn: () => fetchBrokerCommissionsApi(params),
    placeholderData: keepPreviousData,
    enabled: !!params.brokerId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
