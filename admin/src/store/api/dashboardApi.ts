import { apiSlice } from './apiSlice';

export type RevenuePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DashboardStats {
  totalUsers: {
    count: number;
    changePercent: number;
    trend: 'UP' | 'DOWN';
  };
  activeUsers: {
    count: number;
    changePercent: number;
    trend: 'UP' | 'DOWN';
  };
  usersByType: {
    investor: number;
    assetOwner: number;
    company: number;
    broker: number;
    trustee: number;
    developer: number;
    director: number;
  };
  revenue: {
    amount: number;
    changePercent: number;
    trend: 'UP' | 'DOWN';
  };
  growth: {
    newUsersThisMonth: number;
    changePercent: number;
    trend: 'UP' | 'DOWN';
  };
  pendingRequests: {
    deposit: number;
    withdrawal: number;
  };
  immediateSaleTransactions: {
    count: number;
    label: string;
  };
  immediateSaleCommission: {
    amount: number;
    label: string;
  };
  marketplaceAssets: {
    count: number;
    label: string;
  };
}

export interface RevenueChartData {
  filter: RevenuePeriod;
  data: { label: string; revenue: number }[];
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({ url: '/admin/dashboard' }),
    }),
    getRevenueChart: builder.query<RevenueChartData, RevenuePeriod>({
      query: (filter) => ({ url: '/admin/dashboard/revenue-chart', params: { filter } }),
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetRevenueChartQuery } = dashboardApi;
