import { apiSlice } from './apiSlice';

interface StatItem {
  count: number;
  changePercent: number;
  trend: 'UP' | 'DOWN';
}

interface ActiveAsset {
  assetId: number;
  assetTitle: string;
  image: string;
  location: string;
  totalValue: number;
  roi: number;
  progress: number;
  approvedAt: string;
  rwaStatus: string;
}

export interface PendingRequest {
  requestId: number;
  refCode: string;
  assetId: number;
  assetTitle: string;
  location: string;
  rwaStatus: string;
  displayStatus: 'Under Review' | 'Approved' | 'Rejected';
  totalValue: number;
  timeAgo: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardResponse {
  stats: {
    totalUsers: StatItem;
    totalAssets: StatItem;
    soldFractions: StatItem;
    availableFractions: StatItem;
  };
  chartData: {
    totalAssets: number;
    soldFractions: number;
    availableFractions: number;
  };
  activeAsset: ActiveAsset | null;
  pendingRequests: PendingRequest[];
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => ({
        url: '/trustee/dashboard',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
