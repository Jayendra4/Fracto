import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Building2,
  Briefcase,
  UserCheck,
  ShieldCheck,
  PiggyBank,
  Loader2,
  ShoppingBag,
  BadgePercent,
  LayoutGrid,
  IndianRupee,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentAdmin } from '@/hooks/redux';
import { useNavigate } from 'react-router-dom';
import { Notification, useGetAllNotificationsQuery, useUpdateReadStatusMutation } from '@/store/api/notificationApi';
import {
  RevenuePeriod,
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
} from '@/store/api/dashboardApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupees(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)}Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

function formatChange(pct: number, trend: 'UP' | 'DOWN') {
  const abs = Math.abs(pct);
  return { label: `${abs}%`, isUp: trend === 'UP' };
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string;
  changeLabel: string;
  isUp: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  loading?: boolean;
}

function MetricCard({
  title,
  value,
  changeLabel,
  isUp,
  icon: Icon,
  iconColor,
  loading,
}: MetricCardProps) {
  return (
    <Card className="bg-slate-900/50 hover:bg-slate-800/50 transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
          {title}
        </CardTitle>
        <div
          className={`p-2 rounded-lg ${iconColor} bg-opacity-10 transition-transform group-hover:scale-110`}
        >
          <Icon className={`h-4 w-4 ${iconColor.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 h-10">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="flex items-center text-xs">
              {isUp ? (
                <div className="flex items-center text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mr-2">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  {changeLabel}
                </div>
              ) : (
                <div className="flex items-center text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded mr-2">
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                  {changeLabel}
                </div>
              )}
              <span className="text-slate-500">vs last month</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────

const SVG_W = 560;
const SVG_H = 230;
const PAD = { top: 20, right: 24, bottom: 44, left: 62 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;
const Y_TICKS = 5;

function RevenueChart() {
  const [period, setPeriod] = useState<RevenuePeriod>('monthly');
  const [hovered, setHovered] = useState<number | null>(null);

  const { data, isLoading } = useGetRevenueChartQuery(period);
  const chartData = data?.data ?? [];

  const maxValue = Math.max(...chartData.map((d) => d.revenue), 1);

  const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => {
    const value = (maxValue / Y_TICKS) * (Y_TICKS - i);
    const y = PAD.top + (i / Y_TICKS) * PLOT_H;
    return { value, y };
  });

  const toX = (i: number) =>
    chartData.length < 2 ? PAD.left + PLOT_W / 2 : PAD.left + (i / (chartData.length - 1)) * PLOT_W;

  const toY = (revenue: number) => PAD.top + PLOT_H - (revenue / maxValue) * PLOT_H;

  const points = chartData.map((d, i) => ({ x: toX(i), y: toY(d.revenue), ...d }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `M ${points[0]!.x} ${PAD.top + PLOT_H} ` +
        points.map((p) => `L ${p.x} ${p.y}`).join(' ') +
        ` L ${points[points.length - 1]!.x} ${PAD.top + PLOT_H} Z`
      : '';

  // show every nth x-label so they don't overlap
  const xStep = Math.ceil(chartData.length / 8);

  const labelMap: Record<RevenuePeriod, string> = {
    daily: 'Daily Trend',
    weekly: 'Weekly Trend',
    monthly: 'Monthly Trend',
    yearly: 'Yearly Trend',
  };

  return (
    <Card className="bg-slate-900/50 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-white">Revenue Overview</CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Marketplace revenue performance
            </CardDescription>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as RevenuePeriod)}>
            <TabsList className="bg-slate-800 border border-slate-700/60 p-0.5 rounded-lg gap-0.5 h-8">
              {(['daily', 'weekly', 'monthly', 'yearly'] as RevenuePeriod[]).map((p) => (
                <TabsTrigger
                  key={p}
                  value={p}
                  className="capitalize text-slate-400 px-3 py-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none rounded-md h-full"
                >
                  {p}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-2 pb-3">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-axis label */}
              <text
                x={12}
                y={PAD.top + PLOT_H / 2}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
                transform={`rotate(-90, 12, ${PAD.top + PLOT_H / 2})`}
              >
                Value
              </text>

              {/* Horizontal grid lines + Y-axis ticks */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={PAD.left}
                    y1={tick.y}
                    x2={PAD.left + PLOT_W}
                    y2={tick.y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray={i === Y_TICKS ? '0' : '4 3'}
                  />
                  <text
                    x={PAD.left - 8}
                    y={tick.y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#64748b"
                  >
                    {formatRupees(tick.value)}
                  </text>
                </g>
              ))}

              {/* X-axis baseline */}
              <line
                x1={PAD.left}
                y1={PAD.top + PLOT_H}
                x2={PAD.left + PLOT_W}
                y2={PAD.top + PLOT_H}
                stroke="#334155"
                strokeWidth="1"
              />

              {/* X-axis labels */}
              {points.map((p, i) =>
                i % xStep === 0 || i === points.length - 1 ? (
                  <text
                    key={i}
                    x={p.x}
                    y={PAD.top + PLOT_H + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748b"
                  >
                    {p.label}
                  </text>
                ) : null
              )}

              {/* Area fill */}
              {areaPath && <path d={areaPath} fill="url(#revenueGradient)" />}

              {/* Line */}
              {points.length > 1 && (
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {/* Vertical hover line */}
              {hovered !== null && points[hovered] && (
                <line
                  x1={points[hovered].x}
                  y1={PAD.top}
                  x2={points[hovered].x}
                  y2={PAD.top + PLOT_H}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.5"
                />
              )}

              {/* Dots */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hovered === i ? 5.5 : 3.5}
                  fill={hovered === i ? '#60a5fa' : '#3b82f6'}
                  stroke="#0f172a"
                  strokeWidth="2"
                  style={{ cursor: 'default', transition: 'r 0.15s' }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}

              {/* Tooltip */}
              {hovered !== null &&
                points[hovered] &&
                (() => {
                  const p = points[hovered]!;
                  const tipW = 100;
                  const tipH = 38;
                  const tipX = Math.min(
                    Math.max(p.x - tipW / 2, PAD.left),
                    PAD.left + PLOT_W - tipW
                  );
                  const tipY = p.y - tipH - 10;
                  return (
                    <g>
                      <rect
                        x={tipX}
                        y={tipY}
                        width={tipW}
                        height={tipH}
                        rx="6"
                        fill="#1e293b"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      <text
                        x={tipX + tipW / 2}
                        y={tipY + 14}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#94a3b8"
                      >
                        {p.label}
                      </text>
                      <text
                        x={tipX + tipW / 2}
                        y={tipY + 29}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#60a5fa"
                        fontWeight="600"
                      >
                        {formatRupees(p.revenue)}
                      </text>
                    </g>
                  );
                })()}
            </svg>

            {/* Legend */}
            <div className="flex justify-center mt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-5 h-px bg-blue-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-slate-900" />
                <div className="w-5 h-px bg-blue-500" />
                <span className="ml-1">{labelMap[period]}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── User Type Section ────────────────────────────────────────────────────────

const USER_TYPE_CONFIG = [
  {
    key: 'investor' as const,
    label: 'Investor',
    route: '/users/CorporateInvestor',
    icon: TrendingUp,
    textColor: 'text-blue-400',
    barColor: 'bg-blue-500',
  },
  {
    key: 'assetOwner' as const,
    label: 'Asset Owner',
    route: '/users/AssetOwner',
    icon: Building2,
    textColor: 'text-emerald-400',
    barColor: 'bg-emerald-500',
  },
  {
    key: 'company' as const,
    label: 'Company',
    route: '/users/Company',
    icon: Briefcase,
    textColor: 'text-violet-400',
    barColor: 'bg-violet-500',
  },
  {
    key: 'broker' as const,
    label: 'Partner',
    route: '/users/Broker',
    icon: UserCheck,
    textColor: 'text-amber-400',
    barColor: 'bg-amber-500',
  },
  {
    key: 'trustee' as const,
    label: 'Trustee',
    route: '/trustee-kyc-request',
    icon: ShieldCheck,
    textColor: 'text-rose-400',
    barColor: 'bg-rose-500',
  },
];

function UserTypeSection({
  usersByType,
  loading,
}: {
  usersByType?: Record<string, number>;
  loading?: boolean;
}) {
  const navigate = useNavigate();
  const total = usersByType
    ? USER_TYPE_CONFIG.reduce((s, t) => s + (usersByType[t.key] ?? 0), 0)
    : 0;

  return (
    <Card className="bg-slate-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-white">User Types</CardTitle>
        </div>
        <CardDescription className="text-slate-400">
          Distribution across {total.toLocaleString()} registered users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : (
          USER_TYPE_CONFIG.map((type) => {
            const count = usersByType?.[type.key] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={type.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <type.icon className={`h-4 w-4 ${type.textColor}`} />
                    {type.route ? (
                      <button
                        onClick={() => navigate(type.route!)}
                        className="text-sm text-slate-300 hover:text-white hover:underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        {type.label}
                      </button>
                    ) : (
                      <span className="text-sm text-slate-300">{type.label}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${type.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ─── Deposit & Withdrawal Section ─────────────────────────────────────────────

function DepositWithdrawalSection({
  pendingRequests,
  loading,
}: {
  pendingRequests?: { deposit: number; withdrawal: number };
  loading?: boolean;
}) {
  const items = [
    {
      label: 'Deposits',
      count: pendingRequests?.deposit ?? 0,
      icon: PiggyBank,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Withdrawals',
      count: pendingRequests?.withdrawal ?? 0,
      icon: ArrowDownRight,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
  ];

  return (
    <Card className="bg-slate-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {/* <DollarSign className="h-5 w-5 text-indigo-400" /> */}
          <CardTitle className="text-white">Deposit & Withdrawal</CardTitle>
        </div>
        <CardDescription className="text-slate-400">Pending request counts</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className={`flex flex-col gap-3 p-5 rounded-xl border ${item.border} ${item.bg}`}
              >
                <item.icon className={`h-6 w-6 ${item.color}`} />
                <div className="text-3xl font-bold text-white">{item.count}</div>
                <div className="text-xs text-slate-400 leading-tight">{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard() {
  const navigate = useNavigate();
  const [updateReadStatus] = useUpdateReadStatusMutation();
  const { data, isLoading, isError } = useGetAllNotificationsQuery({ skip: 0, take: 5 });
  const notifications: Notification[] = data?.data ?? [];

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 h-full flex items-center justify-center p-6 text-sm text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-slate-900/50 h-full flex items-center justify-center p-6 text-sm text-red-500">
        Failed to load notifications
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 h-full flex flex-col">
      <CardHeader className="border-b border-slate-800/50 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-lg font-semibold text-white">Notifications</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            {notifications.length} New
          </Badge>
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto space-y-3 p-4 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Bell className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          notifications.map((item) => {
            const hasPath = item.path && item.path.trim().toLowerCase() !== 'null';
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (hasPath) {
                    if (!item.viewed) {
                      updateReadStatus({ id: item.id });
                    }
                    navigate(item.path!);
                  }
                }}
                className={`group flex gap-3 p-3 rounded-xl bg-[#0b1437]/50 border border-slate-800/50 hover:bg-[#1f2e64]/30 hover:border-slate-700 transition-all duration-200 ${
                  hasPath ? 'cursor-pointer' : ''
                }`}
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.body}</p>
                  <p className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      {notifications.length !== 0 && (
        <div className="p-4 pt-0 mt-auto border-t border-slate-800/50">
          <Button
            variant="ghost"
            aria-label="View all notifications"
            className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 mt-4 h-9 text-sm"
            onClick={() => navigate('/notifications')}
          >
            View All Notifications
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { t } = useTranslation();
  const adminDetail = useCurrentAdmin();

  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();

  const totalChange = formatChange(
    stats?.totalUsers.changePercent ?? 0,
    stats?.totalUsers.trend ?? 'UP'
  );
  const activeChange = formatChange(
    stats?.activeUsers.changePercent ?? 0,
    stats?.activeUsers.trend ?? 'UP'
  );
  const revenueChange = formatChange(
    stats?.revenue.changePercent ?? 0,
    stats?.revenue.trend ?? 'UP'
  );
  const growthChange = formatChange(stats?.growth.changePercent ?? 0, stats?.growth.trend ?? 'UP');

  const metrics = [
    {
      title: t('dashboard.totalUsers'),
      value: stats ? stats.totalUsers.count.toLocaleString() : '—',
      changeLabel: totalChange.label,
      isUp: totalChange.isUp,
      icon: Users,
      iconColor: 'bg-blue-500',
    },
    {
      title: t('dashboard.activeUsers'),
      value: stats ? stats.activeUsers.count.toLocaleString() : '—',
      changeLabel: activeChange.label,
      isUp: activeChange.isUp,
      icon: Activity,
      iconColor: 'bg-green-500',
    },
    {
      title: t('dashboard.revenue'),
      value: stats ? formatRupees(stats.revenue.amount) : '—',
      changeLabel: revenueChange.label,
      isUp: revenueChange.isUp,
      icon: IndianRupee,
      iconColor: 'bg-indigo-500',
    },
    {
      title: t('dashboard.growth'),
      value: stats ? `+${stats.growth.newUsersThisMonth}` : '—',
      changeLabel: growthChange.label,
      isUp: growthChange.isUp,
      icon: TrendingUp,
      iconColor: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{t('dashboard.welcome')}</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} loading={statsLoading} {...metric} />
        ))}
      </div>

      {/* Immediate Sale Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/50 hover:bg-slate-800/50 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
              Immediate Sale Transactions
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-500 bg-opacity-10 transition-transform group-hover:scale-110">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center h-10">
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="text-2xl font-bold text-white">
                {stats?.immediateSaleTransactions?.count?.toLocaleString() ?? '—'}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Total completed transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 hover:bg-slate-800/50 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
              Immediate Sale Commission
            </CardTitle>
            <div className="p-2 rounded-lg bg-teal-500 bg-opacity-10 transition-transform group-hover:scale-110">
              <BadgePercent className="h-4 w-4 text-teal-500" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center h-10">
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="text-2xl font-bold text-white">
                {stats?.immediateSaleCommission != null
                  ? formatRupees(stats.immediateSaleCommission.amount)
                  : '—'}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Total commission earned</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 hover:bg-slate-800/50 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
              Marketplace Assets
            </CardTitle>
            <div className="p-2 rounded-lg bg-cyan-500 bg-opacity-10 transition-transform group-hover:scale-110">
              <LayoutGrid className="h-4 w-4 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center h-10">
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="text-2xl font-bold text-white">
                {stats?.marketplaceAssets?.count?.toLocaleString() ?? '—'}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Total listed assets</p>
          </CardContent>
        </Card>
      </div>

      {/* User Types + Deposit & Withdrawal */}
      <div className="grid gap-6 lg:grid-cols-7 items-start">
        <div className="lg:col-span-4">
          <UserTypeSection usersByType={stats?.usersByType} loading={statsLoading} />
        </div>
        <div className="lg:col-span-3">
          <DepositWithdrawalSection
            pendingRequests={stats?.pendingRequests}
            loading={statsLoading}
          />
        </div>
      </div>

      {/* Revenue Chart + Notifications */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart />
        </div>
        <div className="lg:col-span-3">
          <NotificationCard />
        </div>
      </div>
    </div>
  );
}
