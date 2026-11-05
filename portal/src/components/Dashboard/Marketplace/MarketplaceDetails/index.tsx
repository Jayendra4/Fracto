/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset/meta handling, matches the pattern in rwa.api.ts */
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMarketplaceOverview,
  useMyListings,
  useAssetListings,
  useImmediateSellList,
  useMarketplaceChart,
  useOrderBook,
} from '@/api/group.api';
import Loader from '@/components/Loader';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  MdArrowBack,
  MdTrendingUp,
  MdTrendingDown,
  MdShoppingCart,
  MdSell,
  MdFlashOn,
} from 'react-icons/md';
import { FiShield, FiCheck, FiActivity, FiAlertCircle } from 'react-icons/fi';
import { CiLocationOn } from 'react-icons/ci';
import { FaArrowUp, FaArrowDown, FaChevronDown } from 'react-icons/fa';
import {
  BuyShareModal,
  SellShareModal,
  ImmediateSaleModal,
  DirectBuyModal,
  DirectSellModal,
  DirectBuyFromListingModal,
} from './ActionModals';
import type { AssetListing } from '@/api/group.api';

/* ─── Price chart data generator ─────────────────────────────── */

function generatePriceHistory(
  currentPrice: number,
  months = 12,
  range: '1M' | '3M' | '6M' | '1Y'
) {
  const points =
    range === '1M'
      ? 30
      : range === '3M'
        ? 13
        : range === '6M'
          ? 26
          : months * 4;
  const labelFn =
    range === '1M'
      ? (i: number) => `D${points - i}`
      : range === '3M'
        ? (i: number) => `W${points - i}`
        : (i: number) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (points - 1 - i));
            return d.toLocaleString('default', { month: 'short' });
          };

  const data = [];
  let price = currentPrice * 0.82;
  const volatility = currentPrice * 0.018;

  for (let i = 0; i < points; i++) {
    price = Math.max(
      currentPrice * 0.6,
      price + (Math.random() - 0.44) * volatility
    );
    data.push({
      label: labelFn(i),
      price: Math.round(price),
      volume: Math.floor(Math.random() * 800 + 200),
    });
  }
  data[data.length - 1].price = currentPrice;
  return data;
}

/* ─── Order book generator ────────────────────────────────────── */

/* ─── Helpers ─────────────────────────────────────────────────── */

function getMetaNumber(meta: any[], key: string) {
  const m = meta?.find((m: any) => m.metaKey === key)?.metaValue;
  return m ? parseFloat(m) : 0;
}

function getMetaString(meta: any[], key: string) {
  return meta?.find((m: any) => m.metaKey === key)?.metaValue || '';
}

type ModalType =
  | 'buy'
  | 'sell'
  | 'immediate'
  | 'direct'
  | 'directBuy'
  | 'directSell'
  | null;

/* ─── Custom tooltip ──────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#F4F6F9] dark:bg-[#0B0B0B] border border-[#E3E7EE] dark:border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-[#0B2545] dark:text-white">
        ₹ {payload[0]?.value?.toLocaleString()}
      </p>
      {payload[1] && (
        <p className="text-gray-400 dark:text-gray-500">
          Vol: {payload[1]?.value}
        </p>
      )}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

export default function HoldingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: overview, isLoading } = useMarketplaceOverview(id);
  const [chartRange, setChartRange] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'chart' | 'orderbook' | 'marketplace'
  >('chart');
  const [listingsTab, setListingsTab] = useState<'All' | 'Ask' | 'Bid'>('All');
  const [listingsPage, setListingsPage] = useState(0);
  const MY_LISTINGS_TAKE = 10;
  const [assetListingsType, setAssetListingsType] = useState<
    'Ask' | 'Bid' | 'Immediate'
  >('Ask');
  const [assetListingsSearch, setAssetListingsSearch] = useState('');
  const [assetListingsDebSearch, setAssetListingsDebSearch] = useState('');
  const [assetListingsPage, setAssetListingsPage] = useState(0);
  const [assetListingsStatus, setAssetListingsStatus] =
    useState<string>('Active');
  const [immediateSellPage, setImmediateSellPage] = useState(0);
  const ASSET_LISTINGS_TAKE = 10;
  const IMMEDIATE_SELL_TAKE = 10;
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [selectedAskListing, setSelectedAskListing] =
    useState<AssetListing | null>(null);
  const [selectedBidListing, setSelectedBidListing] =
    useState<AssetListing | null>(null);
  const [isMyHoldingOpen, setIsMyHoldingOpen] = useState(false);

  const { data: myListingsRes, isLoading: listingsLoading } = useMyListings({
    assetId: overview?.assetId ?? 0,
    type: listingsTab === 'All' ? undefined : listingsTab,
    skip: listingsPage * MY_LISTINGS_TAKE,
    take: MY_LISTINGS_TAKE,
  });
  const myListingsData = myListingsRes?.success ? myListingsRes.data : null;
  const myListings = myListingsData?.data ?? [];
  const myListingsTotalPages = myListingsData
    ? Math.ceil(myListingsData.count / MY_LISTINGS_TAKE)
    : 0;

  useEffect(() => {
    const t = setTimeout(
      () => setAssetListingsDebSearch(assetListingsSearch),
      400
    );
    return () => clearTimeout(t);
  }, [assetListingsSearch]);

  useEffect(() => {
    setAssetListingsPage(0);
  }, [assetListingsType, assetListingsDebSearch, assetListingsStatus]);

  useEffect(() => {
    setListingsPage(0);
  }, [listingsTab]);

  const holding = useMemo(() => {
    if (!overview) return null;
    const asset = overview.asset;
    const pd = overview.propertyDetails;
    const meta = asset?.meta || [];

    return {
      id: overview.assetId,
      title: asset?.assetTitle || 'Unknown Asset',
      type:
        pd?.assetSubType ||
        asset?.assetSubType ||
        asset?.assetType ||
        'Property',
      verified: asset?.isVerified ?? false,
      location: [pd?.city, pd?.state].filter(Boolean).join(', ') || 'Overseas',
      investment: overview.investedAmount,
      ownership: overview.ownershipPercent,
      yield: overview.yieldPA,
      value: overview.currentValue,
      growth: getMetaNumber(meta, 'expectedAppreciationPercentage'),
      image: undefined as string | undefined,
      priceFraction: overview.pricePerUnit,
      roi: pd?.roi5Y && pd.roi5Y !== 'N/A' ? Number(pd.roi5Y) : 0,
      isSoldOut: asset?.isSoldOut ?? false,
      unitsOwned: overview.unitsOwned,
      totalUnits: pd?.totalUnits ?? asset?.totalFractions ?? 0,
      spvName: getMetaString(meta, 'spvName') || asset?.ownershipModel || 'N/A',
      yearBuilt: pd?.yearBuilt || 'N/A',
      holdingPeriod: pd?.expectedHolding || '5+ Years',
      status: asset?.status || 'Available',
      totalPnL: overview.totalPnL,
      returnPercent: overview.returnPercent,
      isPositive: overview.isPositive,
      priceHistory: overview.priceHistory ?? [],
      change7d: overview.change7d ?? 0,
      isPayment: overview.isPayment ?? false,
    };
  }, [overview]);

  const { data: chartApiData } = useMarketplaceChart(
    holding?.id ?? 0,
    chartRange
  );

  const chartData = useMemo(() => {
    if (chartApiData?.priceHistory?.length) {
      return chartApiData.priceHistory.map((h, i) => ({
        label: h.date,
        price: h.price,
        volume: chartApiData.volumeHistory?.[i]?.volume ?? 0,
      }));
    }
    return holding
      ? generatePriceHistory(holding.priceFraction, 12, chartRange)
      : [];
  }, [chartApiData, holding, chartRange]);

  const pnl = holding?.totalPnL ?? 0;
  const pnlPct = holding ? Number(holding.returnPercent).toFixed(2) : '0.00';
  const isPositive = holding?.isPositive ?? true;

  const { data: assetListingsRes } = useAssetListings(holding?.id ?? 0, {
    type: assetListingsType === 'Immediate' ? 'Ask' : assetListingsType,
    skip: assetListingsPage * ASSET_LISTINGS_TAKE,
    take: ASSET_LISTINGS_TAKE,
    search: assetListingsDebSearch || undefined,
    listingStatus: assetListingsStatus || undefined,
  });
  const assetListingsData = assetListingsRes?.success
    ? assetListingsRes.data
    : null;
  const assetListingsTotalPages = assetListingsData
    ? Math.ceil(assetListingsData.count / ASSET_LISTINGS_TAKE)
    : 0;

  const { data: immediateSellRes, isLoading: immediateSellLoading } =
    useImmediateSellList({
      assetId: holding?.id ?? 0,
      skip: immediateSellPage * IMMEDIATE_SELL_TAKE,
      take: IMMEDIATE_SELL_TAKE,
      enabled: assetListingsType === 'Immediate',
    });
  const immediateSellData = immediateSellRes?.success
    ? immediateSellRes.data
    : null;
  const immediateSellTotalPages = immediateSellData
    ? Math.ceil(immediateSellData.count / IMMEDIATE_SELL_TAKE)
    : 0;

  const { data: orderBookData } = useOrderBook(
    holding?.id ?? 0,
    activeTab === 'orderbook'
  );

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading && !overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] dark:bg-[#0B0B0B]">
        <Loader />
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F9] dark:bg-[#0B0B0B] gap-4 text-[#0B2545] dark:text-white">
        <p className="text-xl font-semibold">Holding not found</p>
        <button
          onClick={() => navigate('/dashboard/holdings')}
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
      <section className="bg-[#F4F6F9] dark:bg-[#0B0B0B] mt-8 text-[#0B2545] dark:text-white min-h-screen pt-20 md:pt-28 pb-20 font-work">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10">
          {/* Back + title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 mb-6 mt-4"
          >
            {/* <button
              onClick={() => navigate(-1)}
              className="mt-1 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-[#0B2545] dark:text-white border border-[#E3E7EE] dark:border-white/10 shrink-0"
            >
              <MdArrowBack size={20} />
            </button> */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-[#0B2545] dark:text-white">
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
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                <CiLocationOn />
                <span>{holding.location}</span>
                <span className="mx-1 text-gray-300 dark:text-gray-600">|</span>
                <span>{holding.type}</span>
              </div>
            </div>
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT: Chart + tabs */}
            <div className="xl:col-span-2 space-y-5">
              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex gap-1 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-1 w-full sm:w-fit"
              >
                {(
                  [
                    { key: 'chart', label: 'Chart' },
                    { key: 'overview', label: 'Overview' },
                    { key: 'orderbook', label: 'Order Book' },
                    { key: 'marketplace', label: 'Orders' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      if (key === 'overview') {
                        queryClient.invalidateQueries({
                          queryKey: ['marketplace-overview', id],
                        });
                      } else if (key === 'chart') {
                        queryClient.invalidateQueries({
                          queryKey: ['marketplace-chart', holding?.id ?? 0],
                        });
                      }
                    }}
                    className={`flex-1 sm:flex-none min-w-0 px-1 sm:px-4 py-2 rounded-lg 
        text-[10px] sm:text-sm font-medium text-center leading-tight 
        transition-all duration-300 ${
          activeTab === key
            ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:text-white hover:dark:text-[#ffffff]/70'
        }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>

              <AnimatePresence mode="wait">
                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'overview' && (
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
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
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
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wider">
                          Current Value
                        </p>
                        <p className="text-2xl font-bold text-[#0B2545] dark:text-white">
                          ₹ {Number(holding.value).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
                          className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-4"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium mb-1.5">
                            {s.label}
                          </p>
                          <p className="text-base font-semibold text-[#0B2545] dark:text-white">
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Property details */}
                    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-5">
                      <h3 className="font-semibold text-base mb-4 text-[#0B2545] dark:text-white">
                        Property Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-white/10">
                        <div className="space-y-3 sm:pr-5">
                          {[
                            { k: 'SPV Name', v: holding.spvName },
                            {
                              k: 'Total Units',
                              v: holding.totalUnits.toLocaleString(),
                            },
                            { k: 'Property Type', v: holding.type },
                          ].map((r) => (
                            <div
                              key={r.k}
                              className="flex justify-between text-sm py-1"
                            >
                              <span className="text-gray-500 dark:text-gray-400">
                                {r.k}
                              </span>
                              <span className="font-medium text-[#0B2545] dark:text-white">
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
                              <span className="text-gray-500 dark:text-gray-400">
                                {r.k}
                              </span>
                              <span className="font-medium text-[#0B2545] dark:text-white">
                                {r.v}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── CHART TAB ── */}
                {activeTab === 'chart' && (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Range selector */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <FiActivity size={14} />
                        Price History
                      </div>
                      <div className="flex gap-1 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-1">
                        {(['1M', '3M', '6M', '1Y'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => setChartRange(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                              chartRange === r
                                ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow'
                                : 'text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:text-white hover:dark:text-[#ffffff]/70'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price indicator */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-[#0B2545] dark:text-white">
                        ₹{' '}
                        {(
                          chartApiData?.currentPrice ?? marketPrice
                        ).toLocaleString()}
                      </span>
                      {chartApiData !== undefined && (
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold ${(chartApiData?.changePercent ?? 0) >= 0 ? 'text-green' : 'text-red-500'}`}
                        >
                          {(chartApiData?.changePercent ?? 0) >= 0 ? (
                            <MdTrendingUp size={16} />
                          ) : (
                            <MdTrendingDown size={16} />
                          )}
                          {(chartApiData?.changePercent ?? 0) >= 0 ? '+' : ''}
                          {(chartApiData?.changePercent ?? 0).toFixed(2)}%
                        </span>
                      )}
                    </div>

                    {/* OHLC cards */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        {
                          label: 'Opening',
                          value: chartApiData
                            ? `₹ ${chartApiData.opening.toLocaleString()}`
                            : '₹ 0',
                        },
                        {
                          label: 'High',
                          value: chartApiData
                            ? `₹ ${chartApiData.high.toLocaleString()}`
                            : '₹ 0',
                        },
                        {
                          label: 'Low',
                          value: chartApiData
                            ? `₹ ${chartApiData.low.toLocaleString()}`
                            : '₹ 0',
                        },
                        {
                          label: 'Close',
                          value: chartApiData
                            ? `₹ ${chartApiData.close.toLocaleString()}`
                            : '₹ 0',
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl px-3 py-2.5"
                        >
                          <p className="text-[12px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1">
                            {label}
                          </p>
                          <p className="text-sm font-bold text-[#0B2545] dark:text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Recharts area chart */}
                    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-4">
                      <div className="h-64 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 4, bottom: 0, left: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="priceGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#4F46E5"
                                  stopOpacity={0.25}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#4F46E5"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--fg)"
                              strokeOpacity={0.05}
                            />
                            <XAxis
                              dataKey="label"
                              tick={{
                                fontSize: 10,
                                fill: 'var(--fg)',
                                opacity: 0.35,
                              }}
                              axisLine={false}
                              tickLine={false}
                              interval={Math.max(
                                0,
                                Math.floor(chartData.length / 12) - 1
                              )}
                              tickFormatter={(v: string) => {
                                const d = new Date(v);
                                if (isNaN(d.getTime())) return v;
                                return d.toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                });
                              }}
                            />
                            <YAxis
                              tick={{
                                fontSize: 10,
                                fill: 'var(--fg)',
                                opacity: 0.35,
                              }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(v) =>
                                `₹${(v / 1000).toFixed(0)}k`
                              }
                              width={48}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="price"
                              stroke="#4F46E5"
                              strokeWidth={2.5}
                              fill="url(#priceGrad)"
                              dot={false}
                              activeDot={{
                                r: 5,
                                fill: '#60A5FA',
                                stroke: 'var(--bg)',
                                strokeWidth: 2,
                              }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Volume mini chart */}
                    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-4">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-3">
                        Transaction Volume
                      </p>
                      <div className="h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={chartData}
                            margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="volGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#60A5FA"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#60A5FA"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="volume"
                              stroke="#60A5FA"
                              strokeWidth={1.5}
                              fill="url(#volGrad)"
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── ORDER BOOK TAB ── */}
                {activeTab === 'orderbook' && (
                  <motion.div
                    key="orderbook"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Market price band */}
                    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          Market Price
                        </span>
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${(orderBookData?.changePercent ?? 0) >= 0 ? 'text-green' : 'text-red-500'}`}
                        >
                          {(orderBookData?.changePercent ?? 0) >= 0 ? (
                            <MdTrendingUp />
                          ) : (
                            <MdTrendingDown />
                          )}
                          {(orderBookData?.changePercent ?? 0) >= 0 ? '+' : ''}
                          {(orderBookData?.changePercent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-[#0B2545] dark:text-white">
                        ₹{' '}
                        {(
                          orderBookData?.marketPrice ?? marketPrice
                        ).toLocaleString()}
                      </p>
                    </div>

                    {/* Order book table */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Sell orders */}
                      <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#E3E7EE] dark:border-white/10 bg-red-500/[0.04]">
                          <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                            Sell Orders (Ask)
                          </p>
                        </div>
                        <div>
                          <div className="grid grid-cols-2 px-4 py-2 text-[9px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-[#E3E7EE] dark:border-white/10">
                            <span>Price (₹)</span>
                            <span className="text-right">Units</span>
                          </div>
                          {(orderBookData?.sellOrders ?? []).slice(0, 10)
                            .length === 0 ? (
                            <p className="px-4 py-6 text-xs text-center text-gray-400 dark:text-gray-500">
                              No sell orders
                            </p>
                          ) : (
                            (orderBookData?.sellOrders ?? [])
                              .slice(0, 10)
                              .map((ask, i) => {
                                const maxUnits = Math.max(
                                  ...(orderBookData?.sellOrders ?? []).map(
                                    (a) => a.units
                                  )
                                );
                                const pct = (ask.units / maxUnits) * 100;
                                return (
                                  <div
                                    key={i}
                                    className="relative grid grid-cols-2 px-4 py-2.5 text-xs font-medium hover:bg-red-500/[0.04] transition-colors border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
                                  >
                                    <div
                                      className="absolute inset-y-0 right-0 bg-red-500/8"
                                      style={{ width: `${pct}%` }}
                                    />
                                    <span className="relative text-red-400 font-semibold">
                                      {ask.price.toLocaleString()}
                                    </span>
                                    <span className="relative text-right text-gray-600 dark:text-gray-300">
                                      {ask.units}
                                    </span>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>

                      {/* Buy orders */}
                      <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#E3E7EE] dark:border-white/10 bg-green/[0.04]">
                          <p className="text-xs font-semibold uppercase tracking-wider text-green">
                            Buy Orders (Bid)
                          </p>
                        </div>
                        <div>
                          <div className="grid grid-cols-2 px-4 py-2 text-[9px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-[#E3E7EE] dark:border-white/10">
                            <span>Price (₹)</span>
                            <span className="text-right">Units</span>
                          </div>
                          {(orderBookData?.buyOrders ?? []).slice(0, 10)
                            .length === 0 ? (
                            <p className="px-4 py-6 text-xs text-center text-gray-400 dark:text-gray-500">
                              No buy orders
                            </p>
                          ) : (
                            (orderBookData?.buyOrders ?? [])
                              .slice(0, 10)
                              .map((bid, i) => {
                                const maxUnits = Math.max(
                                  ...(orderBookData?.buyOrders ?? []).map(
                                    (b) => b.units
                                  )
                                );
                                const pct = (bid.units / maxUnits) * 100;
                                return (
                                  <div
                                    key={i}
                                    className="relative grid grid-cols-2 px-4 py-2.5 text-xs font-medium hover:bg-green/[0.04] transition-colors border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
                                  >
                                    <div
                                      className="absolute inset-y-0 left-0 bg-green/8"
                                      style={{ width: `${pct}%` }}
                                    />
                                    <span className="relative text-green font-semibold">
                                      {bid.price.toLocaleString()}
                                    </span>
                                    <span className="relative text-right text-gray-600 dark:text-gray-300">
                                      {bid.units}
                                    </span>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent trades */}
                    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl overflow-hidden">
                      <div className="px-5 py-3 border-b border-[#E3E7EE] dark:border-white/10">
                        <p className="text-sm font-semibold text-[#0B2545] dark:text-white">
                          Recent Trades
                        </p>
                      </div>
                      <div>
                        <div className="grid grid-cols-3 px-5 py-2 text-[9px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-[#E3E7EE] dark:border-white/10">
                          <span>Price (₹)</span>
                          <span className="text-center">Units</span>
                          <span className="text-right">Time</span>
                        </div>
                        {(orderBookData?.recentTrades ?? []).slice(0, 10)
                          .length === 0 ? (
                          <p className="px-5 py-6 text-xs text-center text-gray-400 dark:text-gray-500">
                            No recent trades
                          </p>
                        ) : (
                          (orderBookData?.recentTrades ?? [])
                            .slice(0, 10)
                            .map((trade, i) => (
                              <div
                                key={i}
                                className="grid grid-cols-3 px-5 py-2.5 text-xs border-b border-[#E3E7EE] dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                              >
                                <span
                                  className={`font-semibold ${trade.type === 'BID_FULFILLED' ? 'text-green' : 'text-red-400'}`}
                                >
                                  {trade.price.toLocaleString()}
                                </span>
                                <span className="text-center text-gray-500 dark:text-gray-400">
                                  {trade.units}
                                </span>
                                <span className="text-right text-gray-400 dark:text-gray-500">
                                  {trade.timeAgo}
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── MARKETPLACE TAB ── */}
                {activeTab === 'marketplace' && (
                  <motion.div
                    key="marketplace"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    {/* My Listings */}
                    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 border-b border-[#E3E7EE] dark:border-white/10 flex items-center justify-between flex-wrap gap-3">
                        <p className="text-sm font-semibold text-[#0B2545] dark:text-white">
                          My Listings
                        </p>
                        <div className="flex gap-1 bg-[#F4F6F9] dark:bg-[#0B0B0B] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-1">
                          {(['All', 'Ask', 'Bid'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setListingsTab(t)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                listingsTab === t
                                  ? t === 'Ask'
                                    ? 'bg-orange-500 text-white shadow'
                                    : t === 'Bid'
                                      ? 'bg-[#4F46E5] text-white shadow'
                                      : 'bg-gray-100 dark:bg-white/10 text-[#0B2545] dark:text-white shadow'
                                  : 'text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:text-white'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <div className="min-w-[680px]">
                          <div className="grid grid-cols-6 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5">
                            <span className="col-span-2 whitespace-nowrap">
                              Property
                            </span>
                            <span className="text-center whitespace-nowrap">
                              Type
                            </span>
                            <span className="text-center whitespace-nowrap">
                              Price / Unit
                            </span>
                            <span className="text-center whitespace-nowrap">
                              Units
                            </span>
                            <span className="text-center whitespace-nowrap">
                              Status
                            </span>
                          </div>

                          {listingsLoading ? (
                            <div className="py-10 flex justify-center">
                              <div className="w-5 h-5 border-2 border-[#E3E7EE] dark:border-white/10 border-t-[#60A5FA] rounded-full animate-spin" />
                            </div>
                          ) : myListings.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                              No listings found.
                            </div>
                          ) : (
                            myListings.map((listing) => (
                              <motion.div
                                key={listing.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-6 px-5 py-4 items-center border-b border-[#E3E7EE] dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
                              >
                                <div className="col-span-2 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0 text-gray-400 dark:text-gray-500">
                                    <MdTrendingUp size={14} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-[#0B2545] dark:text-white line-clamp-1">
                                      {listing.asset.assetTitle}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                      {new Date(
                                        listing.createdAt
                                      ).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${listing.type === 'Ask' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-[#4F46E5]/10 text-[#60A5FA] border-[#4F46E5]/20'}`}
                                  >
                                    {listing.type}
                                  </span>
                                </div>
                                <div className="text-center font-semibold text-[#0B2545] dark:text-white">
                                  ₹{' '}
                                  {Number(
                                    listing.pricePerUnit
                                  ).toLocaleString()}
                                </div>
                                <div className="text-center">
                                  {listing.remainingUnits !== 0 ? (
                                    <>
                                      {' '}
                                      <p className="font-medium text-[#0B2545] dark:text-white">
                                        {listing.remainingUnits}
                                      </p>
                                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                        of {listing.totalUnits}
                                      </p>{' '}
                                    </>
                                  ) : (
                                    <p className="font-medium text-[#0B2545] dark:text-white">
                                      {listing.totalUnits}
                                    </p>
                                  )}
                                </div>
                                <div className="text-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                      listing.status === 'Fulfilled'
                                        ? 'bg-green/10 text-green border-green/20'
                                        : listing.status === 'Partial'
                                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                          : listing.status === 'Active'
                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                            : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border-[#E3E7EE] dark:border-white/10'
                                    }`}
                                  >
                                    {listing.status}
                                  </span>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Pagination */}
                      {myListingsTotalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E3E7EE] dark:border-white/10">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {myListingsData?.count ?? 0} total · Page{' '}
                            {listingsPage + 1} of {myListingsTotalPages}
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                setListingsPage((p) => Math.max(0, p - 1))
                              }
                              disabled={listingsPage === 0}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E3E7EE] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              ← Prev
                            </button>
                            <button
                              onClick={() =>
                                setListingsPage((p) =>
                                  Math.min(myListingsTotalPages - 1, p + 1)
                                )
                              }
                              disabled={
                                listingsPage >= myListingsTotalPages - 1
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E3E7EE] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Asset Listings / Immediate Sell */}
                    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl overflow-hidden">
                      {/* Header row */}
                      <div className="px-5 py-4 border-b border-[#E3E7EE] dark:border-white/10 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex gap-1 bg-[#F4F6F9] dark:bg-[#0B0B0B] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-1">
                          {(['Ask', 'Bid', 'Immediate'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setAssetListingsType(t)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                assetListingsType === t
                                  ? t === 'Ask'
                                    ? 'bg-orange-500 text-white shadow'
                                    : t === 'Bid'
                                      ? 'bg-[#4F46E5] text-white shadow'
                                      : 'bg-red-500 text-white shadow'
                                  : 'text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:text-white'
                              }`}
                            >
                              {t === 'Ask'
                                ? 'Ask (Sellers)'
                                : t === 'Bid'
                                  ? 'Bid (Buyers)'
                                  : 'Immediate Sell'}
                            </button>
                          ))}
                        </div>
                        {/* Status filter + Search — only for Ask / Bid */}
                        {assetListingsType !== 'Immediate' && (
                          <div className="flex items-center gap-2">
                            <select
                              value={assetListingsStatus}
                              onChange={(e) =>
                                setAssetListingsStatus(e.target.value)
                              }
                              className="px-3 py-2 rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-[#F4F6F9] dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 cursor-pointer"
                            >
                              <option value="">All Status</option>
                              <option value="Active">Active</option>
                              <option value="Partial">Partial</option>
                              <option value="Fulfilled">Fulfilled</option>
                            </select>
                            <div className="relative">
                              <input
                                type="text"
                                value={assetListingsSearch}
                                onChange={(e) =>
                                  setAssetListingsSearch(e.target.value)
                                }
                                placeholder="Search..."
                                className="pl-8 pr-4 py-2 rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-[#F4F6F9] dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 w-36"
                              />
                              <svg
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Ask / Bid table ── */}
                      {assetListingsType !== 'Immediate' && (
                        <>
                          <div className="overflow-x-auto">
                            <div className="min-w-[680px]">
                              <div className="grid grid-cols-6 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                <span className="col-span-2 whitespace-nowrap">
                                  User
                                </span>
                                <span className="text-center whitespace-nowrap">
                                  Price / Unit
                                </span>
                                <span className="text-center whitespace-nowrap">
                                  Units
                                </span>
                                <span className="text-center whitespace-nowrap">
                                  Status
                                </span>
                                <span className="text-right whitespace-nowrap">
                                  Action
                                </span>
                              </div>

                              {(assetListingsData?.data ?? []).length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                                  No {assetListingsStatus}{' '}
                                  {assetListingsType === 'Ask' ? 'ask' : 'bid'}{' '}
                                  listings found.
                                </div>
                              ) : (
                                (assetListingsData?.data ?? []).map((item) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-6 px-5 py-4 items-center border-b border-[#E3E7EE] dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
                                  >
                                    <div className="col-span-2 flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
                                        {item.account.firstname[0]}
                                        {item.account.lastname[0]}
                                      </div>
                                      <div>
                                        <p className="font-medium text-[#0B2545] dark:text-white">
                                          {item.account.firstname}{' '}
                                          {item.account.lastname}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                          {new Date(
                                            item.createdAt
                                          ).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <p
                                        className={`font-semibold ${assetListingsType === 'Ask' ? 'text-orange-400' : 'text-[#60A5FA]'}`}
                                      >
                                        ₹{' '}
                                        {Number(
                                          item.pricePerUnit
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      {item.remainingUnits !== 0 ? (
                                        <>
                                          <p className="font-medium text-[#0B2545] dark:text-white">
                                            {item.remainingUnits}
                                          </p>
                                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                            of {item.totalUnits}
                                          </p>
                                        </>
                                      ) : (
                                        <p className="font-medium text-[#0B2545] dark:text-white">
                                          {item.totalUnits}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-center">
                                      <span
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                          item.status === 'Fulfilled'
                                            ? 'bg-green/10 text-green border-green/20'
                                            : item.status === 'Partial'
                                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                              : item.status === 'Active'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border-[#E3E7EE] dark:border-white/10'
                                        }`}
                                      >
                                        {item.status}
                                      </span>
                                    </div>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => {
                                          if (assetListingsType === 'Ask') {
                                            setSelectedAskListing(item);
                                            setOpenModal('directBuy');
                                          } else {
                                            setSelectedBidListing(item);
                                            setOpenModal('directSell');
                                          }
                                        }}
                                        disabled={item.status === 'Fulfilled'}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                                          item.status === 'Fulfilled'
                                            ? 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-[#E3E7EE] dark:border-white/10'
                                            : assetListingsType === 'Ask'
                                              ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow hover:shadow-blue-500/30'
                                              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20'
                                        }`}
                                      >
                                        {item.status === 'Fulfilled'
                                          ? 'Completed'
                                          : assetListingsType === 'Ask'
                                            ? 'Buy'
                                            : 'Sell'}
                                      </button>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </div>

                          {assetListingsTotalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-[#E3E7EE] dark:border-white/10">
                              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                {assetListingsData?.count ?? 0} total · Page{' '}
                                {assetListingsPage + 1} of{' '}
                                {assetListingsTotalPages}
                              </p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    setAssetListingsPage((p) =>
                                      Math.max(0, p - 1)
                                    )
                                  }
                                  disabled={assetListingsPage === 0}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E3E7EE] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  ← Prev
                                </button>
                                <button
                                  onClick={() =>
                                    setAssetListingsPage((p) =>
                                      Math.min(
                                        assetListingsTotalPages - 1,
                                        p + 1
                                      )
                                    )
                                  }
                                  disabled={
                                    assetListingsPage >=
                                    assetListingsTotalPages - 1
                                  }
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E3E7EE] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  Next →
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* ── Immediate Sell table ── */}
                      {assetListingsType === 'Immediate' && (
                        <>
                          <div className="overflow-x-auto">
                            <div className="min-w-[700px]">
                              <div className="grid grid-cols-6 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                <span className="col-span-2 whitespace-nowrap">
                                  Buyer
                                </span>
                                <span className="text-center whitespace-nowrap">
                                  Price / Unit
                                </span>
                                <span className="text-center whitespace-nowrap">
                                  Units
                                </span>
                                <span className="text-center whitespace-nowrap">
                                  Net Amount
                                </span>
                                <span className="text-right whitespace-nowrap">
                                  Date
                                </span>
                              </div>

                              {immediateSellLoading ? (
                                <div className="py-10 flex justify-center">
                                  <div className="w-5 h-5 border-2 border-[#E3E7EE] dark:border-white/10 border-t-red-400 rounded-full animate-spin" />
                                </div>
                              ) : (immediateSellData?.data ?? []).length ===
                                0 ? (
                                <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                                  No immediate sell records found.
                                </div>
                              ) : (
                                (immediateSellData?.data ?? []).map(
                                  (record) => (
                                    <motion.div
                                      key={record.id}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="grid grid-cols-6 px-5 py-4 items-center border-b border-[#E3E7EE] dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
                                    >
                                      <div className="col-span-2 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-400 shrink-0">
                                          {record.buyer.name
                                            .charAt(0)
                                            .toUpperCase()}
                                        </div>
                                        <div>
                                          <p className="font-medium text-[#0B2545] dark:text-white">
                                            {record.buyer.name}
                                          </p>
                                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {record.buyer.email}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-center font-semibold text-red-400">
                                        ₹{' '}
                                        {Number(
                                          record.pricePerUnit
                                        ).toLocaleString()}
                                      </div>
                                      <div className="text-center font-medium text-[#0B2545] dark:text-white">
                                        {record.units}
                                      </div>
                                      <div className="text-center">
                                        <p className="font-semibold text-[#0B2545] dark:text-white">
                                          ₹{' '}
                                          {Number(
                                            record.netAmount
                                          ).toLocaleString()}
                                        </p>
                                        {record.fee > 0 && (
                                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                            fee ₹{' '}
                                            {Number(
                                              record.fee
                                            ).toLocaleString()}
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right text-[10px] text-gray-400 dark:text-gray-500">
                                        {new Date(
                                          record.tradedAt
                                        ).toLocaleDateString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })}
                                      </div>
                                    </motion.div>
                                  )
                                )
                              )}
                            </div>
                          </div>

                          {immediateSellTotalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-[#E3E7EE] dark:border-white/10">
                              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                {immediateSellData?.count ?? 0} total · Page{' '}
                                {immediateSellPage + 1} of{' '}
                                {immediateSellTotalPages}
                              </p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    setImmediateSellPage((p) =>
                                      Math.max(0, p - 1)
                                    )
                                  }
                                  disabled={immediateSellPage === 0}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E3E7EE] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  ← Prev
                                </button>
                                <button
                                  onClick={() =>
                                    setImmediateSellPage((p) =>
                                      Math.min(
                                        immediateSellTotalPages - 1,
                                        p + 1
                                      )
                                    )
                                  }
                                  disabled={
                                    immediateSellPage >=
                                    immediateSellTotalPages - 1
                                  }
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E3E7EE] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  Next →
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: Holding card + actions */}
            <div className="xl:col-span-1 space-y-5">
              {/* My holding card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setIsMyHoldingOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-5 cursor-pointer"
                >
                  <h3 className="font-semibold text-base text-[#0B2545] dark:text-white">
                    My Holding
                  </h3>
                  <FaChevronDown
                    className={`text-[#0B2545] dark:text-white transition-transform duration-300 ${
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
                              className="flex justify-between items-center py-2 border-b border-[#E3E7EE] dark:border-white/10 last:border-0 text-sm"
                            >
                              <span className="text-gray-500 dark:text-gray-400">
                                {r.label}
                              </span>
                              <span className="font-semibold text-[#0B2545] dark:text-white">
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
                              <span className="text-xl font-bold text-[#0B2545] dark:text-white">
                                {holding.ownership}%
                              </span>
                              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium uppercase">
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
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-5 space-y-3"
              >
                <h3 className="font-semibold text-base text-[#0B2545] dark:text-white">
                  Quick Actions
                </h3>

                {/* Buy Share */}
                <button
                  onClick={() => setOpenModal('buy')}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <MdShoppingCart size={16} />
                  <span className="relative">Bid</span>
                </button>

                {/* Sell Share */}
                <button
                  disabled={holding.unitsOwned === 0}
                  onClick={() => setOpenModal('sell')}
                  className="w-full py-3 rounded-xl font-semibold text-sm border border-orange-500/30 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-500/5 disabled:hover:border-orange-500/30"
                >
                  <MdSell size={16} />
                  Ask
                </button>

                {/* Immediate Sale */}
                <button
                  disabled={holding.unitsOwned === 0}
                  onClick={() => setOpenModal('immediate')}
                  className="w-full py-3 rounded-xl font-semibold text-sm border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500/5 disabled:hover:border-red-500/30"
                >
                  <MdFlashOn size={16} />
                  Immediate Sell
                </button>

                <div className="flex items-start gap-2 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl px-3 py-2.5">
                  <FiAlertCircle
                    size={12}
                    className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                    A 15% platform fee will be charged on every Immediate Sell
                    transaction. Please review the deducted amount carefully
                    before proceeding.
                  </p>
                </div>

                {/* Direct Buy */}
                {/* <button
                  onClick={() => setOpenModal('direct')}
                  className="w-full py-3 rounded-xl font-semibold text-sm border border-green/30 bg-green/5 text-green hover:bg-green/10 hover:border-green/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MdTrendingUp size={16} />
                  Direct Buy
                </button> */}
              </motion.div>
              {/* View on marketplace */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => navigate(`/property-details/${holding.id}`)}
                className="w-full py-3 rounded-xl font-semibold text-sm border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[#0B2545] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                View Full Property Details →
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
            assetId={holding.id}
          />
        )}
        {openModal === 'buy' && (
          <BuyShareModal
            onClose={() => setOpenModal(null)}
            assetTitle={holding.title}
            marketPrice={marketPrice}
            unitsOwned={Number(holding.unitsOwned) || 0}
            assetId={holding.id}
          />
        )}
        {openModal === 'immediate' && (
          <ImmediateSaleModal
            onClose={() => setOpenModal(null)}
            assetTitle={holding.title}
            marketPrice={marketPrice}
            unitsOwned={Number(holding.unitsOwned) || 0}
            assetId={holding.id}
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
        {openModal === 'directBuy' && selectedAskListing && (
          <DirectBuyFromListingModal
            onClose={() => {
              setOpenModal(null);
              setSelectedAskListing(null);
            }}
            listingId={selectedAskListing.id}
            pricePerUnit={Number(selectedAskListing.pricePerUnit)}
            remainingUnits={selectedAskListing.remainingUnits}
            sellerName={`${selectedAskListing.account.firstname} ${selectedAskListing.account.lastname}`}
            assetTitle={holding.title}
            assetId={holding.id}
          />
        )}
        {openModal === 'directSell' && selectedBidListing && (
          <DirectSellModal
            onClose={() => {
              setOpenModal(null);
              setSelectedBidListing(null);
            }}
            listingId={selectedBidListing.id}
            pricePerUnit={Number(selectedBidListing.pricePerUnit)}
            remainingUnits={selectedBidListing.remainingUnits}
            buyerName={`${selectedBidListing.account.firstname} ${selectedBidListing.account.lastname}`}
            assetTitle={holding.title}
            assetId={holding.id}
          />
        )}
      </AnimatePresence>

      {/* Payment required — non-dismissible */}
      {/* {holding && !holding.isPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-14 left-0 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-md bg-(--bg) rounded-2xl border border-(--fg)/10 shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-(--fg)/8 bg-(--inner-card) flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10">
                <MdFlashOn size={18} className="text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-(--fg)">
                Action Required
              </h2>
            </div>
            <div className="px-6 py-6 space-y-5">
              <p className="text-sm text-(--fg)/70 leading-relaxed">
                Unlock property details & documents to enable marketplace
                trading.
              </p>
              <button
                onClick={() => navigate(`/property-details/${holding.id}`)}
                className="w-full cursor-pointer py-3 rounded-xl font-semibold text-sm bg-linear-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
              >
                View Property Details →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )} */}
    </>
  );
}
