import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, MapPin } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useCurrentAdmin } from '@/hooks/redux';
import { Link, useNavigate } from 'react-router-dom';
import PropertyDonutChart from './PropertyDonutChart';
import { Notification, useGetAllNotificationsQuery, useUpdateReadStatusMutation } from '@/store/api/notificationApi';
import {
  useGetDashboardQuery,
  DashboardResponse,
  PendingRequest as PendingRequestType,
} from '@/store/api/dashboardApi';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

function MetricCard({ title, value, change, trend, icon: Icon, href }: MetricCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className={`card-shadow hover-lift border-gradient overflow-hidden ${href ? 'cursor-pointer' : ''}`}
      onClick={() => href && navigate(href)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-2">
          {trend === 'up' ? (
            <div className="flex items-center gap-1 text-emerald-500">
              <ArrowUpRight className="h-3 w-3" />
              <span className="font-medium">{change}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500">
              <ArrowDownRight className="h-3 w-3" />
              <span className="font-medium">{change}</span>
            </div>
          )}
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="card-shadow overflow-hidden">
          <CardContent className="p-6">
            <div className="skeleton h-4 w-1/2 mb-4 rounded"></div>
            <div className="skeleton h-8 w-1/3 mb-2 rounded"></div>
            <div className="skeleton h-3 w-2/3 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Metrics({ stats }: { stats: DashboardResponse['stats'] }) {
  const { t } = useTranslation();

  const metrics = [
    {
      title: t('dashboard.totalUsers'),
      value: stats.totalUsers.count.toLocaleString(),
      change: `${stats.totalUsers.changePercent > 0 ? '+' : ''}${stats.totalUsers.changePercent}%`,
      trend: stats.totalUsers.trend === 'UP' ? ('up' as const) : ('down' as const),
      icon: Users,
      href: '/users/CorporateInvestor',
    },
    {
      title: 'Total Properties',
      value: stats.totalAssets.count.toLocaleString(),
      change: `${stats.totalAssets.changePercent > 0 ? '+' : ''}${stats.totalAssets.changePercent}%`,
      trend: stats.totalAssets.trend === 'UP' ? ('up' as const) : ('down' as const),
      icon: Activity,
      href: '/asset-list',
    },
    {
      title: 'Sold Properties',
      value: stats.soldFractions.count.toLocaleString(),
      change: `${stats.soldFractions.changePercent > 0 ? '+' : ''}${stats.soldFractions.changePercent}%`,
      trend: stats.soldFractions.trend === 'UP' ? ('up' as const) : ('down' as const),
      icon: Activity,
      href: '/asset-list',
    },
    {
      title: 'Total Fractions',
      value: stats.availableFractions.count.toLocaleString(),
      change: `${stats.availableFractions.changePercent > 0 ? '+' : ''}${stats.availableFractions.changePercent}%`,
      trend: stats.availableFractions.trend === 'UP' ? ('up' as const) : ('down' as const),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}

function PendingRequest({ requests }: { requests: PendingRequestType[] }) {
  const statusColors = {
    Approved: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30',
    'Under Review': 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30',
    Rejected: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30',
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Pending Requests</CardTitle>
          <div>
            {/* <Button variant={'default'} className="px-4 py-2 text-sm ripple">
              All Request
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((item) => (
            <div
              key={item.requestId}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-border/50 hover:border-primary/30"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    {item.timeAgo}
                  </div>
                </div>
                <p className="text-sm font-medium">{item.assetTitle}</p>
                <p className="text-xs text-muted-foreground">{item.refCode}</p>
              </div>
              <div className="space-y-2 flex flex-col justify-end items-end">
                <span
                  className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${statusColors[item.displayStatus]}`}
                >
                  {item.displayStatus}
                </span>
                <p className="text-sm font-semibold">
                  {item.totalValue > 0 ? `₹${item.totalValue.toLocaleString()}` : '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationCard() {
  const navigate = useNavigate();
  const [updateReadStatus] = useUpdateReadStatusMutation();

  const { data, isLoading, isError } = useGetAllNotificationsQuery({ skip: 0, take: 5 });
  const notifications: Notification[] = data?.data ?? [];

  if (isLoading) {
    return (
      <Card className="card-shadow">
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-20"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="card-shadow p-6 text-sm text-red-400">Failed to load notifications</Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Notifications</CardTitle>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30 text-primary font-semibold text-xs">
            {notifications.length}
          </div>
        </div>
      </CardHeader>

      <div className="space-y-3 px-5 pb-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Activity className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.path && item.path.trim().toLowerCase() !== 'null') {
                  if (!item.viewed) {
                    updateReadStatus({ id: Number(item.id) });
                  }
                  navigate(item.path);
                }
              }}
              className={`flex items-start gap-4 rounded-xl glass p-4 hover:bg-muted/30 transition-all border border-border/50 ${
                item.path && item.path.trim().toLowerCase() !== 'null' ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{item.body}</p>
                <p className="mt-2 text-[11px] text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length !== 0 && (
        <div className="flex justify-end mt-4 px-5 pb-5">
          <Button onClick={() => navigate('/notifications')} className="ripple">
            See all notifications
          </Button>
        </div>
      )}
    </Card>
  );
}

function ActiveAsset({ asset }: { asset: DashboardResponse['activeAsset'] }) {
  if (!asset) {
    return (
      <Card className="card-shadow hover-lift flex flex-col h-full justify-between">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Active Asset</CardTitle>
            <Link to={'/asset-list'} className="text-primary text-sm hover:underline font-medium">
              View All Assets
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 flex-1">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">No active asset found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Active Asset</CardTitle>
          <Link to={'/asset-list'} className="text-primary text-sm hover:underline font-medium">
            View All Assets
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <div className="rounded-xl overflow-hidden mb-4 ring-1 ring-border/50">
            <img
              src={
                asset.image?.startsWith('http')
                  ? asset.image
                  : `${import.meta.env.VITE_API_BASE_URL}/storage/${asset.image}`
              }
              className="w-full h-48 object-cover"
              alt={asset.assetTitle}
            />
          </div>
          <div className="flex items-center mb-3 gap-2 text-muted-foreground">
            <MapPin width={16} />
            <span className="text-sm">{asset.location}</span>
          </div>
          <p className="text-lg font-semibold mb-4">{asset.assetTitle}</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-semibold">${asset.totalValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ROI</span>
              <span className="font-semibold text-emerald-400">{asset.roi}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{asset.progress}%</span>
            </div>
          </div>
          <div className="w-full rounded-full bg-muted/50 h-2 overflow-hidden ring-1 ring-border/30">
            <div
              className="rounded-full h-full gradient-primary shadow-lg shadow-primary/50"
              style={{ width: `${asset.progress}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const adminDetail = useCurrentAdmin();
  const { data, isLoading, isError } = useGetDashboardQuery();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}</h2>
        <p className="text-muted-foreground">
          {adminDetail?.firstname && `Welcome back, ${adminDetail.firstname}! `}
          Here's what's happening with your application today.
        </p>
      </div>

      {isLoading ? (
        <MetricsSkeleton />
      ) : isError || !data ? (
        <p className="text-sm text-red-400">Failed to load dashboard data</p>
      ) : (
        <>
          <Metrics stats={data.stats} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <PropertyDonutChart
              totalAssets={data.chartData.totalAssets}
              soldFractions={data.chartData.soldFractions}
              availableFractions={data.chartData.availableFractions}
            />
            <ActiveAsset asset={data.activeAsset} />
            <PendingRequest requests={data.pendingRequests} />
            <NotificationCard />
          </div>
        </>
      )}
    </div>
  );
}
