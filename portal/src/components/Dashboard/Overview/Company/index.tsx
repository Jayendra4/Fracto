import OverviewStatsCard from './StatsCards';
import AssetStatusCard from './AssetStatusCard';
import ProcessTimeline from './ProcessTimeline';
import { useState } from 'react';
import OverviewCard from '../User/OverviewCard';
import IncomeOverviewSection from '../User/IncomeOverviewSection';
import StatCard from '../User/StatCard';
import MarketplaceSnippet from '../User/MarketplaceSnippet';
import GroupsSnippet from '../User/GroupsSnippet';
import { motion } from 'framer-motion';
import {
  useOverviewPortfolio,
  useOverviewBusiness,
  type OverviewPeriod,
} from '@/api/overview.api';

type ViewMode = 'onboarded' | 'purchased';

function formatValue(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

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

export default function CompanyOverview() {
  const [view, setView] = useState<ViewMode>('onboarded');
  const [period, setPeriod] = useState<OverviewPeriod>('30d');
  const { data: portfolio, isLoading: isPortfolioLoading } =
    useOverviewPortfolio(period);
  const { data: business } = useOverviewBusiness();

  const stats = business?.stats;
  const latest = business?.latestAsset;

  const timelineItems = (latest?.processTimeline ?? []).map((t) => {
    const formattedDate = t.date
      ? new Date(t.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'TBD';
    return {
      title: t.stage,
      subtitle: t.isEstimated ? `Est. ${formattedDate}` : formattedDate,
      status: (t.status === 'in_progress' ? 'active' : t.status) as
        | 'completed'
        | 'active'
        | 'pending',
    };
  });

  return (
    <section className="w-full text-[var(--fg)] font-work pt-36 xl:pt-40 pb-20 bg-[var(--bg)] min-h-screen transition-all duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="px-4 md:px-10">
          <motion.div
            variants={itemVariants}
            className="flex gap-4 py-4 max-w-[1600px] mx-auto"
          >
            <div className="flex md:flex-row flex-col items-center justify-between w-full gap-4">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--fg)]">
                Overview
              </h1>
              <div className="flex justify-start bg-[var(--inner-card)] border border-dark-grey/20 rounded-full p-1 shadow-sm w-full md:w-auto">
                <button
                  onClick={() => setView('onboarded')}
                  className={`flex-1 md:flex-none px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${view === 'onboarded' ? 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md text-white' : 'text-[var(--fg)] hover:bg-[var(--card)]'}`}
                >
                  Business view
                </button>
                <button
                  onClick={() => setView('purchased')}
                  className={`flex-1 md:flex-none px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${view === 'purchased' ? 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md text-white' : 'text-[var(--fg)] hover:bg-[var(--card)]'}`}
                >
                  Investor view
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        {view === 'onboarded' && (
          <motion.div
            key="onboarded"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="px-4 lg:px-10">
              <div className="max-w-[1600px] mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-10">
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col sm:flex-row gap-6"
                    >
                      <OverviewStatsCard
                        title="Total Assets"
                        total={stats?.totalAssets ?? '—'}
                        leftText={`${stats?.openForInvestment ?? 0} Open For Investment`}
                        rightText={`${stats?.fullyLiquidated ?? 0} Fully Liquidated`}
                        backgroundClass="bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm"
                      />
                      <OverviewStatsCard
                        title="Total Value"
                        total={stats ? formatValue(stats.totalValue) : '—'}
                        leftText={`₹${formatValue(stats?.openForInvestmentValue ?? 0)} Open`}
                        rightText={`₹${formatValue(stats?.fullyLiquidatedValue ?? 0)} Liquidated`}
                        backgroundClass="bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm"
                      />
                    </motion.div>

                    {latest && (
                      <motion.div variants={itemVariants}>
                        <AssetStatusCard
                          assetName={latest.assetTitle}
                          statusText={latest.liquidationStatus}
                          progressPercent={latest.liquidationPercent}
                          investedAmount={`₹${formatValue(latest.soldValue)}`}
                          totalAmount={`₹${formatValue(latest.totalValue)}`}
                          stats={[
                            {
                              label: 'Total Structural Co-ownership',
                              value: latest.totalFractions,
                            },
                            {
                              label: 'Total Investor KY',
                              value: latest.totalInvestors,
                            },
                            {
                              label: 'Sold Structural Co-ownership',
                              value: latest.soldFractions,
                            },
                          ]}
                        />
                      </motion.div>
                    )}
                  </div>

                  <motion.div variants={itemVariants}>
                    <ProcessTimeline
                      heading="Process Timeline"
                      subheading={
                        latest
                          ? `${latest.assetTitle} — Liquidation Workflow`
                          : 'Asset Liquidation Workflow Stages'
                      }
                      items={
                        timelineItems.length > 0
                          ? timelineItems
                          : [
                              {
                                title: 'Asset Owner Clearance (Legal)',
                                status: 'pending',
                              },
                              { title: 'Valuation', status: 'pending' },
                              { title: 'Company Approval', status: 'pending' },
                              { title: 'Liquidation Start', status: 'pending' },
                            ]
                      }
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {view === 'purchased' && (
          <motion.div
            key="purchased"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="px-4 lg:px-10">
              <div className="max-w-[1600px] mx-auto space-y-6">
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <StatCard
                    title="Total Portfolio Value"
                    value={portfolio?.totalPortfolioValue.amount ?? 0}
                    changePercent={portfolio?.totalPortfolioValue.changePercent}
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
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
