import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiChevronDown, FiCheckCircle } from 'react-icons/fi';
import { LuFilter } from 'react-icons/lu';
import { TbCircleFilled } from 'react-icons/tb';
import { MdKeyboardArrowRight } from 'react-icons/md';

import { useBrokerCommissions } from '@/api/brokerCommissions.api';
import type { RootState } from '@/redux/store';
import NoData from '@/components/Dashboard/NoData';
import KycGate from '@/components/KycGate';

const FILTER_OPTIONS = [
  { label: 'Investor', value: 'InvestorSignup' },
  { label: 'Asset Owner', value: 'AssetOwnerSignup' },
] as const;

function StatusBadge({
  label,
  danger,
  success,
  warning,
}: {
  label: string;
  danger?: boolean;
  success?: boolean;
  warning?: boolean;
}) {
  const base = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';

  if (danger)
    return (
      <span
        className={`${base} flex items-center gap-1 font-14 bg-red/12 text-red border border-red`}
      >
        <TbCircleFilled className="w-2 h-2" /> {label}
      </span>
    );

  if (success)
    return (
      <span
        className={`${base} flex items-center gap-1 font-14 bg-green/12 text-green border border-green`}
      >
        <TbCircleFilled className="w-2 h-2" /> {label}
      </span>
    );

  if (warning)
    return (
      <span
        className={`${base} flex items-center gap-1 font-14 bg-[#E56B00]/12 text-[#E56B00] border border-[#E56B00]`}
      >
        <TbCircleFilled className="w-2 h-2" />
        {label}
      </span>
    );

  return null;
}

export default function CommissionHistoryTable() {
  const [type, setType] = useState<'InvestorSignup' | 'AssetOwnerSignup'>(
    'InvestorSignup'
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const brokerId = useSelector((state: RootState) => state.authLogin.user?.id);
  const navigate = useNavigate();

  const TAKE = 10;
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [type]);

  const { data: commissionsRes, isLoading } = useBrokerCommissions({
    skip: page * TAKE,
    take: TAKE,
    brokerId: brokerId!,
    type,
  });

  const commissionsPayload =
    commissionsRes?.success === true ? commissionsRes.data : null;

  const commissions = commissionsPayload?.data ?? [];
  const total = commissionsPayload?.count ?? 0;

  return (
    <KycGate message="Commissions are available only after KYC approval.">
      <div className="w-full bg-white dark:bg-[#132436] rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm transition-all duration-300 p-4 md:p-6 text-[var(--fg)] mt-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8 border-b border-[var(--fg)]/20 pb-6">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white">
              Commission Ledger History
            </h2>
            <p className="text-xs md:text-sm text-gray-550 dark:text-gray-400 mt-1">
              Track and manage your earned commissions status and history.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <button
                onClick={() => setFilterOpen((p) => !p)}
                className="flex items-center justify-center gap-2 bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-white cursor-pointer"
              >
                <LuFilter />
                <span>
                  {FILTER_OPTIONS.find((f) => f.value === type)?.label ?? 'All'}
                </span>
                <FiChevronDown className="text-[var(--fg)]/60" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-56 z-20 rounded-xl border border-[var(--fg)]/10 bg-white dark:bg-[#1c3147] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setType(opt.value);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-[var(--fg)]/10 text-gray-800 dark:text-white cursor-pointer ${
                        opt.value === type
                          ? 'text-[#1F4FE0] dark:text-[#60a5fa]'
                          : ''
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            Loading commissions...
          </div>
        ) : commissions.length === 0 ? (
          <NoData
            title="No Commission Records"
            description="Try changing filters. New commissions will appear here once someone signs up using your referral."
            icon={<FiCheckCircle size={32} />}
          />
        ) : (
          <>
            <div className="w-full overflow-x-auto hide-scrollbar -mx-4 sm:-mx-0 pb-2 scrollbar-thin scrollbar-thumb-[var(--fg)]/20 scrollbar-track-transparent">
              <table className="min-w-[900px] w-full text-xs md:text-sm text-left">
                <thead className="text-[var(--fg)]/70 border-b border-[var(--fg)]/10 text-left font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Asset</th>
                    <th className="px-4">Investor</th>
                    <th className="px-4">Amount</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Hold Reason</th>
                    <th className="px-4">Release Date</th>
                    <th className="px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                  {commissions.map((item: any) => {
                    const rowStatus = (item.status || '').toLowerCase();
                    const displayStatus =
                      rowStatus === 'paid' || rowStatus === 'confirmed'
                        ? 'Released'
                        : rowStatus === 'pending'
                          ? 'Pending'
                          : 'On Hold';

                    return (
                      <tr
                        key={item.commissionId}
                        className="hover:bg-gray-100/50 dark:hover:bg-white/5"
                      >
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {item.asset?.title || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Campaign: {item.campaignCode || 'N/A'}
                          </p>
                        </td>

                        <td className="px-4">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {item.investor?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.investor?.email || 'N/A'}
                          </p>
                        </td>

                        <td className="px-4 font-semibold text-gray-800 dark:text-white">
                          ₹
                          {Number(item.commissionAmount || 0).toLocaleString(
                            'en-IN'
                          )}
                        </td>

                        <td className="px-4">
                          <StatusBadge
                            label={displayStatus}
                            success={displayStatus === 'Released'}
                            warning={displayStatus === 'Pending'}
                            danger={displayStatus === 'On Hold'}
                          />
                        </td>

                        <td className="px-4 text-red-400">
                          {item.reason ?? '--'}
                        </td>

                        <td className="px-4 text-gray-550 dark:text-gray-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </td>

                        <td className="px-4 text-center">
                          <button
                            className="group flex gap-1.5 items-center justify-center w-full text-[#73B7FF] hover:text-[var(--fg)] cursor-pointer"
                            onClick={() => {
                              navigate(
                                `/dashboard/commissions/${item.commissionId}/status`
                              );
                            }}
                          >
                            View Details
                            <MdKeyboardArrowRight className="group-hover:translate-x-1 transition" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-xs md:text-sm">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-[var(--card)] border border-dark-grey/20 rounded disabled:opacity-50 cursor-pointer text-[var(--fg)]"
              >
                ‹ Previous
              </button>

              <span>
                Page {page + 1} of {Math.ceil(total / TAKE) || 1}
              </span>

              <button
                disabled={(page + 1) * TAKE >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-[var(--card)] border border-dark-grey/20 rounded disabled:opacity-50 cursor-pointer text-[var(--fg)]"
              >
                Next ›
              </button>
            </div>
          </>
        )}
      </div>
    </KycGate>
  );
}
