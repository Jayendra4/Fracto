import { useOnboarding } from '@/hooks';
import { FiCheckCircle, FiClock, FiLock, FiChevronDown } from 'react-icons/fi';
import { GrRotateLeft } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { MdTrendingUp, MdKeyboardArrowDown } from 'react-icons/md';
import { LuFilter } from 'react-icons/lu';
import CommissionTable from './commissionTable';
import SummaryCard from './summaryCard';
import { useBrokerCommissionSummary } from '@/api/brokerCommission.api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useState } from 'react';
import { useBrokerCommissions } from '@/api/brokerCommissions.api';
import KycGate from '@/components/KycGate';
import WithdrawModal from './WithdrawModal';
import { useMyWallet } from '@/api/wallet.api';
import { motion } from 'framer-motion';
import { FaIndianRupeeSign } from 'react-icons/fa6';

const FILTER_OPTIONS = [
  { label: 'Investor', value: 'InvestorSignup' },
  { label: 'Asset Owner', value: 'AssetOwnerSignup' },
] as const;

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

export default function Commissions() {
  const [type, setType] = useState<'InvestorSignup' | 'AssetOwnerSignup'>(
    'InvestorSignup'
  );

  const [filterOpen, setFilterOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const navigate = useNavigate();
  useOnboarding();

  const brokerId = useSelector((state: RootState) => state.authLogin.user?.id);

  const TAKE = 10;
  const [page, setPage] = useState(0);

  const { data: commissionsRes, isLoading: isCommissionsLoading } =
    useBrokerCommissions({
      skip: page * TAKE,
      take: TAKE,
      brokerId,
      type,
    });

  const commissionsPayload =
    commissionsRes?.success === true ? commissionsRes.data : null;

  const commissions = commissionsPayload?.data ?? [];
  const total = commissionsPayload?.count ?? 0;

  const [timeFilter, setTimeFilter] = useState('All-time');
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);

  const TIME_FILTERS = ['Today', 'This Week', 'This Month', 'All-time'];

  const getDateParams = (filter: string) => {
    const today = new Date();
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (filter === 'Today') {
      const dateStr = formatDate(today);
      return { fromDate: dateStr, toDate: dateStr };
    }

    if (filter === 'This Week') {
      const startOfWeek = new Date(today);
      // Assuming week starts on Monday (1)
      const day = today.getDay() || 7;
      startOfWeek.setDate(today.getDate() - day + 1);
      return { fromDate: formatDate(startOfWeek), toDate: formatDate(today) };
    }

    if (filter === 'This Month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { fromDate: formatDate(startOfMonth), toDate: formatDate(today) };
    }

    return undefined; // All-time
  };

  const dateParams = getDateParams(timeFilter);

  const {
    data: commissionRes,
    isLoading,
    isFetching,
  } = useBrokerCommissionSummary(dateParams);

  const { data: walletData } = useMyWallet();

  const walletBalance = walletData?.data?.availableBalance ?? 0;

  const summary = commissionRes?.success ? commissionRes.data : null;
  const holdAmount = summary?.holdAmount ? parseFloat(summary.holdAmount) : 0;
  const pendingAmount = summary?.pendingWithdraw
    ? parseFloat(summary.pendingWithdraw)
    : 0;
  const releasedAmount = summary?.releasedAmount
    ? parseFloat(summary.releasedAmount)
    : 0;

  const availableToWithdraw = summary?.availableToWithdraw
    ? parseFloat(summary.availableToWithdraw.toString())
    : 0;

  const finalAvailable = Math.max(availableToWithdraw, releasedAmount);

  const estimatedAmount = summary?.estimatedAmount
    ? parseFloat(summary.estimatedAmount.toString())
    : 0;

  return (
    <section className="w-full text-[var(--fg)] font-work pt-36 xl:pt-40 pb-20 bg-[var(--bg)] min-h-screen transition-all duration-300">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="px-4 md:px-10 w-full">
          <div className="max-w-[1600px] mx-auto space-y-4 w-full">
            <KycGate message="Commissions are available only after KYC approval.">
              {' '}
              <div className="pt-0 md:pt-0 space-y-6 w-full">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between gap-2  flex-col sm:flex-row w-full pb-5 border-b border-dark-grey/20"
                >
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between py-4 md:pb-0">
                      <h2 className="font-36">Commissions</h2>
                      <button
                        onClick={() => navigate(0)}
                        className="flex md:hidden font-16 p-2 rounded-md bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 gap-1 justify-center items-center whitespace-nowrap cursor-pointer text-white"
                      >
                        <GrRotateLeft size={18} /> Refresh
                      </button>
                    </div>
                    <p className="font-16  sm:text-left text-[var(--fg)] text-justify">
                      Commissions are released only after All Investor + asset
                      documents are approved. This ensures compliance and
                      protects all parties involved.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(0)}
                    className="hidden md:flex font-18 px-5 py-1.5 mt-4 rounded-md bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md hover:shadow-lg hover:brightness-110 flex-row gap-2 justify-center items-center w-full sm:w-auto whitespace-nowrap cursor-pointer text-white transition-all duration-300"
                  >
                    <GrRotateLeft className="shrink-0" size={18} /> Refresh
                  </button>
                </motion.div>

                <div
                  className={`grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 transition-all duration-300 ${
                    isFetching && !isLoading
                      ? 'opacity-60 grayscale-[0.2]'
                      : 'opacity-100'
                  }`}
                >
                  <motion.div
                    variants={itemVariants}
                    className="w-full rounded-xl bg-[var(--inner-card)] shadow-sm transition-all duration-300 p-6 relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-md bg-white/11 flex items-center justify-center ">
                        <FaIndianRupeeSign size={24} />
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setTimeFilterOpen(!timeFilterOpen)}
                          className="flex items-center gap-1 text-sm text-[var(--fg)]/80 hover:text-[var(--fg)]"
                        >
                          {timeFilter}
                          <MdKeyboardArrowDown size={18} />
                        </button>
                        {timeFilterOpen && (
                          <div className="absolute right-0 mt-2 w-32 z-50 rounded-xl border border-[var(--fg)]/10 bg-[var(--inner-card)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {TIME_FILTERS.map((f) => (
                              <button
                                key={f}
                                onClick={() => {
                                  setTimeFilter(f);
                                  setTimeFilterOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs hover:bg-[var(--fg)]/10 ${
                                  f === timeFilter ? 'text-[#73B7FF]' : ''
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-end items-center-end gap-1 mt-4">
                      <div className="flex flex-row justify-between items-center">
                        <p className="text-sm ">Total Earned</p>
                        <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-green/12 px-3 py-0.5 text-xs text-green">
                          +12% this month
                          <MdTrendingUp size={18} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="font-24 font-medium mt-2">
                          ₹{availableToWithdraw.toLocaleString('en-IN')}
                        </h2>
                      </div>
                      <button
                        disabled={isLoading}
                        onClick={() => setWithdrawModalOpen(true)}
                        className="mt-4 w-full py-2 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                      >
                        Withdraw Funds
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="contents">
                    <SummaryCard
                      icon={<FaIndianRupeeSign size={24} />}
                      title="Estimated"
                      subtitle="Potential"
                      value={`₹${estimatedAmount.toLocaleString('en-IN')}`}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="contents">
                    <SummaryCard
                      icon={<FiCheckCircle size={24} />}
                      title="Released"
                      subtitle="Available"
                      value={`₹${releasedAmount.toLocaleString('en-IN')}`}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="contents">
                    <SummaryCard
                      icon={<FiClock size={24} />}
                      title="Pending"
                      subtitle="Processing"
                      value={`₹${pendingAmount.toLocaleString('en-IN')}`}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="contents">
                    <SummaryCard
                      icon={<FiLock size={24} />}
                      title="On Hold"
                      subtitle="Action Required"
                      value={`₹${holdAmount.toLocaleString('en-IN')}`}
                      danger={holdAmount > 0}
                      action={holdAmount > 0 ? 'Check' : undefined}
                    />
                  </motion.div>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="w-full rounded-xl bg-[var(--inner-card)] shadow-sm transition-all duration-300 p-4 md:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8 border-b border-[var(--fg)]/20 pb-6">
                    <div>
                      <h1 className="font-24">Commission History</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <div className="relative">
                        <button
                          onClick={() => setFilterOpen((p) => !p)}
                          className="flex items-center justify-center gap-2 bg-[var(--inner-card)] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 px-4 py-2 text-sm"
                        >
                          <LuFilter />
                          <span>
                            {FILTER_OPTIONS.find((f) => f.value === type)
                              ?.label ?? 'All'}
                          </span>
                          <FiChevronDown className="text-[var(--fg)]/60" />
                        </button>

                        {filterOpen && (
                          <div className="absolute right-0 mt-2 w-56 z-20 rounded-xl border border-[var(--fg)]/10 bg-[var(--inner-card)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {FILTER_OPTIONS.map((opt) => (
                              <button
                                key={opt.label}
                                onClick={() => {
                                  setType(opt.value);
                                  setPage(0);
                                  setFilterOpen(false);
                                }}
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
                  </div>

                  <CommissionTable
                    commissions={commissions}
                    loading={isCommissionsLoading}
                  />

                  <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ‹ Previous
                    </button>

                    <span>
                      Page {page + 1} of {Math.ceil(total / TAKE) || 1}
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

      {withdrawModalOpen && (
        <WithdrawModal
          onClose={() => setWithdrawModalOpen(false)}
          availableAmount={finalAvailable}
          walletBalance={walletBalance}
        />
      )}
    </section>
  );
}
