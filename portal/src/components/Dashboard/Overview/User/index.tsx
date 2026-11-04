import { useState } from 'react';
import { GrRotateLeft } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OverviewCard from './OverviewCard';
import IncomeOverviewSection from './IncomeOverviewSection';
import StatCard from './StatCard';
import MarketplaceSnippet from './MarketplaceSnippet';
import GroupsSnippet from './GroupsSnippet';
import { useOverviewPortfolio, type OverviewPeriod } from '@/api/overview.api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function UserOverview() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<OverviewPeriod>('30d');
  const { data: portfolio, isLoading } = useOverviewPortfolio(period);

  return (
    <section className="w-full text-[var(--fg)] pt-36 xl:pt-40 pb-20 font-work bg-[var(--bg)] min-h-screen transition-all duration-300">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <div className="px-4 md:px-10 w-full">
          <div className="max-w-[1600px] mx-auto space-y-4 w-full">
            <motion.div
              variants={itemVariants}
              className="flex items-start justify-between gap-2 flex-col sm:flex-row w-full"
            >
              <div className="flex flex-col w-full">
                <div className="flex items-start justify-between py-3 md:py-0">
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--fg)]">
                    Overview
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(0)}
                    className="flex md:hidden font-16 p-2 rounded-md bg-gradient-to-b from-[#4F86C0] to-[#2A5A8D] gap-1 justify-center items-center whitespace-nowrap cursor-pointer text-white"
                  >
                    <GrRotateLeft size={18} /> Refresh
                  </motion.button>
                </div>
                <p className="font-16 text-center sm:text-left">
                  A consolidated view of your investments, performance, and recent financial activity.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6"
            >
              <StatCard
                title="Total Portfolio Value"
                value={portfolio?.totalPortfolioValue.amount ?? 0}
                changePercent={portfolio?.totalPortfolioValue.changePercent}
                trend={portfolio?.totalPortfolioValue.trend}
                isLoading={isLoading}
              />
              <OverviewCard
                title="Asset Appreciation"
                value={portfolio?.assetAppreciation.amount ?? 0}
                changePercent={portfolio?.assetAppreciation.percentage}
                trend={portfolio?.assetAppreciation.trend}
                isLoading={isLoading}
                period={period}
                onPeriodChange={setPeriod}
              />
              <OverviewCard
                title="Realized Profit/Loss"
                value={portfolio?.realizedProfitLoss.amount ?? 0}
                trend={portfolio?.realizedProfitLoss.type === 'PROFIT' ? 'UP' : 'DOWN'}
                label={portfolio?.realizedProfitLoss.label}
                isLoading={isLoading}
                period={period}
                onPeriodChange={setPeriod}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-6"
            >
              <MarketplaceSnippet />
              <GroupsSnippet />
            </motion.div>

            <motion.div variants={itemVariants}>
              <IncomeOverviewSection portfolio={portfolio ?? null} isLoading={isLoading} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
