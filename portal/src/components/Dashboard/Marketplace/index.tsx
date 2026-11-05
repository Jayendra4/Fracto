import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CiLocationOn, CiSearch } from 'react-icons/ci';
import {
  FaChartLine,
  FaAngleLeft,
  FaAngleRight,
  FaBuilding,
  FaFire,
} from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';
import { useMarketplaceAssets, type MarketplaceAsset } from '@/api/group.api';
import Loader from '@/components/Loader';

const PAGE_SIZE = 30;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function getMeta(meta: MarketplaceAsset['meta'], key: string) {
  return meta?.find((m) => m.metaKey === key)?.metaValue || '';
}

function StatusBadge({ status }: { status: string }) {
  const s = status;
  const styles =
    s === 'Approved'
      ? 'bg-green/10 text-green border-green/20'
      : s === 'Pending'
        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        : 'bg-red-500/10 text-red-400 border-red-500/20';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles}`}
    >
      {status}
    </span>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="p-5 rounded-2xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 mb-4">
        <FiPackage size={36} className="text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-1">
        No assets found
      </h3>
      {search && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No results for "{search}"
        </p>
      )}
    </div>
  );
}

function priceHistoryToPoints(history: { price: number }[]): string {
  if (!history || history.length < 2) return '0,27 108,27';
  const prices = history.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  return history
    .map((h, i) => {
      const x = ((i / (history.length - 1)) * 108).toFixed(1);
      const y = (50 - ((h.price - min) / range) * 46).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}

function MiniSparkline({
  points,
  positive,
  uid,
}: {
  points: string;
  positive: boolean;
  uid: string;
}) {
  const color = positive ? '#4ade80' : '#f87171';
  const fillId = `ms-${uid}`;
  const pts = points.split(' ');
  const lastX = pts[pts.length - 1].split(',')[0];
  const fillPoints = `${points} ${lastX},55 0,55`;
  return (
    <svg
      viewBox="0 0 110 55"
      className="w-20 h-8 shrink-0"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#${fillId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MarketplaceCard({
  asset,
  trending = false,
}: {
  asset: MarketplaceAsset;
  trending?: boolean;
}) {
  const navigate = useNavigate();
  const city = getMeta(asset.meta, 'city');
  const state = getMeta(asset.meta, 'state');
  const location = [city, state].filter(Boolean).join(', ') || 'Overseas';
  const marketValue = getMeta(asset.meta, 'marketValue');
  const propertyPrice = marketValue
    ? Number(marketValue)
    : asset.price?.currentPricePerFraction
      ? Number(asset.price.currentPricePerFraction)
      : null;
  const sparkPoints = priceHistoryToPoints(asset.priceHistory ?? []);
  const change7d = asset.change7d ?? 0;
  const isPositive = asset.isPositive ?? true;
  const changeLabel = `${isPositive ? '+' : ''}${change7d.toFixed(2)}%`;

  return (
    <motion.div
      variants={cardVariants}
      className="group relative bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#4F46E5]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/20 transition-all duration-300"
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#4F46E5] to-[#2563EB]" />

      <div className="p-5">
        {/* Trending badge */}
        {trending && (
          <div className="flex mb-3">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold shadow-lg shadow-orange-500/30">
              <FaFire className="text-[9px]" />
              Trending
            </span>
          </div>
        )}

        {/* Header: icon + title + status */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4F46E5]/20 to-[#2563EB]/10 border border-[#4F46E5]/15 flex items-center justify-center shrink-0">
            <FaBuilding className="text-[#4F46E5] dark:text-[#60A5FA] text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0B2545] dark:text-white line-clamp-1 leading-snug">
              {asset.assetTitle}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {asset.groupTitle}
            </p>
          </div>
          <StatusBadge status={asset.status} />
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[11px] mb-4">
          <CiLocationOn className="text-base shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* % Change row + sparkline */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E3E7EE] dark:border-white/10">
          <div>
            <p
              className={`text-xl font-bold leading-tight ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
            >
              {changeLabel}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              7D Change
            </p>
          </div>
          <MiniSparkline
            points={sparkPoints}
            positive={isPositive}
            uid={String(asset.assetId)}
          />
        </div>

        {/* Property Price */}
        <div className="flex items-center justify-between mb-5 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mb-0.5">
              Property Price
            </p>
            <p className="text-base font-bold text-[#0B2545] dark:text-white">
              {propertyPrice
                ? `₹ ${Number(propertyPrice).toLocaleString('en-IN')}`
                : '—'}
            </p>
          </div>
          <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">
            {asset.assetType}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigate(`/dashboard/marketplace/${asset.assetId}`, {
                state: { assetId: asset.assetId, groupId: asset.groupId },
              })
            }
            className="flex-1 h-9 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200 flex items-center justify-center gap-1.5 overflow-hidden relative group/buy cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/buy:translate-x-[100%] transition-transform duration-700" />
            <span className="relative z-10">Buy / Sell</span>
          </button>
          <button
            onClick={() => navigate(`/property-details/${asset.assetId}`)}
            className="flex-1 h-9 rounded-xl font-semibold text-xs border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-white/5 text-[#0B2545] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-[#1F4FE0]/25 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FaChartLine className="text-[10px]" />
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [searchTimer, setSearchTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const skip = page * PAGE_SIZE;

  const { data, isLoading } = useMarketplaceAssets({
    skip,
    take: PAGE_SIZE,
    search: debouncedSearch,
  });

  const assets = data?.data ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const isTrendingVisible = page === 0 && !debouncedSearch;
  const trendingAssets = isTrendingVisible ? assets.slice(0, 4) : [];
  const remainingAssets = isTrendingVisible ? assets.slice(4) : assets;

  const handleSearch = useCallback(
    (val: string) => {
      setSearch(val);
      if (searchTimer) clearTimeout(searchTimer);
      const t = setTimeout(() => {
        setDebouncedSearch(val);
        setPage(0);
      }, 400);
      setSearchTimer(t);
    },
    [searchTimer]
  );

  const goToPage = (p: number) => {
    if (p < 0 || p >= totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-[#F4F6F9] dark:bg-[#0B0B0B] min-h-screen pt-34 xl:pt-40 font-work pb-20 transition-all duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full "
      >
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            variants={cardVariants}
            className="py-5 mb-2 flex flex-col sm:flex-row sm:items-end gap-4 justify-between"
          >
            <div>
              <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
                Marketplace
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
                Browse available fractional assets from your primary club and
                invest.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <CiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 text-sm outline-none focus:border-[#4F46E5]/50 focus:ring-1 focus:ring-[#4F46E5]/30 transition-all duration-200"
              />
            </div>
          </motion.div>

          {/* Count */}
          {!isLoading && (
            <motion.div variants={cardVariants} className="mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                {total} asset{total !== 1 ? 's' : ''} available
                {debouncedSearch && ` · "${debouncedSearch}"`}
              </span>
            </motion.div>
          )}

          {/* Cards */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="py-20">
                <Loader isFullPage={false} />
              </div>
            ) : assets.length === 0 ? (
              <motion.div
                key="empty"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1"
              >
                <EmptyState search={debouncedSearch} />
              </motion.div>
            ) : (
              <motion.div
                key={`page-${page}-${debouncedSearch}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Trending section */}
                {isTrendingVisible && trendingAssets.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/10 border border-orange-500/20 shrink-0">
                        <FaFire className="text-orange-400 text-base" />
                      </div>
                      <div>
                        <h2 className="text-base md:text-lg font-serif font-semibold text-[#0B2545] dark:text-white leading-tight">
                          Trending Properties
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Top picks right now
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {trendingAssets.map((asset) => (
                        <MarketplaceCard
                          key={`trending-${asset.groupId}-${asset.assetId}`}
                          asset={asset}
                          trending
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Remaining / All properties */}
                {remainingAssets.length > 0 && (
                  <div>
                    {isTrendingVisible && (
                      <div className="mb-5">
                        <h2 className="text-base md:text-lg font-serif font-semibold text-[#0B2545] dark:text-white leading-tight">
                          All Properties
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {remainingAssets.length} available
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {remainingAssets.map((asset) => (
                        <MarketplaceCard
                          key={`${asset.groupId}-${asset.assetId}`}
                          asset={asset}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Page {page + 1} of {totalPages} · {total} total
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                  className="w-8 h-8 rounded-lg border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:hover:text-white hover:border-[#1F4FE0]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <FaAngleLeft className="text-[10px]" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter(
                    (i) =>
                      i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1
                  )
                  .reduce<(number | 'ellipsis')[]>((acc, i, idx, arr) => {
                    if (idx > 0 && i - (arr[idx - 1] as number) > 1)
                      acc.push('ellipsis');
                    acc.push(i);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span
                        key={`e-${idx}`}
                        className="text-gray-300 dark:text-gray-600 text-xs px-0.5"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => goToPage(item as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          page === item
                            ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-sm shadow-blue-500/20'
                            : 'border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:hover:text-white hover:border-[#1F4FE0]/30'
                        }`}
                      >
                        {(item as number) + 1}
                      </button>
                    )
                  )}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="w-8 h-8 rounded-lg border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:hover:text-white hover:border-[#1F4FE0]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <FaAngleRight className="text-[10px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
