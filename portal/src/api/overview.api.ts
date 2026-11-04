import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useQuery } from '@tanstack/react-query';

export type OverviewPeriod = '24h' | '7d' | '30d';

export interface OverviewSummary {
  portfolioAmount: number;
  investedAssetCount: number;
  totalIncomeCollected: number;
}

export interface OverviewAsset {
  assetId: number;
  assetTitle: string;
  location: string;
  investedAmount: number;
  fractionsPurchased: number;
  incomeCollected: number;
  percentage: number;
  hasInvested: boolean;
}

export interface OverviewPortfolioHolding {
  assetId: number;
  assetTitle: string;
  spvId: number | null;
  spvName: string | null;
  invested: number;
  currentValue: number;
  status: string;
}

export interface OverviewPortfolio {
  totalInvested: number;
  activeCommitments: number;
  spvCount: number;
  kycStatus: {
    status: string;
    label: string;
  };
  myHoldings: OverviewPortfolioHolding[];
  totalPortfolioValue: {
    amount: number;
    changeAmount: number;
    changePercent: number;
    trend: 'UP' | 'DOWN';
  };
  assetAppreciation: {
    amount: number;
    percentage: number;
    trend: 'UP' | 'DOWN';
    period: string;
  };
  realizedProfitLoss: {
    amount: number;
    type: 'PROFIT' | 'LOSS';
    label: string;
    period: string;
  };
  totalIncomeCollected: number;
  totalPropertiesInvested: number;
  propertyBreakdown: {
    assetId: number;
    assetTitle: string;
    location: string;
    investedAmount: number;
    fractionsPurchased: number;
    incomeCollected: number;
    yieldPercentage: number;
  }[];
  portfolioPerformance: {
    month: string;
    year: number;
    value: number;
  }[];
}

const fetchOverviewSummary = (): Promise<IApiResponse<OverviewSummary>> =>
  axiosRequest({ method: 'GET', endpoint: '/overview' });

const fetchOverviewAssets = (): Promise<IApiResponse<OverviewAsset[]>> =>
  axiosRequest({ method: 'GET', endpoint: '/overview/assets' });

const fetchOverviewPortfolio = (
  period?: OverviewPeriod
): Promise<IApiResponse<OverviewPortfolio>> =>
  axiosRequest({
    method: 'GET',
    endpoint: '/overview/portfolio',
    ...(period ? { params: { period } } : {}),
  });

export const useOverviewSummary = () =>
  useQuery({
    queryKey: ['overview-summary'],
    queryFn: fetchOverviewSummary,
    staleTime: 60000,
    select: (res) => (res.success ? (res.data as OverviewSummary) : null),
  });

export const useOverviewAssets = () =>
  useQuery({
    queryKey: ['overview-assets'],
    queryFn: fetchOverviewAssets,
    staleTime: 60000,
    select: (res) => (res.success ? (res.data as OverviewAsset[]) : []),
  });

export const useOverviewPortfolio = (period?: OverviewPeriod) =>
  useQuery({
    queryKey: ['overview-portfolio', period],
    queryFn: () => fetchOverviewPortfolio(period),
    staleTime: 60000,
    select: (res) => (res.success ? (res.data as OverviewPortfolio) : null),
  });

export interface OverviewBusinessListedAsset {
  assetId: number;
  assetTitle: string;
  stage: string;
  status: string;
  raiseProgress: number;
  totalValue: number;
  soldValue: number;
}

export interface OverviewBusinessTrackingPipelineStep {
  stage: string;
  status: 'completed' | 'current' | 'pending' | (string & {});
}

export interface OverviewBusinessActionCenterItem {
  id: number;
  code: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  path: string | null;
  type: 'INFORMATIONAL' | (string & {});
  viewed: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface OverviewBusiness {
  stats: {
    totalAssets: number;
    openForInvestment: number;
    fullyLiquidated: number;
    totalValue: number;
    openForInvestmentValue: number;
    fullyLiquidatedValue: number;
    liveCount: number;
    closedCount: number;
    capitalRaised: number;
    capitalRaisedPercent: number;
    pendingActions: number;
    complianceQueries: number;
  };
  listedAssets: OverviewBusinessListedAsset[];
  latestAsset: {
    assetId: number;
    assetTitle: string;
    liquidationStatus: string;
    soldFractions: number;
    totalFractions: number;
    soldValue: number;
    totalValue: number;
    liquidationPercent: number;
    totalInvestors: number;
    createdAt: string;
    processTimeline: {
      stage: string;
      status:
        | 'completed'
        | 'in_progress'
        | 'active'
        | 'pending'
        | (string & {});
      date: string | null;
      isEstimated: boolean;
    }[];
    currentStage: string;
    trackingPipeline: OverviewBusinessTrackingPipelineStep[];
  } | null;
  actionCenter: OverviewBusinessActionCenterItem[];
}

const fetchOverviewBusiness = (): Promise<IApiResponse<OverviewBusiness>> =>
  axiosRequest({ method: 'GET', endpoint: '/overview/business' });

export const useOverviewBusiness = () =>
  useQuery({
    queryKey: ['overview-business'],
    queryFn: fetchOverviewBusiness,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 60_000,
    select: (res) => (res.success ? (res.data as OverviewBusiness) : null),
  });

export interface ActivityWidgetItem {
  id: number;
  code: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  path: string | null;
  type: 'INFORMATIONAL' | (string & {});
  viewed: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface ActivityWidgetDocument {
  id: number;
  name: string;
  status: string;
  uploadedAt: string;
  verifiedAt: string | null;
}

export interface ActivityWidgetPendingVote {
  secondaryClubId: number;
  title: string;
  status: string;
  assetId: number;
  assetTitle: string;
  totalMembers: number;
  totalVotes: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  voteStatus: 'Scheduled' | 'Active' | 'Ended' | (string & {});
}

export interface ActivityWidgetsResponse {
  recentActivity: ActivityWidgetItem[];
  documentsAcknowledgements: ActivityWidgetDocument[];
  pendingVotes: ActivityWidgetPendingVote[];
}

const fetchActivityWidgets = (): Promise<
  IApiResponse<ActivityWidgetsResponse>
> => axiosRequest({ method: 'GET', endpoint: '/overview/activity-widgets' });

export const useActivityWidgets = () =>
  useQuery({
    queryKey: ['overview-activity-widgets'],
    queryFn: fetchActivityWidgets,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 45_000,
    select: (res) =>
      res.success ? (res.data as ActivityWidgetsResponse) : null,
  });
