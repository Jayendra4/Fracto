import { useOnboarding } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { LuFilter } from 'react-icons/lu';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useBrokerLeads } from '@/api/brokerLeads.api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useDebounce } from '@/hooks/useDebounce';
import KycGate from '@/components/KycGate';
import Loader from '@/components/Loader';
import NoData from '@/components/Dashboard/NoData';
import { FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FILTER_OPTIONS = [
  { label: 'Investor', value: 'InvestorSignup' },
  { label: 'Asset Owner', value: 'AssetOwnerSignup' },
] as const;

const statusStyles: Record<string, string> = {
  'KYC In Progress': 'bg-orange-500/12 text-orange-400 border-orange-400/60',
  Ready: 'bg-green-500/12 text-green-400 border-green-400/60',
  Blocked: 'bg-red-500/12 text-red-400 border-red-400/60',
  Completed: 'bg-blue-500/12 text-blue-400 border-blue-400/60',
};

const documentStyles: Record<string, string> = {
  Partial: 'text-[#E56B00]',
  Completed: 'text-green',
  Rejected: 'text-red',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Leads() {
  const brokerId = useSelector((state: RootState) => state.authLogin.user?.id);

  const TAKE = 10;
  const [page, setPage] = useState(0);
  const [type, setType] = useState<'InvestorSignup' | 'AssetOwnerSignup'>(
    FILTER_OPTIONS[0].value
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: leadsRes, isLoading } = useBrokerLeads({
    skip: page * TAKE,
    take: TAKE,
    type,
    brokerId,
    search: debouncedSearch || undefined,
  });

  const leadsPayload = leadsRes?.success === true ? leadsRes.data : null;

  const leads = leadsPayload?.data ?? [];
  const total = leadsPayload?.count ?? 0;

  useOnboarding();

  const navigate = useNavigate();

  const handleFilterChange = (value: 'InvestorSignup' | 'AssetOwnerSignup') => {
    setType(value);
    setPage(0);
    setFilterOpen(false);
  };

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="w-full text-[var(--fg)] font-work pt-36 xl:pt-40 pb-20 bg-[var(--bg)] min-h-screen transition-all duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="px-4 md:px-10 w-full">
          <div className="max-w-[1600px] mx-auto space-y-4 w-full py-5">
            <KycGate message="Lead management is available only after KYC approval.">
              <div className="rounded-2xl bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm transition-all duration-300 p-8">
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8 border-b border-[var(--fg)]/20 pb-6"
                >
                  <div>
                    <h1 className="font-32">Lead Management</h1>
                    <p className="font-14 text-[var(--fg)]/60 mt-1">
                      Track and manage your Investor leads with compliance
                      clarity
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-[360px]">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg)]/40" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by Investor Name or Property Name"
                        className="w-full bg-[var(--bg)] border border-dark-grey/20 rounded-lg shadow-sm hover:border-dark-grey/40 transition-colors pl-10 pr-4 py-2 text-sm placeholder:text-[var(--fg)]/40 focus:outline-none focus:border-[#73B7FF]/50"
                      />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setFilterOpen((p) => !p)}
                        className="flex items-center justify-center gap-2 bg-[var(--card)] border border-dark-grey/20 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 px-4 py-2 text-sm"
                      >
                        <LuFilter />
                        <span>
                          {FILTER_OPTIONS.find((f) => f.value === type)
                            ?.label ?? 'Filter'}
                        </span>
                        <FiChevronDown className="text-[var(--fg)]/60" />
                      </button>

                      {filterOpen && (
                        <div className="absolute right-0 mt-2 w-56 z-20 rounded-lg border border-dark-grey/20 bg-[var(--card)] shadow-lg overflow-hidden">
                          {FILTER_OPTIONS.map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() => handleFilterChange(opt.value)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--fg)]/10 ${
                                opt.value === type ? 'text-[#73B7FF]' : ''
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  {!isLoading && leads.length === 0 && (
                    <NoData
                      title="No Leads Found"
                      description="Try changing filters or search keywords. New leads will appear here once someone signs up using your referral."
                      icon={<FiUsers size={32} />}
                    />
                  )}
                  {leads.length > 0 && (
                    <div className="w-full overflow-x-auto hide-scrollbar -mx-4 sm:-mx-0 pb-2 scrollbar-thin scrollbar-thumb-[var(--fg)]/20 scrollbar-track-transparent">
                      <table className="min-w-[900px] w-full font-16 text-[var(--fg)]">
                        <thead className="text-[var(--fg)]/70 border-b border-[var(--fg)]/10">
                          <tr>
                            <th className="text-left py-5 font-medium">
                              {type === 'InvestorSignup'
                                ? 'Investor Name'
                                : 'Asset Owner Name'}
                            </th>
                            {type === 'InvestorSignup' ? (
                              <>
                                <th className="text-left py-5 font-medium">
                                  Usage Count
                                </th>
                                <th className="text-left py-5 font-medium">
                                  Reward Limit
                                </th>
                              </>
                            ) : (
                              <>
                                <th className="text-left py-5 font-medium">
                                  Referred Property
                                </th>
                              </>
                            )}

                            <th className="text-left py-5 font-medium">
                              Lead Status
                            </th>
                            <th className="text-left py-5 font-medium">
                              Documents
                            </th>
                            <th className="text-left py-5 font-medium">
                              Last Action
                            </th>
                            <th className="text-center py-5 font-medium">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {leads.map((lead: any) => {
                            const kycStatus = lead.user.kycStatus;
                            const isKycPending = kycStatus !== 'Approved';

                            let status =
                              kycStatus === 'Approved'
                                ? 'Ready'
                                : kycStatus === 'Rejected'
                                  ? 'Blocked'
                                  : 'KYC In Progress';

                            if (lead.isCompleted) {
                              status = 'Completed';
                            }

                            const documents =
                              kycStatus === 'Approved'
                                ? 'Completed'
                                : kycStatus === 'Rejected'
                                  ? 'Rejected'
                                  : 'Partial';

                            return (
                              <tr
                                key={lead.id}
                                className={`border-b border-[var(--fg)]/5 hover:bg-[var(--fg)]/[0.03] ${
                                  lead.isCompleted ? 'opacity-60' : ''
                                }`}
                              >
                                <td className="py-5">
                                  <div className="font-semibold">
                                    {lead.user.name}
                                  </div>
                                  <div className="font-14 text-[var(--fg)]/70">
                                    {lead.user.email}
                                  </div>
                                </td>

                                {type === 'InvestorSignup' ? (
                                  <>
                                    <td className="py-5">{lead.usageCount}</td>
                                    <td className="py-5">{lead.rewardLimit}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-5">
                                      {
                                        lead?.referredPropertyInvited
                                          ?.propertyDetails?.assetTitle
                                      }
                                    </td>
                                  </>
                                )}

                                <td className="py-5">
                                  <span
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-xs ${statusStyles[status]}`}
                                  >
                                    <span className="w-2 h-2 rounded-full bg-current" />
                                    {status}
                                  </span>
                                </td>

                                <td
                                  className={`py-5 ${documentStyles[documents]}`}
                                >
                                  {documents}
                                </td>

                                <td className="py-5 text-[var(--fg)]/70">
                                  {new Date(
                                    lead.updatedAt
                                  ).toLocaleDateString()}
                                </td>

                                <td className="py-5 text-right">
                                  <button
                                    onClick={() =>
                                      navigate(String(lead.user.id), {
                                        state: {
                                          id: lead.id,
                                          referredUserId: lead.user.id,
                                        },
                                      })
                                    }
                                    disabled={isKycPending}
                                    className={`group flex gap-1.5 items-center justify-end w-full ${
                                      isKycPending
                                        ? 'text-[var(--fg)]/40 cursor-not-allowed'
                                        : 'text-[#73B7FF] hover:text-[var(--fg)]'
                                    }`}
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
                  )}
                  <div className="flex items-center justify-center gap-6 mt-8">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ‹ Previous
                    </button>

                    <span>
                      Page {page + 1} of {Math.ceil(total / TAKE)}
                    </span>

                    <button
                      disabled={(page + 1) * TAKE >= total}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next ›
                    </button>
                  </div>
                </motion.div>
              </div>
            </KycGate>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
