/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';

export interface IBrokerRecentActivity {
  id: number;
  title: string;
  message: string;
  path: string | null;
  type: string;
  createdAt: string;
  isRead: boolean;
}

export interface IBrokerActionCenterItem {
  referralId: number;
  assetName: string;
  assetOwnerName: string;
  status: string;
  createdAt: string;
}

export interface IBrokerDashboardRes {
  stats: {
    totalLeads: number;
    activeLeads: number;
    assetsInProgress: number;
  };
  earnings: {
    totalCommission: string;
    last7Days: number;
    lockedCommission: number;
  };
  leadGainsCount: number;
  withdrawalProcessingAmount: string;
  assetReferralCount: number;
  commissionEarned: string;
  recentActivity: IBrokerRecentActivity[];
  actionCenter: IBrokerActionCenterItem[];
}

export const fetchBrokerDashboardApi = async (): Promise<
  IApiResponse<IBrokerDashboardRes>
> => {
  return axiosRequest<IBrokerDashboardRes>({
    method: 'GET',
    endpoint: '/broker/dashboard',
  });
};

export function useBrokerDashboard() {
  return useQuery({
    queryKey: ['broker-dashboard'],
    queryFn: fetchBrokerDashboardApi,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export interface ILockedCommissionRes {
  totalLockedAmount: number;
  properties: any[];
}

export const fetchBrokerLocksCommissionApi = async (): Promise<
  IApiResponse<ILockedCommissionRes>
> => {
  return axiosRequest<ILockedCommissionRes>({
    method: 'GET',
    endpoint: '/broker/locks-commission',
  });
};

export function useBrokerLocksCommission() {
  return useQuery({
    queryKey: ['broker-locks-commission'],
    queryFn: fetchBrokerLocksCommissionApi,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
