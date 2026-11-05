import { CiLocationOn } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import Stat from './stat';
import { FiShield, FiCheck } from 'react-icons/fi';
import {
  FaBuilding,
  FaHome,
  FaIndustry,
  FaTree,
  FaAngleRight,
  FaArrowRight,
  FaChartLine,
} from 'react-icons/fa';

type Asset = {
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
  savedyield: number;
  isSoldOut?: boolean;
};
export default function AssetCard({ asset }: { asset: Asset }) {
  const navigate = useNavigate();

  const getAmount = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val) || 0;
    if (typeof val === 'object' && val !== null) {
      return val.amount || val.value || 0;
    }
    return 0;
  };

  const ownership = getAmount(asset.ownership);
  const isFullyOwned = ownership >= 100;
  const disableBuyMore = asset.isSoldOut || isFullyOwned;
  const investment = getAmount(asset.investment);
  const value = getAmount(asset.value);
  const yieldVal = getAmount(asset.yield);
  const growth = getAmount(asset.growth);

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-4 rounded-xl w-full shadow-sm hover:shadow-md transition-all duration-300 bg-[var(--inner-card)] border border-[var(--fg)]/5 text-[var(--fg)] px-4 py-4 lg:py-6 lg:px-6 md:gap-12 lg:gap-4 xl:gap-20 mb-6 relative overflow-hidden`}
    >
      {asset.isSoldOut && (
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none overflow-hidden z-10">
          <div className="absolute top-5 right-[-38px] rotate-45 bg-green/20 border-y border-green/30 text-green text-[10px] font-bold uppercase tracking-widest py-1.5 px-14 backdrop-blur-md shadow-sm">
            Funded
          </div>
        </div>
      )}
      <div className=" md:col-span-3 space-y-3 md:space-y-7 w-full">
        <div className="flex flex-1 items-center justify-between w-full srink-0">
          <div className="flex items-center gap-2 ">
            <h3 className="font-24 font-medium line-clamp-1">{asset.title}</h3>

            {asset.isSoldOut && (
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green/10 text-green border border-green/20 shadow-sm font-semibold whitespace-nowrap">
                <FiShield className="text-[10px]" />
                Fully Funded
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-2 text-green font-20 font-medium pr-2">
            <img
              src="/images/dashboard/stats.svg"
              alt="stats"
              className="w-6 md:w-8 h-auto"
            />
            {growth}%
          </div>
        </div>

        <div className="md:hidden">
          <span className="flex items-center gap-1 text-[var(--fg)] font-12 md:hidden">
            <CiLocationOn />
            {asset?.location}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full animate-in fade-in slide-in-from-left-4 duration-500">
          <span className="group/badge flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--fg)]/10 bg-[var(--fg)]/[0.03] text-[var(--fg)]/70 hover:text-[var(--fg)] hover:border-[var(--fg)]/20 hover:bg-[var(--fg)]/5 transition-all duration-300 text-xs md:text-sm font-medium leading-none whitespace-nowrap shadow-sm">
            {asset.type?.toLowerCase().includes('res') ? (
              <FaHome className="text-[10px] md:text-xs opacity-60 group-hover/badge:opacity-100 transition-opacity" />
            ) : asset.type?.toLowerCase().includes('ind') ? (
              <FaIndustry className="text-[10px] md:text-xs opacity-60 group-hover/badge:opacity-100 transition-opacity" />
            ) : asset.type?.toLowerCase().includes('plot') ? (
              <FaTree className="text-[10px] md:text-xs opacity-60 group-hover/badge:opacity-100 transition-opacity" />
            ) : (
              <FaBuilding className="text-[10px] md:text-xs opacity-60 group-hover/badge:opacity-100 transition-opacity" />
            )}
            {asset.type}
          </span>
          {asset.verified && (
            <span className="group/verified flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-green/30 bg-green/10 text-green hover:bg-green/15 hover:border-green/40 transition-all duration-300 text-xs md:text-sm font-semibold leading-none whitespace-nowrap shadow-sm">
              <div className="relative">
                <FiShield className="text-[10px] md:text-xs" />
                <FiCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[5px] md:text-[6px] font-bold" />
              </div>
              Verified
            </span>
          )}

          <span className="md:flex items-center gap-2 text-[var(--fg)]/60 font-medium text-sm hidden whitespace-nowrap ml-auto group/loc hover:text-[var(--fg)] transition-colors">
            <CiLocationOn className="text-lg group-hover/loc:text-[#4F46E5] transition-colors" />
            {asset?.location}
          </span>
        </div>
        <div className="flex w-full justify-between">
          <Stat
            label="Your Investment"
            value={`₹ ${investment.toLocaleString()}`}
          />
          <Stat label="Ownership" value={`${ownership}%`} />
          <Stat label="Current Yield" value={`${yieldVal}%`} />
          <Stat label="Asset Values" value={`₹ ${value.toLocaleString()}`} />
        </div>
      </div>
      <div className="flex flex-col justify-between font-16 w-full h-full gap-4">
        <div className="flex md:flex-col flex-row justify-between gap-4 py-2 lg:pb-0 lg:py-0">
          {!isFullyOwned && (
            <div className="relative group w-full flex">
              <button
                disabled={disableBuyMore}
                onClick={() =>
                  !disableBuyMore &&
                  navigate('/buy-fraction', { state: { assetId: asset.id } })
                }
                className={`w-full h-11 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative group/btn ${
                  disableBuyMore
                    ? 'bg-[var(--fg)]/[0.03] text-[var(--fg)]/20 cursor-not-allowed border border-[var(--fg)]/10'
                    : 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer'
                }`}
              >
                {!disableBuyMore && (
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Buy More{' '}
                  <FaAngleRight className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                </span>
              </button>

              {disableBuyMore && (
                <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition shadow-xl z-20">
                  {asset.isSoldOut
                    ? 'Fully Funded - No more Structural Co-ownership available'
                    : 'You already own 100% of this asset'}
                </div>
              )}
            </div>
          )}

          <button className="w-full h-11 rounded-xl font-semibold text-sm border border-[#4F46E5]/30 bg-gradient-to-br from-[#4F46E5]/10 to-transparent text-[#58A9FF] hover:border-[#4F46E5] hover:bg-[#4F46E5]/20 hover:shadow-[0_0_20px_rgba(79, 70, 229,0.2)] transition-all duration-300 flex items-center justify-center gap-2 group/sell cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/sell:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              Sell{' '}
              <FaArrowRight className="group-hover/sell:translate-x-1 group-hover/sell:-translate-y-1 transition-transform duration-300 rotate-[-45deg]" />
            </span>
          </button>
        </div>

        <button
          onClick={() => navigate(`/property-details/${asset.id}`)}
          className="w-full h-11 rounded-xl font-semibold text-sm border border-[var(--fg)]/10 bg-[var(--fg)]/[0.02] text-[var(--fg)] hover:bg-[var(--fg)]/[0.05] hover:border-[var(--fg)]/20 transition-all duration-300 flex items-center justify-center gap-2 group/details cursor-pointer overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--fg)]/[0.05] to-transparent translate-x-[-100%] group-hover/details:translate-x-[100%] transition-transform duration-1000" />
          <span className="relative z-10 flex items-center gap-2">
            View Details{' '}
            <FaChartLine className="group-hover/details:scale-110 transition-transform duration-300" />
          </span>
        </button>
      </div>
    </div>
  );
}
