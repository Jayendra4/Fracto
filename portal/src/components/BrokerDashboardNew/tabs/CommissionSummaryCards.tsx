import { useState } from 'react';
import { useBrokerCommissionSummary } from '@/api/brokerCommission.api';
import { useMyWallet } from '@/api/wallet.api';
import { motion } from 'framer-motion';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { FiCheckCircle, FiClock, FiLock } from 'react-icons/fi';
import { MdTrendingUp, MdKeyboardArrowDown } from 'react-icons/md';

import WithdrawModal from '@/components/Dashboard/Commissions/WithdrawModal';

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

const TIME_FILTERS = ['Today', 'This Week', 'This Month', 'All-time'];

function SummaryCard({
  icon,
  title,
  subtitle,
  value,
  danger,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: string;
  danger?: boolean;
  action?: string;
}) {
  return (
    <div
      className={`rounded-xl p-5 relative transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
        danger
          ? 'border border-[#590C00] bg-[#150300]/50 shadow-sm'
          : 'bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-11 h-11 rounded-md bg-[var(--fg)]/20 flex items-center justify-center text-[var(--fg)]">
          {icon}
        </div>
        {action && (
          <button className="text-sm text-red-400 hover:underline cursor-pointer">
            {action}
          </button>
        )}
      </div>

      <div className="flex flex-row gap-1 items-center mt-4">
        <p className="text-sm text-gray-800 dark:text-white">{title}</p>
        {subtitle && <p className="text-xs text-[var(--fg)]/60">({subtitle})</p>}
      </div>
      <p className="font-24 font-medium mt-2 text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}

export default function CommissionSummaryCards() {
  const [timeFilter, setTimeFilter] = useState('All-time');
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

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
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 transition-all duration-300 ${
          isFetching && !isLoading ? 'opacity-60 grayscale-[0.2]' : 'opacity-100'
        }`}
      >
        {/* Total Earned Card */}
        <motion.div
          variants={itemVariants}
          className="w-full rounded-xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm p-6 relative flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-md bg-[var(--fg)]/20 flex items-center justify-center text-[var(--fg)]">
              <FaIndianRupeeSign size={24} />
            </div>
            <div className="relative">
              <button
                onClick={() => setTimeFilterOpen(!timeFilterOpen)}
                className="flex items-center gap-1 text-sm text-[var(--fg)]/80 hover:text-[var(--fg)] cursor-pointer"
              >
                {timeFilter}
                <MdKeyboardArrowDown size={18} />
              </button>
              {timeFilterOpen && (
                <div className="absolute right-0 mt-2 w-32 z-50 rounded-xl border border-[var(--fg)]/10 bg-white dark:bg-[#1c3147] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {TIME_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setTimeFilter(f);
                        setTimeFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-[var(--fg)]/10 text-gray-800 dark:text-white cursor-pointer ${
                        f === timeFilter ? 'text-[#1F4FE0] dark:text-[#60a5fa]' : ''
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-end gap-1 mt-4">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-gray-800 dark:text-white">Total Earned</p>
              <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-green/12 px-3 py-0.5 text-xs text-green">
                +12% this month
                <MdTrendingUp size={18} />
              </div>
            </div>
            <h2 className="font-24 font-medium mt-2 text-gray-800 dark:text-white">
              ₹{availableToWithdraw.toLocaleString('en-IN')}
            </h2>
            <button
              disabled={isLoading}
              onClick={() => setWithdrawModalOpen(true)}
              className="mt-4 w-full py-2 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 text-white text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Withdraw Funds
            </button>
          </div>
        </motion.div>

        {/* Estimated Card */}
        <motion.div variants={itemVariants} className="contents">
          <SummaryCard
            icon={<FaIndianRupeeSign size={24} />}
            title="Estimated"
            subtitle="Potential"
            value={`₹${estimatedAmount.toLocaleString('en-IN')}`}
          />
        </motion.div>

        {/* Released Card */}
        <motion.div variants={itemVariants} className="contents">
          <SummaryCard
            icon={<FiCheckCircle size={24} />}
            title="Released"
            subtitle="Available"
            value={`₹${releasedAmount.toLocaleString('en-IN')}`}
          />
        </motion.div>

        {/* Pending Card */}
        <motion.div variants={itemVariants} className="contents">
          <SummaryCard
            icon={<FiClock size={24} />}
            title="Pending"
            subtitle="Processing"
            value={`₹${pendingAmount.toLocaleString('en-IN')}`}
          />
        </motion.div>

        {/* On Hold Card */}
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
      </motion.div>

      {withdrawModalOpen && (
        <WithdrawModal
          onClose={() => setWithdrawModalOpen(false)}
          availableAmount={finalAvailable}
          walletBalance={walletBalance}
        />
      )}
    </>
  );
}
