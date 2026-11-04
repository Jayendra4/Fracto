/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { FiUsers, FiFileText } from 'react-icons/fi';
import RecentActivity from './RecentActivity';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import {
  useBrokerDashboard,
  useBrokerLocksCommission,
} from '@/api/brokerDashboard.api';
import { useState, useEffect } from 'react';
import OverviewCard from '../User/OverviewCard';
import IncomeOverviewSection from '../User/IncomeOverviewSection';
import MarketplaceSnippet from '../User/MarketplaceSnippet';
import GroupsSnippet from '../User/GroupsSnippet';
import PortfolioStatCard from '../User/StatCard';
import { motion } from 'framer-motion';
import StatCardSkeleton from '@/components/Skeleton/StatCardSkeleton';
import { useOverviewPortfolio, type OverviewPeriod } from '@/api/overview.api';

type ViewMode = 'broker' | 'purchased';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function formatIN(n: number): string {
  const s = Math.floor(n).toString();
  if (s.length <= 3) return s;
  const parts: string[] = [];
  let rest = s;
  parts.unshift(rest.slice(-3));
  rest = rest.slice(0, -3);
  while (rest.length > 0) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  return parts.join(',');
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const timer = setInterval(() => {
      start += Math.ceil((end - start) / 10);
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplayValue(start);
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return <>{formatIN(displayValue)}</>;
};

export default function BrokerOverview() {
  const [view, setView] = useState<ViewMode>('broker');
  const [period, setPeriod] = useState<OverviewPeriod>('30d');

  const user = useSelector((state: RootState) => state.authLogin.user);
  const { data: dashboardRes, isLoading: isDashboardLoading } =
    useBrokerDashboard();
  const { data: locksRes, isLoading: isLocksLoading } =
    useBrokerLocksCommission();
  const { data: portfolio, isLoading: isPortfolioLoading } =
    useOverviewPortfolio(period);

  const dashboard = dashboardRes?.success ? dashboardRes.data : null;
  const locks = locksRes?.success ? locksRes.data : null;

  // const totalLeads = dashboard?.stats.totalLeads ?? 0;
  const activeLeads = dashboard?.stats.activeLeads ?? 0;
  const totalLeads = dashboard?.stats.totalLeads ?? 0;
  const assetsInProgress = dashboard?.stats.assetsInProgress ?? 0;

  const totalCommission = Number(dashboard?.earnings.totalCommission ?? 0);
  const last7Days = dashboard?.earnings.last7Days ?? 0;
  const lockedCommission =
    locks?.totalLockedAmount ?? dashboard?.earnings.lockedCommission ?? 0;

  const isLoading = isDashboardLoading || isLocksLoading;

  return (
    <section className="w-full text-[var(--fg)] pt-36 xl:pt-40 pb-20 font-work bg-[var(--bg)] min-h-screen transition-all duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="px-4 md:px-10 w-full">
          <div className="max-w-[1600px] mx-auto space-y-6 w-full">
            <div className="flex flex-col md:flex-row  items-center justify-between gap-4 pt-4">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--fg)]">
                Overview
              </h1>
              <div className="flex justify-start bg-[var(--inner-card)] rounded-full p-1 border border-dark-grey/20 shadow-sm w-full md:w-auto">
                <button
                  onClick={() => setView('broker')}
                  className={`flex-1 md:flex-none px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${view === 'broker' ? 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md text-white' : 'text-[var(--fg)] hover:bg-[var(--card)]'}`}
                >
                  Channel Partner view
                </button>
                <button
                  onClick={() => setView('purchased')}
                  className={`flex-1 md:flex-none px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${view === 'purchased' ? 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md text-white' : 'text-[var(--fg)] hover:bg-[var(--card)]'}`}
                >
                  Investor view
                </button>
              </div>
            </div>

            {view === 'broker' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                key="broker-view"
              >
                <div className="space-y-6">
                  {isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                      </div>
                      <StatCardSkeleton />
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                      >
                        <StatCard
                          icon={<FiUsers size={20} />}
                          title="Total Leads"
                          value={<AnimatedNumber value={totalLeads} />}
                          // badge={`${totalLeads - activeLeads} pending`}
                          badgeColor="bg-blue-500/10 text-blue-500"
                          isCurrency={false}
                        />
                        <StatCard
                          icon={<FiUsers size={20} />}
                          title="Active Leads"
                          value={<AnimatedNumber value={activeLeads} />}
                          // badge={`${totalLeads - activeLeads} pending`}
                          badgeColor="bg-blue-500/10 text-blue-500"
                          isCurrency={false}
                        />

                        <StatCard
                          icon={<FiFileText size={20} />}
                          title="Assets In Progress"
                          value={<AnimatedNumber value={assetsInProgress} />}
                          // badge={`${assetsInProgress} need attention`}
                          badgeColor="bg-yellow-500/10 text-yellow-500"
                          isCurrency={false}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <RecentActivity accountId={user?.id || 0} />
                      </motion.div>
                    </div>

                    <motion.div variants={itemVariants} className="space-y-6">
                      <EarningsCard
                        total={totalCommission}
                        last7Days={last7Days}
                        locked={lockedCommission || 0}
                        locks={locks}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <MarketplaceSnippet />
                    <GroupsSnippet />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {view === 'purchased' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                key="purchased-view"
              >
                <div className="space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <PortfolioStatCard
                      title="Total Portfolio Value"
                      value={portfolio?.totalPortfolioValue.amount ?? 0}
                      changePercent={
                        portfolio?.totalPortfolioValue.changePercent
                      }
                      trend={portfolio?.totalPortfolioValue.trend}
                      isLoading={isPortfolioLoading}
                    />
                    <OverviewCard
                      title="Asset Appreciation"
                      value={portfolio?.assetAppreciation.amount ?? 0}
                      changePercent={portfolio?.assetAppreciation.percentage}
                      trend={portfolio?.assetAppreciation.trend}
                      isLoading={isPortfolioLoading}
                      period={period}
                      onPeriodChange={setPeriod}
                    />
                    <OverviewCard
                      title="Realized Profit/Loss"
                      value={portfolio?.realizedProfitLoss.amount ?? 0}
                      trend={
                        portfolio?.realizedProfitLoss.type === 'PROFIT'
                          ? 'UP'
                          : 'DOWN'
                      }
                      label={portfolio?.realizedProfitLoss.label}
                      isLoading={isPortfolioLoading}
                      period={period}
                      onPeriodChange={setPeriod}
                    />
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <MarketplaceSnippet />
                    <GroupsSnippet />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <IncomeOverviewSection
                      portfolio={portfolio ?? null}
                      isLoading={isPortfolioLoading}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function StatCard({ title, value, badge, badgeColor, isCurrency = true }: any) {
  return (
    <div className="bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden transition-all duration-300 font-work">
      <div className="flex items-start justify-between mb-4">
        {badge && (
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="text-center md:text-left">
        <p className="font-18  text-[var(--fg)] mb-2">{title}</p>
        <p className="from-neutral font-30 font-semibold text-[var(--fg)] ">
          {isCurrency && '₹'}
          {value}
        </p>
      </div>
    </div>
  );
}

function EarningsCard({
  total,
  last7Days,
  locked,
  locks,
}: {
  total: number;
  last7Days: number;
  locked: number;
  locks: any;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] border border-dark-grey/20 shadow-sm p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-base font-semibold text-[var(--fg)]/40 uppercase tracking-widest mb-2">
              Accumulated Revenue
            </p>
            <p className="text-5xl font-bold text-[var(--fg)] tracking-tight">
              ₹<AnimatedNumber value={total} />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-500/[0.02] border border-blue-500/5 rounded-2xl p-4">
              <p className="text-lg font-bold text-blue-500">
                ₹<AnimatedNumber value={last7Days} />
              </p>
              <p className="text-[9px] font-semibold text-blue-500/40 uppercase tracking-widest">
                Last 168 Hours
              </p>
            </div>

            <div className="bg-red-500/[0.02] border border-red-500/5 rounded-2xl p-4">
              <p className="text-lg font-bold text-red-500">
                ₹<AnimatedNumber value={locked} />
              </p>
              <p className="text-[9px] font-semibold text-red-500/40 uppercase tracking-widest">
                Currently Locked
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex mdL items-center justify-between px-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--fg)]/40">
            Commission Locks
          </h3>
          <div className="h-px flex-1 bg-[var(--fg)]/5 ml-4"></div>
        </div>

        {locks?.properties && locks.properties.length > 0 ? (
          locks.properties.map((item: any, idx: number) => (
            <LockedItem
              key={idx}
              amount={`₹${item.lockedAmount?.toLocaleString() || '0'}`}
              propertyName={
                item.assetName || item.propertyName || 'Property Asset'
              }
              reasons={item.reasons || []}
            />
          ))
        ) : (
          <div className="bg-[var(--inner-card)] rounded-xl p-8 text-center border-dashed border border-dark-grey/20">
            <p className="text-sm font-medium text-[var(--fg)]/40 italic">
              No commissions are currently locked
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LockedItem({ amount, propertyName, reason, reasons }: any) {
  // Handle both single reason (legacy) and reasons array (new API)
  const displayReasons = reasons || (reason ? [reason] : []);

  return (
    <div className="bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-5 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-2">
        <p className="font-bold text-lg text-[var(--fg)] tracking-tight">
          {amount}
        </p>
        <div className="w-6 h-6 rounded-full bg-red-500/5 text-red-500/40 flex items-center justify-center text-[10px]">
          !
        </div>
      </div>
      <p className="text-14 font-semibold text-[var(--fg)]/60 mb-2 truncate">
        {propertyName}
      </p>

      <div className="space-y-1.5">
        {displayReasons.length > 0 ? (
          displayReasons.map((r: string, i: number) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2 py-1 bg-red-500/[0.02] rounded-lg border border-red-500/5 w-fit"
            >
              <div className="w-1 h-1 rounded-full bg-red-500/40"></div>
              <p className="text-[11px] font-bold uppercase text-red-500/40 tracking-[0%]">
                {r}
              </p>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/[0.02] rounded-lg border border-red-500/5 w-fit">
            <div className="w-1 h-1 rounded-full bg-red-500/40"></div>
            <p className="text-[11px] font-bold uppercase text-red-500/40 tracking-[0%]">
              Verification Pending
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
