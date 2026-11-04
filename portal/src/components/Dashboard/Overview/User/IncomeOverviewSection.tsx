import { CiLocationOn } from 'react-icons/ci';
import { BsInfoCircle } from 'react-icons/bs';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import type { OverviewPortfolio } from '@/api/overview.api';

type IncomeOverviewSectionProps = {
  portfolio: OverviewPortfolio | null;
  isLoading?: boolean;
};

export default function IncomeOverviewSection({
  portfolio,
  isLoading,
}: IncomeOverviewSectionProps) {
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';

  const totalIncome = portfolio?.totalIncomeCollected ?? 0;
  const totalProperties = portfolio?.totalPropertiesInvested ?? 0;
  const breakdown = portfolio?.propertyBreakdown ?? [];
  const chartData = portfolio?.portfolioPerformance;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 text-[var(--fg)]">
      <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-5 space-y-4 sm:space-y-5 rounded-2xl bg-[var(--inner-card)] border border-[var(--fg)]/10 shadow-sm transition-all duration-300 h-auto">
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center justify-between gap-1.5 sm:gap-2">
          <p className="text-base sm:text-lg font-semibold text-[var(--fg)]">
            Total Income Collected
          </p>
          <p className="text-xs sm:text-sm text-[#757575] dark:text-gray-400 font-medium shrink-0">
            {isLoading
              ? '—'
              : `Total Property Invested: ${String(totalProperties).padStart(2, '0')}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-36 bg-[var(--fg)]/10 rounded animate-pulse" />
          ) : (
            <span className="text-2xl sm:text-3xl xl:text-4xl font-bold leading-none tracking-tight text-[var(--fg)]">
              ₹ {totalIncome.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <div className="h-px bg-[var(--fg)]/10 my-3" />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-[var(--fg)]/10 animate-pulse"
              />
            ))}
          </div>
        ) : breakdown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-[var(--fg)]/40">
            <BsInfoCircle size={24} />
            <p className="text-sm italic">No investments yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
            {breakdown.map((card) => (
              <div
                key={card.assetId}
                className="p-3.5 sm:p-4 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/10 hover:border-[var(--fg)]/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex flex-col gap-0.5">
                  <p
                    className="text-sm sm:text-base font-semibold text-[var(--fg)] truncate"
                    title={card.assetTitle}
                  >
                    {card.assetTitle}
                  </p>
                  <p className="text-xs text-[var(--fg)]/60 flex items-center gap-1 truncate">
                    <CiLocationOn className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="truncate">{card.location}</span>
                  </p>
                </div>
                <div className="h-px bg-[var(--fg)]/10 my-2.5" />
                <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row sm:items-baseline xl:items-start 2xl:items-baseline justify-between gap-1.5">
                  <div>
                    <p className="text-[11px] sm:text-xs text-[var(--fg)]/50 uppercase tracking-wider font-medium">
                      Income Collected
                    </p>
                    <p className="text-base sm:text-lg font-bold text-[var(--fg)] mt-0.5">
                      ₹ {card.incomeCollected.toLocaleString('en-IN')}
                    </p>
                  </div>
                  {card.yieldPercentage > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-green-500/15 text-green-500 dark:text-green-400 shrink-0 self-start">
                      +{card.yieldPercentage}%{' '}
                      <img
                        src="/images/dashboard/stats.svg"
                        alt="stats"
                        className="w-3 h-3"
                      />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-7 xl:col-span-8 space-y-5">
        <div className="bg-[var(--inner-card)] border border-[var(--fg)]/10 shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-5 lg:p-6 rounded-2xl">
          <div className="text-[var(--fg)] flex flex-col gap-1">
            <h4 className="text-base sm:text-lg font-semibold">
              Portfolio Performance
            </h4>
            {isLoading ? (
              <div className="h-9 w-36 bg-[var(--fg)]/10 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight mt-1">
                ₹{' '}
                {(portfolio?.totalPortfolioValue.amount ?? 0).toLocaleString(
                  'en-IN'
                )}
              </p>
            )}
          </div>
          <PortfolioPerformanceChart chartData={chartData} />
        </div>

        <div className="p-5 hidden rounded-2xl bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-28 font-medium flex flex-row items-center gap-2 whitespace-nowrap">
              Notices <BsInfoCircle size={24} />
            </h4>
            <button className="flex items-center gap-2 text-[var(--fg)] font-20 font-medium px-4 py-2 rounded-[16px] border border-[var(--fg)]">
              <img
                src="/images/dashboard/filter.svg"
                className={`w-4.5 shrink-0 ${isDark ? '' : 'invert'}`}
                alt=""
              />
              <span className="hidden md:block cursor-pointer text-[var(--fg)]">
                Filter
              </span>
            </button>
          </div>
          <div className="h-px bg-gray-500 my-3" />
          <div className="h-[140px] flex flex-col items-center justify-center text-[var(--fg)]/50 gap-2">
            <div className="w-12 h-12 rounded-full bg-[var(--fg)]/5 flex items-center justify-center">
              <BsInfoCircle size={20} className="text-[var(--fg)]/30" />
            </div>
            <p className="font-16 italic">No active notices at this time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
