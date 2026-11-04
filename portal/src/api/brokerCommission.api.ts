import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

export interface IBrokerCommissionSummary {
  holdAmount: string;
  pendingAmount: string;
  pendingWithdraw: string;
  releasedAmount: string;
  availableToWithdraw: string;
  estimatedAmount: string;
  totalCommission?: number;
}

export const fetchBrokerCommissionSummaryApi = async (params?: {
  fromDate?: string;
  toDate?: string;
}): Promise<IApiResponse<IBrokerCommissionSummary>> => {
  return axiosRequest<IBrokerCommissionSummary>({
    method: 'GET',
    endpoint: '/broker/commission-summary',
    params,
  });
};

export function useBrokerCommissionSummary(params?: {
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: ['broker-commission-summary', params],
    queryFn: () => fetchBrokerCommissionSummaryApi(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export interface IPayoutRequest {
  amount: number;
}

export const requestPayoutApi = async (data: IPayoutRequest) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/broker/commission/payout-request',
    data,
  });
};

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestPayoutApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['broker-commission-summary'],
      });
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
    },
  });
}

export const fetchCommissionDetailApi = async (
  id: string | number
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'GET',
    endpoint: `/broker/commission/${id}`,
  });
};

export function useCommissionDetail(id: string | number) {
  return useQuery({
    queryKey: ['commission-detail', id],
    queryFn: () => fetchCommissionDetailApi(id),
    enabled: !!id,
  });
}
