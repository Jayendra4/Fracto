import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CiLocationOn } from 'react-icons/ci';
import {
  FaHome,
  FaBuilding,
  FaIndustry,
  FaTree,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import { FiShield, FiCheck } from 'react-icons/fi';
import { MdTrendingUp } from 'react-icons/md';
// import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

export type Holding = {
  id: number | string;
  title: string;
  type: string;
  verified?: boolean;
  location: string;
  investment: number;
  ownership: number;
  yield: number;
  value: number;
  growth: number;
  image?: string;
  priceFraction: number;
  roi: number;
  isSoldOut?: boolean;
  unitsOwned?: number;
  totalUnits?: number;
};

// function generateSparkline(basePrice: number, points = 12) {
//   const data = [];
//   let price = basePrice * 0.88;
//   for (let i = 0; i < points; i++) {
//     price = price + (Math.random() - 0.42) * (basePrice * 0.025);
//     data.push({ v: Math.max(price, basePrice * 0.7) });
//   }
//   data.push({ v: basePrice });
//   return data;
// }

export default function HoldingCard({ holding }: { holding: Holding }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Reused both at the standalone /dashboard/holdings route and embedded
  // (inside the sidebar shell) at /dashboard/my-holdings — deep-link into
  // whichever base path we were reached through.
  const holdingsBasePath = pathname.startsWith('/dashboard/my-holdings')
    ? '/dashboard/my-holdings'
    : '/dashboard/holdings';
  const investment = Number(holding.investment) || 0;
  const value = Number(holding.value) || investment;
  const pnl = value - investment;
  const pnlPct =
    investment > 0 ? ((pnl / investment) * 100).toFixed(2) : '0.00';
  const isPositive = pnl >= 0;
  // const sparkData = generateSparkline(holding.priceFraction || 500);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(79, 70, 229,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`${holdingsBasePath}/${holding.id}`)}
      className="cursor-pointer bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-2xl px-5 py-5 flex flex-col gap-4 relative overflow-hidden group"
    >
      {/* shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

      {holding.isSoldOut && (
        <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none overflow-hidden">
          <div className="absolute top-4 right-[-34px] rotate-45 bg-green/20 border-y border-green/30 text-green text-[9px] font-bold uppercase tracking-widest py-1 px-12">
            Funded
          </div>
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-[#0B2545] dark:text-white line-clamp-1 leading-tight">
            {holding.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-gray-500 dark:text-gray-400 text-xs">
            <CiLocationOn className="shrink-0" />
            <span className="truncate">{holding.location}</span>
          </div>
        </div>

        {/* Sparkline */}
        {/* <div className="w-24 h-10 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient
                  id={`sg-${holding.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={isPositive ? '#22c55e' : '#ef4444'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? '#22c55e' : '#ef4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={1.5}
                fill={`url(#sg-${holding.id})`}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip contentStyle={{ display: 'none' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E3E7EE] dark:border-white/10 bg-[#F5F8FF] dark:bg-white/5 text-[#0B2545] dark:text-white text-xs font-medium">
          {holding.type?.toLowerCase().includes('res') ? (
            <FaHome className="text-[9px]" />
          ) : holding.type?.toLowerCase().includes('ind') ? (
            <FaIndustry className="text-[9px]" />
          ) : holding.type?.toLowerCase().includes('plot') ? (
            <FaTree className="text-[9px]" />
          ) : (
            <FaBuilding className="text-[9px]" />
          )}
          {holding.type}
        </span>
        {holding.verified && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-green/30 bg-green/10 text-green text-xs font-semibold">
            <div className="relative">
              <FiShield className="text-[9px]" />
              <FiCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[4px]" />
            </div>
            Verified
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-xl p-3 border border-[#E3E7EE] dark:border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
            Current Value
          </p>
          <p className="text-sm font-semibold text-[#0B2545] dark:text-white">
            ₹ {value.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-xl p-3 border border-[#E3E7EE] dark:border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
            Invested
          </p>
          <p className="text-sm font-semibold text-[#0B2545] dark:text-white">
            ₹ {investment.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-xl p-3 border border-[#E3E7EE] dark:border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
            P&L
          </p>
          <p
            className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-green' : 'text-red-500'}`}
          >
            {isPositive ? (
              <FaArrowUp className="text-[9px]" />
            ) : (
              <FaArrowDown className="text-[9px]" />
            )}
            {isPositive ? '+' : ''}₹ {Math.abs(pnl).toLocaleString()}
            <span className="text-[10px] font-medium">({pnlPct}%)</span>
          </p>
        </div>
        <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-xl p-3 border border-[#E3E7EE] dark:border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
            Yield P.A.
          </p>
          <p className="text-sm font-semibold text-[#0B2545] dark:text-white flex items-center gap-1">
            <MdTrendingUp className="text-green" />
            {Number(holding.yield).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#E3E7EE] dark:border-white/10">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-[#0B2545] dark:text-white">
            {Number(holding.ownership).toFixed(2)}%
          </span>{' '}
          Ownership
          {holding.priceFraction > 0 && (
            <span className="ml-3">
              <span className="font-medium text-[#0B2545] dark:text-white">
                ₹ {Number(holding.priceFraction).toLocaleString()}
              </span>
              /unit
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-[#60A5FA]">
          <FaChartLine className="text-[10px]" />
          View Details
        </div>
      </div>
    </motion.div>
  );
}
