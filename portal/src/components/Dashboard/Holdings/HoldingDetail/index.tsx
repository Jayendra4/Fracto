/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed portfolio/holdings handling, matches the pattern in rwa.api.ts */
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyPortfolio } from '@/api/portfolio.api';
import Loader from '@/components/Loader';
import { MdArrowBack } from 'react-icons/md';
import { FiShield, FiCheck } from 'react-icons/fi';
import { CiLocationOn } from 'react-icons/ci';
import { FaArrowUp, FaArrowDown, FaChevronDown } from 'react-icons/fa';
import {
  BuyShareModal,
  SellShareModal,
  ImmediateSaleModal,
  DirectBuyModal,
} from './ActionModals';

function getMetaNumber(meta: any[], key: string) {
  const m = meta?.find((m: any) => m.metaKey === key)?.metaValue;
  return m ? parseFloat(m) : 0;
}

function getMetaString(meta: any[], key: string) {
  return meta?.find((m: any) => m.metaKey === key)?.metaValue || '';
}

type ModalType = 'buy' | 'sell' | 'immediate' | 'direct' | null;

/* ─── Main component ──────────────────────────────────────────── */

export default function HoldingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // This component is reused both at the standalone /dashboard/holdings/:id
  // route and embedded (inside the sidebar shell) at
  // /dashboard/my-holdings/:id — keep "back" navigation on whichever base
  // path we were actually reached through.
  const holdingsBasePath = pathname.startsWith('/dashboard/my-holdings')
    ? '/dashboard/my-holdings'
    : '/dashboard/holdings';
  const { data: portfolioRes, isLoading } = useMyPortfolio();
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [isMyHoldingOpen, setIsMyHoldingOpen] = useState(false);

  const holding = useMemo(() => {
    const resData =
      portfolioRes?.success === true ? portfolioRes.data : undefined;
    const rawItems = Array.isArray(resData?.data)
      ? resData.data
      : Array.isArray(resData)
        ? resData
        : [];

    const item = rawItems.find((item: any) => {
      const asset = item.asset || item;
      return String(asset?.id) === String(id);
    });

    if (!item) return null;

    const asset = item.asset || item;
    const meta = item.meta || asset?.meta || [];
    const investment = item.investment || {};
    const financials = item.financials || asset?.financials || {};
    const priceData = item.price || asset?.price || {};

    return {
      id: asset?.id,
      title: asset?.assetTitle || asset?.title || 'Unknown Asset',
      type:
        asset?.assetSubType || asset?.assetType || asset?.type || 'Property',
      verified: asset?.isVerified || asset?.verified,
      location: getMetaString(meta, 'city') || asset?.location || 'Overseas',
      investment: investment.totalInvestedAmount || item.investmentAmount || 0,
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
      value:
        investment.currentValue ||
        investment.totalInvestedAmount ||
        getMetaNumber(meta, 'marketValue') ||
        0,
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
          500
      ),
      roi: Number(
        financials?.roi?.fiveYearROI || getMetaNumber(meta, 'roi') || 0
      ),
      isSoldOut: asset?.status === 'Funded' || asset?.isSoldOut,
      unitsOwned: investment.totalFractionsPurchased || 0,
      totalUnits: asset?.totalFractions || 0,
      remainingFractions: asset?.remainingFractions || 0,
      spvName: asset?.groupName || 'N/A',
      yearBuilt:
        getMetaString(meta, 'yearOfConstruction') ||
        getMetaString(meta, 'yearBuilt') ||
        'N/A',
      holdingPeriod: getMetaString(meta, 'holdingPeriod') || '5+ Years',
      status: asset?.status || 'Available',
    };
  }, [portfolioRes, id]);

  const pnl = holding ? Number(holding.value) - Number(holding.investment) : 0;
  const pnlPct =
    holding && Number(holding.investment) > 0
      ? ((pnl / Number(holding.investment)) * 100).toFixed(2)
      : '0.00';
  const isPositive = pnl >= 0;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading && !portfolioRes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader />
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] gap-4 text-[var(--fg)]">
        <p className="text-xl font-semibold">Holding not found</p>
        <button
          onClick={() => navigate(holdingsBasePath)}
          className="flex items-center gap-2 text-[#60A5FA] font-medium hover:gap-3 transition-all"
        >
          <MdArrowBack /> Back to Holdings
        </button>
      </div>
    );
  }

  const marketPrice = holding.priceFraction;

  return (
    <>
      <section className="bg-[var(--bg)] mt-14 text-[var(--fg)] min-h-screen pt-20 md:pt-28 pb-20 font-work">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10">
          {/* Back + title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 mb-6 mt-4"
          >
            {/* <button
              onClick={() => navigate(holdingsBasePath)}
              className="mt-1 p-2.5 rounded-xl hover:bg-[var(--fg)]/5 transition-colors text-[var(--fg)] border border-[var(--fg)]/10 shrink-0"
            >
              <MdArrowBack size={20} />
            </button> */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
                  {holding.title}
                </h1>
                {holding.verified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-green/30 bg-green/10 text-green text-xs font-semibold shrink-0">
                    <FiShield className="text-[9px]" />
                    <FiCheck className="text-[9px]" />
                    Verified
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full border border-[#4F46E5]/30 bg-[#4F46E5]/10 text-[#60A5FA] text-xs font-semibold shrink-0">
                  {holding.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--fg)]/50 text-sm">
                <CiLocationOn />
                <span>{holding.location}</span>
                <span className="mx-1 text-[var(--fg)]/20">|</span>
                <span>{holding.type}</span>
              </div>
            </div>
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT: Chart + tabs */}
            <div className="xl:col-span-2 space-y-5">
              {/* Tabs */}

              <AnimatePresence mode="wait">
                {/* ── OVERVIEW TAB ── */}

                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* P&L banner */}
                  <div
                    className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isPositive ? 'bg-green/5 border-green/20' : 'bg-red-500/5 border-red-500/20'}`}
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--fg)]/40 mb-1">
                        Total P&L
                      </p>
                      <p
                        className={`text-3xl font-bold flex items-center gap-2 ${isPositive ? 'text-green' : 'text-red-500'}`}
                      >
                        {isPositive ? (
                          <FaArrowUp size={20} />
                        ) : (
                          <FaArrowDown size={20} />
                        )}
                        {isPositive ? '+' : ''}₹{' '}
                        {Math.abs(pnl).toLocaleString()}
                      </p>
                      <p
                        className={`text-sm font-medium mt-1 ${isPositive ? 'text-green' : 'text-red-500'}`}
                      >
                        {isPositive ? '+' : ''}
                        {pnlPct}% return on investment
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--fg)]/40 mb-1 font-medium uppercase tracking-wider">
                        Current Value
                      </p>
                      <p className="text-2xl font-bold text-[var(--fg)]">
                        ₹ {Number(holding.value).toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--fg)]/40 mt-1">
                        Invested: ₹{' '}
                        {Number(holding.investment).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Stat grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Units Owned',
                        value: String(holding.unitsOwned || 0),
                      },
                      { label: 'Ownership', value: `${holding.ownership}%` },
                      {
                        label: 'Yield P.A.',
                        value: `${Number(holding.yield).toFixed(2)}%`,
                      },
                      {
                        label: 'Price / Unit',
                        value: `₹ ${marketPrice.toLocaleString()}`,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-[var(--inner-card)] border border-[var(--fg)]/5 rounded-xl p-4"
                      >
                        <p className="text-[10px] uppercase tracking-wider text-[var(--fg)]/40 font-medium mb-1.5">
                          {s.label}
                        </p>
                        <p className="text-base font-semibold text-[var(--fg)]">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Property details */}
                  <div className="bg-[var(--inner-card)] border border-[var(--fg)]/5 rounded-2xl p-5">
                    <h3 className="font-semibold text-base mb-4 text-[var(--fg)]">
                      Property Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[var(--fg)]/5">
                      <div className="space-y-3 sm:pr-5">
                        {[
                          { k: 'SPV Name', v: holding.spvName },
                          {
                            k: 'Total Sold Units',
                            v:
                              (
                                holding.totalUnits - holding.remainingFractions
                              ).toLocaleString() +
                              '/' +
                              holding.totalUnits.toLocaleString(),
                          },
                          { k: 'Property Type', v: holding.type },
                        ].map((r) => (
                          <div
                            key={r.k}
                            className="flex justify-between text-sm py-1"
                          >
                            <span className="text-[var(--fg)]/50">{r.k}</span>
                            <span className="font-medium text-[var(--fg)]">
                              {r.v}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 sm:pl-5 pt-3 sm:pt-0">
                        {[
                          { k: 'Year Built', v: holding.yearBuilt },
                          { k: 'Expected Holding', v: holding.holdingPeriod },
                          {
                            k: 'ROI (5Y)',
                            v: `${Number(holding.roi).toFixed(2)}%`,
                          },
                        ].map((r) => (
                          <div
                            key={r.k}
                            className="flex justify-between text-sm py-1"
                          >
                            <span className="text-[var(--fg)]/50">{r.k}</span>
                            <span className="font-medium text-[var(--fg)]">
                              {r.v}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── ORDER BOOK TAB ── */}

                {/* ── MARKETPLACE TAB ── */}
              </AnimatePresence>
            </div>

            {/* RIGHT: Holding card + actions */}
            <div className="xl:col-span-1 space-y-5">
              {/* My holding card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[var(--inner-card)] border border-[var(--fg)]/5 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setIsMyHoldingOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-5 cursor-pointer"
                >
                  <h3 className="font-semibold text-base text-[var(--fg)]">
                    My Holding
                  </h3>
                  <FaChevronDown
                    className={`text-[var(--fg)] transition-transform duration-300 ${
                      isMyHoldingOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isMyHoldingOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        <div className="space-y-3">
                          {[
                            {
                              label: 'My Ownership',
                              value: `${holding.unitsOwned || 0} Units`,
                            },
                            {
                              label: 'Ownership %',
                              value: `${holding.ownership}% of Total`,
                            },
                            {
                              label: 'Current Value',
                              value: `₹ ${Number(holding.value).toLocaleString()}`,
                            },
                            {
                              label: 'Avg. Buy Price',
                              value: `₹ ${marketPrice.toLocaleString()} / Unit`,
                            },
                            {
                              label: 'Yield',
                              value: `${Number(holding.yield).toFixed(2)}% Per Annum`,
                            },
                          ].map((r) => (
                            <div
                              key={r.label}
                              className="flex justify-between items-center py-2 border-b border-[var(--fg)]/5 last:border-0 text-sm"
                            >
                              <span className="text-[var(--fg)]/50">
                                {r.label}
                              </span>
                              <span className="font-semibold text-[var(--fg)]">
                                {r.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Ownership donut indicator */}
                        <div className="flex items-center justify-center py-3">
                          <div className="relative w-28 h-28">
                            <svg
                              className="w-full h-full -rotate-90"
                              viewBox="0 0 100 100"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="var(--fg)"
                                strokeOpacity="0.06"
                                strokeWidth="10"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="url(#ownershipGrad)"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${holding.ownership * 2.51} 251`}
                                className="transition-all duration-1000"
                              />
                              <defs>
                                <linearGradient
                                  id="ownershipGrad"
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop offset="0%" stopColor="#4F46E5" />
                                  <stop offset="100%" stopColor="#60A5FA" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-bold text-[var(--fg)]">
                                {holding.ownership}%
                              </span>
                              <span className="text-[9px] text-[var(--fg)]/40 font-medium uppercase">
                                Owned
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* View on marketplace */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => navigate(`/property-details/${holding.id}`)}
                className="w-full py-3 rounded-xl font-semibold text-sm border border-[var(--fg)]/10 bg-[var(--fg)]/[0.02] text-[var(--fg)] hover:bg-[var(--fg)]/[0.05] transition-all duration-300 flex items-center justify-center gap-2"
              >
                View Property Details →
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {openModal === 'sell' && (
          <SellShareModal
            onClose={() => setOpenModal(null)}
            assetTitle={holding.title}
            marketPrice={marketPrice}
            unitsOwned={Number(holding.unitsOwned) || 0}
          />
        )}
        {openModal === 'buy' && (
          <BuyShareModal
            onClose={() => setOpenModal(null)}
            assetTitle={holding.title}
            marketPrice={marketPrice}
            unitsOwned={Number(holding.unitsOwned) || 0}
          />
        )}
        {openModal === 'immediate' && (
          <ImmediateSaleModal
            onClose={() => setOpenModal(null)}
            assetTitle={holding.title}
            marketPrice={marketPrice}
            unitsOwned={Number(holding.unitsOwned) || 0}
          />
        )}
        {openModal === 'direct' && (
          <DirectBuyModal
            onClose={() => setOpenModal(null)}
            assetTitle={holding.title}
            marketPrice={marketPrice}
            unitsOwned={Number(holding.unitsOwned) || 0}
          />
        )}
      </AnimatePresence>
    </>
  );
}
