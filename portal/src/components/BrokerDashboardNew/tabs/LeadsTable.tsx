/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch, FiUsers } from 'react-icons/fi';
// import { MdKeyboardArrowRight } from 'react-icons/md';
import { motion } from 'framer-motion';

import { useBrokerLeads } from '@/api/brokerLeads.api';
import type { RootState } from '@/redux/store';
import { useDebounce } from '@/hooks/useDebounce';
import { useOnboarding } from '@/hooks';
import KycGate from '@/components/KycGate';
import Loader from '@/components/Loader';
import NoData from '@/components/Dashboard/NoData';

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

interface LeadsTableProps {
  type: 'InvestorSignup' | 'AssetOwnerSignup';
}

export default function LeadsTable({ type }: LeadsTableProps) {
  const brokerId = useSelector((state: RootState) => state.authLogin.user?.id);

  const TAKE = 10;
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Reset page when tab type or search changes
  useEffect(() => {
    setPage(0);
  }, [type, debouncedSearch]);

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
  // const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <KycGate message="Lead management is available only after KYC approval.">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full mt-6 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm transition-all duration-300 p-8 rounded-2xl text-[#0B2545] dark:text-white"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8 border-b border-[#E3E7EE] dark:border-white/10 pb-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-[#0B2545] dark:text-white">
              {type === 'InvestorSignup'
                ? 'Investor Leads'
                : 'Asset Owner Leads'}
            </h2>
            <p className="font-14 text-gray-500 dark:text-gray-400 mt-1">
              Track and manage your{' '}
              {type === 'InvestorSignup' ? 'Investor' : 'Asset Owner'} leads
              with compliance clarity
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-[360px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  type === 'InvestorSignup'
                    ? 'Search by Investor Name or Property Name'
                    : 'Search by Asset Owner Name or Property Name'
                }
                className="w-full bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 rounded-lg shadow-sm hover:border-[#1F4FE0]/40 transition-colors pl-10 pr-4 py-2 text-sm text-[#0B2545] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {leads.length === 0 && (
            <NoData
              title="No Leads Found"
              description="Try changing filters or search keywords. New leads will appear here once someone signs up using your referral."
              icon={<FiUsers size={32} />}
            />
          )}
          {leads.length > 0 && (
            <div className="w-full overflow-x-auto hide-scrollbar -mx-4 sm:-mx-0 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/20 scrollbar-track-transparent">
              <table className="min-w-[900px] w-full font-16 text-[#0B2545] dark:text-white">
                <thead className="text-gray-500 dark:text-gray-400 border-b border-[#E3E7EE] dark:border-white/10">
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

                    <th className="text-left py-5 font-medium">Lead Status</th>
                    <th className="text-left py-5 font-medium">Documents</th>
                    <th className="text-left py-5 font-medium">Last Action</th>
                    {/* <th className="text-center py-5 font-medium">
                      Action
                    </th> */}
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead: any) => {
                    const kycStatus = lead.user.kycStatus;
                    // const isKycPending = kycStatus !== 'Approved';

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
                        className={`border-b border-[#E3E7EE] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 ${
                          lead.isCompleted ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="py-5">
                          <div className="font-semibold">{lead.user.name}</div>
                          <div className="font-14 text-gray-500 dark:text-gray-400">
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
                                lead?.referredPropertyInvited?.propertyDetails
                                  ?.assetTitle
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

                        <td className={`py-5 ${documentStyles[documents]}`}>
                          {documents}
                        </td>

                        <td className="py-5 text-gray-500 dark:text-gray-400">
                          {new Date(lead.updatedAt).toLocaleDateString()}
                        </td>

                        {/* <td className="py-5 text-right">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/leads/${lead.user.id}`, {
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
                        </td> */}
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
              className="px-3 py-1 bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white rounded disabled:opacity-50 cursor-pointer"
            >
              ‹ Previous
            </button>

            <span className="text-[#0B2545] dark:text-white">
              Page {page + 1} of {Math.ceil(total / TAKE)}
            </span>

            <button
              disabled={(page + 1) * TAKE >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white rounded disabled:opacity-50 cursor-pointer"
            >
              Next ›
            </button>
          </div>
        </motion.div>
      </motion.div>
    </KycGate>
  );
}
