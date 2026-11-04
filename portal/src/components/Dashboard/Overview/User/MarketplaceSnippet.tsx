import { useNavigate } from 'react-router-dom';
import { FaFire } from 'react-icons/fa';
import { FiArrowUpRight, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { MdOutlineShowChart } from 'react-icons/md';
import { useDashboardOverview } from '@/api/group.api';

export default function MarketplaceSnippet() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardOverview();

  const topAsset = data?.trendingAssets?.[0];

  return (
    <div
      onClick={() => navigate('/dashboard/marketplace')}
      className="p-4 lg:py-5 lg:px-6 flex flex-col gap-4 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-2xl transition-all duration-300 text-[var(--fg)] cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-18">Marketplace</p>
        <FiArrowUpRight className="text-[var(--fg)]/40 text-lg" />
      </div>

      {/* Primary stat */}
      <div className="flex items-end justify-between">
        <div>
          {isLoading ? (
            <div className="h-9 w-16 bg-[var(--fg)]/10 rounded animate-pulse" />
          ) : (
            <span className="font-30 xl:font-new-40 font-medium leading-[100%]">
              {data?.activeListings ?? 0}
            </span>
          )}
          <p className="text-sm text-[var(--fg)]/50 mt-1">Active Listings</p>
        </div>
        <div className="text-right">
          {isLoading ? (
            <div className="h-6 w-24 bg-[var(--fg)]/10 rounded animate-pulse" />
          ) : (
            <p className="text-lg font-semibold text-[var(--fg)]">
              ₹{((data?.totalMarketValue ?? 0) / 100000).toFixed(1)}L
            </p>
          )}
          <p className="text-xs text-[var(--fg)]/40">Total Market Value</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/5">
          <FiTrendingUp className="text-[#60A5FA] text-base mb-1" />
          <span className="font-semibold text-sm text-[var(--fg)]">
            {isLoading ? '—' : (data?.stats?.activeBids ?? 0)}
          </span>
          <p className="text-[10px] text-[var(--fg)]/40 text-center leading-tight mt-0.5">
            Active Bids
          </p>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/5">
          <FiTrendingDown className="text-orange-400 text-base mb-1" />
          <span className="font-semibold text-sm text-[var(--fg)]">
            {isLoading ? '—' : (data?.stats?.askRequests ?? 0)}
          </span>
          <p className="text-[10px] text-[var(--fg)]/40 text-center leading-tight mt-0.5">
            Active Ask
          </p>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/5">
          <MdOutlineShowChart className="text-green-400 text-base mb-1" />
          <span className="font-semibold text-sm text-[var(--fg)]">
            {isLoading ? '—' : (data?.stats?.myListings ?? 0)}
          </span>
          <p className="text-[10px] text-[var(--fg)]/40 text-center leading-tight mt-0.5">
            My Listings
          </p>
        </div>
      </div>

      {/* Weekly volume */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg)]/50 border border-[var(--fg)]/5">
        <p className="text-xs text-[var(--fg)]/50">Weekly Trade Volume</p>
        <p className="text-sm font-semibold text-[var(--fg)]">
          {isLoading
            ? '—'
            : `₹${((data?.weeklyTradeVolume ?? 0) / 100000).toFixed(2)}L`}
        </p>
      </div>

      {/* Trending asset */}
      {topAsset && (
        <div className="hidden items-center justify-between pt-1 border-t border-[var(--fg)]/8">
          <div className="flex items-center gap-1.5 text-xs text-[var(--fg)]/50 truncate">
            <FaFire className="text-orange-400 shrink-0" />
            <span className="truncate">{topAsset.assetTitle}</span>
          </div>
          <span
            className={`text-xs font-semibold shrink-0 ml-2 ${topAsset.trend === 'UP' ? 'text-green-400' : 'text-red-400'}`}
          >
            {topAsset.trend === 'UP' ? '+' : '-'}
            {topAsset.priceChange24h.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
