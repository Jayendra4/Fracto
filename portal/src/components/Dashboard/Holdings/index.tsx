/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed portfolio/holdings handling, matches the pattern in rwa.api.ts */
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMyPortfolio } from '@/api/portfolio.api';
import Loader from '@/components/Loader';
import NoData from '@/components/Dashboard/NoData';
import HoldingCard, { type Holding } from './HoldingCard';
import {
  FiTrendingUp,
  // FiDollarSign,
  FiPieChart,
  FiActivity,
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { FaArrowUp, FaRupeeSign } from 'react-icons/fa';
// import { useMyFavourites } from '@/api/favourites.api';
// import SavedCard from '../Assets/MyAssets/savedCards';
// import SavedCard from '../MyAssets/savedCards';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function getMetaNumber(meta: any[], key: string) {
  const m = meta?.find((m: any) => m.metaKey === key)?.metaValue;
  return m ? parseFloat(m) : 0;
}

function getMetaString(meta: any[], key: string) {
  return meta?.find((m: any) => m.metaKey === key)?.metaValue || '';
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div
        className={`p-2.5 rounded-xl ${accent ? 'bg-gradient-to-br from-[#4F46E5] to-[#2563EB]' : 'bg-[#F5F8FF] dark:bg-white/10'} shrink-0`}
      >
        <span
          className={accent ? 'text-white' : 'text-[#0B2545] dark:text-white'}
        >
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-xs sm:text-lg md:text-xl font-semibold text-[#0B2545] dark:text-white leading-tight whitespace-nowrap">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-green flex items-center gap-0.5 mt-1 font-medium">
            <FaArrowUp className="text-[8px]" />
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Holdings() {
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * PAGE_SIZE;
  const take = PAGE_SIZE;

  const { data: portfolioRes, isLoading } = useMyPortfolio({ skip, take });

  const holdings: Holding[] = useMemo(() => {
    const resData: any =
      portfolioRes?.success === true ? portfolioRes.data : portfolioRes;
    const rawItems = Array.isArray(resData?.data)
      ? resData.data
      : Array.isArray(resData)
        ? resData
        : [];

    return rawItems.map((item: any) => {
      const asset = item.asset || item;
      const meta = item.meta || asset?.meta || [];
      const investment = item.investment || {};
      const financials = item.financials || asset?.financials || {};
      const priceData = item.price || asset?.price || {};

      const investmentAmt =
        investment.totalInvestedAmount || item.investmentAmount || 0;
      const currentVal =
        investment.currentValue ||
        investment.totalInvestedAmount ||
        getMetaNumber(meta, 'marketValue') ||
        0;

      return {
        id: asset?.id,
        title: asset?.assetTitle || asset?.title || 'Unknown Asset',
        type:
          asset?.assetSubType || asset?.assetType || asset?.type || 'Property',
        verified: asset?.isVerified || asset?.verified,
        location: getMetaString(meta, 'city') || asset?.location || 'Overseas',
        investment: investmentAmt,
        ownership: asset.totalFractions
          ? Number(
              (
                (investment.totalFractionsPurchased / asset.totalFractions) *
                100
              ).toFixed(2)
            )
          : Number((item.ownershipPercentage || 0).toFixed(2)),
        yield: Number(
          financials?.yield?.actualYieldPercent ||
            asset.yieldPercentage ||
            getMetaNumber(meta, 'expectedYieldPercentage') ||
            0
        ),
        value: currentVal,
        growth: Number(
          financials?.roi?.fiveYearROI ||
            asset.assetAppreciation ||
            getMetaNumber(meta, 'expectedAppreciationPercentage') ||
            0
        ),
        image:
          asset?.documents?.find((d: any) => d.documentType === 'ASSET_IMAGE')
            ?.url ||
          asset?.documents?.[0]?.documentUrl ||
          asset?.image,
        priceFraction: Number(
          priceData?.currentPricePerFraction ||
            financials?.perFraction?.price ||
            0
        ),
        roi: Number(
          financials?.roi?.fiveYearROI || getMetaNumber(meta, 'roi') || 0
        ),
        isSoldOut: asset?.status === 'Funded' || asset?.isSoldOut,
        unitsOwned: investment.totalFractionsPurchased || 0,
        totalUnits: asset?.totalFractions || 0,
      };
    });
  }, [portfolioRes]);

  const hasMore = holdings.length === PAGE_SIZE;

  const totalCount = useMemo(() => {
    const p = portfolioRes as any;
    if (!p) return holdings.length;
    const resData = p.success === true ? p.data : p;

    const explicitTotal =
      resData?.total ??
      resData?.totalCount ??
      resData?.totalItems ??
      resData?.meta?.total ??
      p?.total ??
      p?.totalCount;

    if (typeof explicitTotal === 'number' && explicitTotal > 0) {
      return explicitTotal;
    }

    if (typeof resData?.count === 'number' && resData.count > holdings.length) {
      return resData.count;
    }

    return hasMore ? (currentPage + 1) * PAGE_SIZE : skip + holdings.length;
  }, [portfolioRes, holdings.length, hasMore, currentPage, skip]);

  const totalPages = useMemo(() => {
    if (totalCount > skip + holdings.length) {
      return Math.ceil(totalCount / PAGE_SIZE);
    }
    return hasMore ? currentPage + 1 : currentPage;
  }, [totalCount, skip, holdings.length, hasMore, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const totalInvested = useMemo(() => {
    const resData: any =
      portfolioRes?.success === true ? portfolioRes.data : portfolioRes;
    if (resData?.totalInvestedAmount !== undefined)
      return Number(resData.totalInvestedAmount);
    if (resData?.summary?.totalInvested !== undefined)
      return Number(resData.summary.totalInvested);
    return holdings.reduce((s, h) => s + Number(h.investment), 0);
  }, [portfolioRes, holdings]);

  const totalValue = useMemo(() => {
    const resData: any =
      portfolioRes?.success === true ? portfolioRes.data : portfolioRes;
    if (resData?.currentValue !== undefined)
      return Number(resData.currentValue);
    if (resData?.summary?.totalValue !== undefined)
      return Number(resData.summary.totalValue);
    return holdings.reduce((s, h) => s + Number(h.value), 0);
  }, [portfolioRes, holdings]);

  const totalPnl = totalValue - totalInvested;

  const avgYield = useMemo(() => {
    const resData: any =
      portfolioRes?.success === true ? portfolioRes.data : portfolioRes;
    if (resData?.avgYield !== undefined) return Number(resData.avgYield);
    if (resData?.summary?.avgYield !== undefined)
      return Number(resData.summary.avgYield);
    return holdings.length > 0
      ? holdings.reduce((s, h) => s + Number(h.yield), 0) / holdings.length
      : 0;
  }, [portfolioRes, holdings]);

  const totalUnits = useMemo(() => {
    const resData: any =
      portfolioRes?.success === true ? portfolioRes.data : portfolioRes;
    if (resData?.totalUnits !== undefined) return Number(resData.totalUnits);
    if (resData?.summary?.totalUnits !== undefined)
      return Number(resData.summary.totalUnits);
    return holdings.reduce((s, h) => s + Number(h.unitsOwned || 0), 0);
  }, [portfolioRes, holdings]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const isNextDisabled = !hasMore || holdings.length === 0;

  return (
    <section
      className="w-full bg-[var(--bg)] min-h-screen pt-34 xl:pt-40
       font-work pb-20 transition-all duration-300"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full px-4 md:px-10"
      >
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="py-5 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          >
            <div>
              <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white tracking-tight">
                My Holdings
              </h1>

              <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
                Track your structural co-ownership positions, P&amp;L, and
                market activity.
              </p>
            </div>

            <Link
              to="/dashboard/my-holdings/saved-assets"
              className="w-full sm:w-auto text-center px-5 py-2 rounded-lg bg-[#4F46E5] text-white font-medium hover:opacity-90 transition"
            >
              Saved Assets
            </Link>
          </motion.div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            <StatCard
              icon={<FaRupeeSign size={18} />}
              label="Total Invested"
              value={`₹ ${totalInvested.toLocaleString()}`}
              accent
            />
            <StatCard
              icon={<FiTrendingUp size={18} />}
              label="Current Value"
              value={`₹ ${totalValue.toLocaleString()}`}
              sub={
                totalPnl >= 0
                  ? `+₹ ${Math.abs(totalPnl).toLocaleString()} gain`
                  : undefined
              }
            />
            <StatCard
              icon={<FiActivity size={18} />}
              label="Total P&L"
              value={`${totalPnl >= 0 ? '+' : ''}₹ ${totalPnl.toLocaleString()}`}
            />
            <StatCard
              icon={<FiPieChart size={18} />}
              label="Avg. Yield"
              value={`${avgYield.toFixed(2)}%`}
              sub="Per Annum"
            />
            <StatCard
              icon={<FiGrid size={18} />}
              label="Total Units"
              value={totalUnits.toLocaleString()}
              sub={`${Math.max(totalCount, holdings.length)} properties`}
            />
          </div>

          {/* Holdings grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <Loader isFullPage={false} />
            ) : holdings.length === 0 && currentPage === 1 ? (
              <NoData
                title="No Holdings Found"
                description="You haven't purchased any structural co-ownership yet. Start investing to build your portfolio."
                icon={<FiTrendingUp size={32} />}
                action={
                  <Link
                    to="/primary-club"
                    className="flex items-center gap-2 text-[#60A5FA] font-semibold hover:gap-3 transition-all duration-300"
                  >
                    Explore Assets →
                  </Link>
                }
              />
            ) : (
              <div>
                <motion.div
                  key={`holdings-grid-page-${currentPage}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                  {holdings.map((h) => (
                    <motion.div variants={itemVariants} key={h.id}>
                      <HoldingCard holding={h} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {(holdings.length > 0 || currentPage > 1) && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E3E7EE] dark:border-white/10">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Showing {holdings.length === 0 ? 0 : skip + 1} of{' '}
                      {skip + holdings.length} holdings
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded-lg border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white hover:border-[#4F46E5] disabled:opacity-30 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center cursor-pointer"
                        aria-label="Previous page"
                      >
                        <FiChevronLeft className="text-sm" />
                      </button>

                      {getPageNumbers().map((item, idx) =>
                        item === '...' ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="text-gray-400 dark:text-gray-500 text-xs px-1"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${item}`}
                            onClick={() => setCurrentPage(Number(item))}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition duration-200 cursor-pointer ${
                              currentPage === item
                                ? 'bg-[#4F46E5] text-white shadow-xs'
                                : 'border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white hover:border-[#4F46E5]'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((p) => (isNextDisabled ? p : p + 1))
                        }
                        disabled={isNextDisabled}
                        className="w-8 h-8 rounded-lg border border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white hover:border-[#4F46E5] disabled:opacity-30 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center cursor-pointer"
                        aria-label="Next page"
                      >
                        <FiChevronRight className="text-sm" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
