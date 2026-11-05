import React from 'react';
import {
  FaBuilding,
  FaUser,
  FaShieldAlt,
  FaChartLine,
  FaHome,
  FaIndustry,
  FaTree,
} from 'react-icons/fa';
import { FiShield, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

type AssetCardProps = {
  id: number;
  assetName: string;
  category: string;
  location: string;
  yieldPercent: number;
  roiPercent: number;
  pricePerFraction: number;
  originalListingPrice: number;
  verified?: boolean;
  funded?: boolean;
  status?: string;
  // Expanded data
  currentOwnerName?: string;
  ownershipModel?: string;
  marketValue?: number;
  netOperationalIncome?: number;
  totalFractions?: number;
  soldFractions?: number;
  remainingFractions?: number;
  appreciation?: number;
};

const OnboardedCard: React.FC<AssetCardProps> = ({
  id,
  assetName,
  category,
  location,
  yieldPercent,
  roiPercent,
  pricePerFraction,
  originalListingPrice,
  verified = true,
  status = 'Available',
  currentOwnerName,
  ownershipModel,
  marketValue,
  netOperationalIncome,
  totalFractions,
  soldFractions,
  remainingFractions,
}) => {
  return (
    <div className="w-full rounded-2xl border border-[var(--fg)]/10 bg-[var(--inner-card)] overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--fg)]/20 transition-all duration-300 group flex flex-col">
      {/* Header Section */}
      <div className="p-6 border-b border-[var(--fg)]/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4F46E5]/20 to-[#2563EB]/20 flex items-center justify-center text-[#4F46E5] group-hover:scale-105 transition-transform">
              <FaBuilding size={28} />
            </div>
            <div className="pr-4">
              <h2 className="text-xl font-semibold text-[var(--fg)] group-hover:text-[#4F46E5] transition-colors leading-tight line-clamp-1">
                {assetName}
              </h2>
              <p className="text-sm font-medium text-[var(--fg)]/40 flex flex-wrap items-center gap-2 mt-1.5">
                <span className="group/badge flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[var(--fg)]/10 bg-[var(--fg)]/[0.03] text-[var(--fg)]/60 text-[10px] font-bold uppercase tracking-wider transition-all duration-300">
                  {category?.toLowerCase().includes('res') ? (
                    <FaHome size={8} className="opacity-70" />
                  ) : category?.toLowerCase().includes('ind') ? (
                    <FaIndustry size={8} className="opacity-70" />
                  ) : category?.toLowerCase().includes('plot') ? (
                    <FaTree size={8} className="opacity-70" />
                  ) : (
                    <FaBuilding size={8} className="opacity-70" />
                  )}
                  {category}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--fg)]/20" />
                <span className="text-xs">{location}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {verified && (
              <div className="group/verified flex items-center gap-1.5 px-3 py-1 rounded-full border border-green/30 bg-green/10 text-green text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300">
                <div className="relative">
                  <FiShield size={10} />
                  <FiCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[4px] font-bold" />
                </div>
                Verified
              </div>
            )}
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 ${
                status === 'Funded'
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-[var(--fg)]/[0.02] p-3 rounded-xl border border-[var(--fg)]/5">
            <div className="text-[var(--fg)]/30">
              <FaUser size={14} />
            </div>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-widest text-[var(--fg)]/30">
                Owner
              </p>
              <p className="text-xs font-semibold text-[var(--fg)] truncate max-w-[100px]">
                {currentOwnerName || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[var(--fg)]/[0.02] p-3 rounded-xl border border-[var(--fg)]/5">
            <div className="text-[var(--fg)]/30">
              <FaShieldAlt size={14} />
            </div>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-widest text-[var(--fg)]/30">
                Model
              </p>
              <p className="text-xs font-semibold text-[var(--fg)]">
                {ownershipModel || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid  grid-cols-1 gap-2">
          <div className="bg-gradient-to-br from-[#4F46E5]/5 to-transparent p-3 rounded-2xl border border-[#4F46E5]/10">
            <p className="text-[9px] font-medium uppercase tracking-widest text-[var(--fg)]/40 mb-1">
              Market Val
            </p>
            <p className="text-sm font-bold text-[#4F46E5]">
              ₹ {(marketValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500/5 to-transparent p-3 rounded-2xl border border-green-500/10">
            <p className="text-[9px] font-medium uppercase tracking-widest text-[var(--fg)]/40 mb-1">
              NOI (PA)
            </p>
            <p className="text-sm font-bold text-green-500">
              ₹ {(netOperationalIncome || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/5 to-transparent p-3 rounded-2xl border border-blue-500/10">
            <p className="text-[9px] font-medium uppercase tracking-widest text-[var(--fg)]/40 mb-1">
              ROI (5Y)
            </p>
            <p className="text-sm font-bold text-blue-500">
              {roiPercent || 0}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-[var(--fg)]/[0.02] p-3 rounded-xl border border-[var(--fg)]/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--fg)]/30">
                Yield (PA)
              </span>
              <span className="text-sm font-bold text-[var(--fg)]">
                {yieldPercent}%
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--fg)]/5 pt-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--fg)]/30">
                Listing
              </span>
              <span className="text-xs font-bold text-[var(--fg)]">
                ₹ {originalListingPrice.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="bg-[var(--fg)]/[0.02] p-3 rounded-xl border border-[var(--fg)]/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--fg)]/30">
                Total Frac.
              </span>
              <span className="text-sm font-bold text-[var(--fg)]">
                {(totalFractions || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--fg)]/5 pt-2 text-[#4F46E5]">
              <span className="text-[10px] font-medium uppercase tracking-widest opacity-40">
                Remaining
              </span>
              <span className="text-sm font-bold">
                {(remainingFractions || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="flex items-center justify-between mb-4 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-widest text-[var(--fg)]/30">
              Price / Structural Co-ownership
            </p>
            <p className="text-base font-bold text-[var(--fg)]">
              ₹ {pricePerFraction.toLocaleString()}
            </p>
          </div>
          <div className="h-8 w-px bg-[var(--fg)]/10 mx-2" />
          <div className="text-right">
            <p className="text-[9px] font-medium uppercase tracking-widest text-[var(--fg)]/30">
              Sold
            </p>
            <p className="text-base font-bold text-green-500">
              {soldFractions || 0}
            </p>
          </div>
        </div>

        <Link to={`/dashboard/PropertyFractionDetails/${id}`}>
          <div className="w-full flex items-center justify-center gap-2 group/btn rounded-xl py-3.5 font-semibold text-sm bg-gradient-to-r from-[#4F46E5] to-[#2563EB] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 text-white cursor-pointer overflow-hidden relative">
            <span className="relative z-10 flex items-center gap-2">
              View Insights & History <FaChartLine />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default OnboardedCard;
