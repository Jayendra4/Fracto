/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { usePaymentRequests } from '@/api/paymentRequest.api';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

const ITEMS_PER_PAGE = 5;

const rowVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 420,
      damping: 28,
      mass: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: {
      duration: 0.2,
    },
  },
};

export default function PendingRequests() {
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());

  const [filter, setFilter] = useState<
    'All' | 'Pending' | 'Deposit' | 'Withdraw'
  >('All');
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePaymentRequests(
    filter === 'Deposit' || filter === 'Withdraw' ? filter : undefined
  );
  const requests = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    if (!requests.length) return;

    setSeenIds((prev) => {
      const next = new Set(prev);
      requests.forEach((r: any) => next.add(r.id));
      return next;
    });
  }, [requests]);

  const filteredRequests = requests.filter((req: any) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return req.status === 'Pending';
    if (filter === 'Deposit') return req.requestType === 'Deposit';
    if (filter === 'Withdraw') return req.requestType === 'Withdraw';
    return true;
  });

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const hasRequests = filteredRequests.length > 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#132436] rounded-xl border border-[#E3E7EE] dark:border-white/10 p-10 flex justify-center">
        <span className="text-gray-500 dark:text-gray-400 font-12 md:font-14">
          Loading requests...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 text-[#0B2545] dark:text-white rounded-xl font-work h-full overflow-hidden">
      <div className="px-6 py-5 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02] border-b border-[#E3E7EE] dark:border-white/10">
        <h3 className="font-serif text-base md:text-lg font-semibold tracking-tight">
          Pending Requests
        </h3>

        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as any);
            setPage(1);
          }}
          className="bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 shadow-sm hover:shadow-md transition-all cursor-pointer text-[#0B2545] dark:text-white
            px-4 py-2 rounded-lg font-12 outline-none focus:border-blue-500/50 appearance-none min-w-[120px]"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Deposit">Deposit</option>
          <option value="Withdraw">Withdraw</option>
        </select>
      </div>

      {hasRequests ? (
        <>
          <AnimatePresence initial={false}>
            <div className="p-4 space-y-4">
              {currentRequests.map((req: any) => {
                const isPending = req.status === 'Pending';
                const isDeposit = req.requestType === 'Deposit';

                const title = isDeposit
                  ? 'Wallet Deposit'
                  : 'Wallet Withdrawal';

                const bankLabel =
                  req.methodType === 'Bank' && req.bankAccount
                    ? `${req.bankAccount.bankName} ••••${String(
                        req.bankAccount.accountNumber
                      ).slice(-4)}`
                    : 'Upi';

                return (
                  <motion.div
                    key={req.id}
                    variants={rowVariants}
                    initial={!seenIds.has(req.id) ? 'hidden' : false}
                    animate="visible"
                    exit="exit"
                    layout
                    className="flex justify-between items-center
                    px-5 py-5 rounded-xl border border-[#E3E7EE] dark:border-white/10
                    bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110
                        ${
                          isDeposit
                            ? 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                            : 'bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                        }`}
                      >
                        {isDeposit ? (
                          <FiArrowDown size={22} />
                        ) : (
                          <FiArrowUp size={22} />
                        )}
                      </div>

                      <div>
                        <p className="font-14 md:font-16 font-semibold tracking-tight text-[#0B2545] dark:text-white">
                          {title}
                        </p>

                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="font-12 text-gray-500 dark:text-gray-400">
                            {req.requestType} • {req.methodType}
                          </p>
                        </div>

                        <p className="font-12 text-gray-400 dark:text-gray-500 mt-0.5">
                          {bankLabel} •{' '}
                          {new Date(req.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <p className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white tracking-tight">
                        ₹ {Number(req.amount).toLocaleString('en-IN')}
                      </p>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 uppercase tracking-wider
                        ${
                          isPending
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.05)]'
                            : req.status === 'Approved' ||
                                req.status === 'COMPLETED' ||
                                req.status === 'SUCCESS' ||
                                req.status === 'CONFIRMED'
                              ? 'bg-green-400/10 text-green-400 border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.05)]'
                              : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pb-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-md border border-gray-300 dark:border-white/20 text-[#0B2545] dark:text-white disabled:opacity-40"
              >
                <FiChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-md font-12 border
                      ${
                        page === pageNum
                          ? 'bg-[#0B2545] dark:bg-white text-white dark:text-[#132436] border-[#0B2545] dark:border-white'
                          : 'border-gray-300 dark:border-white/20 text-[#0B2545] dark:text-white'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-md border border-gray-300 dark:border-white/20 text-[#0B2545] dark:text-white disabled:opacity-40"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 text-center font-12 md:font-14 text-gray-500 dark:text-gray-400">
          No payment requests found
        </div>
      )}
    </div>
  );
}
