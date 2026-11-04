/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { CiShare1 } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useMyTransactions } from '@/api/transactions.api';
import { useEffect, useState } from 'react';
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

export default function TransactionHistory() {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const { data: txRes, isLoading } = useMyTransactions();
  const [page, setPage] = useState(1);

  const transactions =
    txRes?.success && Array.isArray(txRes.data?.data) ? txRes.data.data : [];

  useEffect(() => {
    if (!transactions.length) return;

    setSeenIds((prev) => {
      const next = new Set(prev);
      transactions.forEach((t: any) => next.add(t.id));
      return next;
    });
  }, [transactions]);

  const hasTransactions = transactions.length > 0;

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#132436] rounded-xl border border-[#E3E7EE] dark:border-white/10 p-10 flex justify-center">
        <span className="text-gray-500 dark:text-gray-400 font-12 md:font-14">
          Loading transactions...
        </span>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl font-work overflow-hidden"
      >
        <div className="flex justify-between flex-col sm:flex-row items-center px-6 py-5 gap-3 bg-gray-50 dark:bg-white/[0.02] border-b border-[#E3E7EE] dark:border-white/10">
          <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white tracking-tight">
            Transaction History
          </h3>
        </div>

        {hasTransactions ? (
          <>
            <AnimatePresence initial={false}>
              <div className="p-4 sm:p-4 space-y-4">
                {currentTransactions.map((tx: any) => {
                  const isCredit = tx.type === 'Credit';

                  const title =
                    tx.context === 'FractionsPurchase'
                      ? 'Asset Purchase'
                      : tx.context === 'SystemDeposit'
                        ? 'Wallet Top-up'
                        : tx.narration || 'Wallet Transaction';

                  return (
                    <motion.div
                      key={tx.id}
                      variants={rowVariants}
                      initial={!seenIds.has(tx.id) ? 'hidden' : false}
                      animate="visible"
                      exit="exit"
                      layout
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center
                      gap-5 sm:gap-0 px-5 py-5 rounded-xl border border-[#E3E7EE] dark:border-white/10
                      bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04] cursor-pointer transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div
                          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110
                        ${
                          isCredit
                            ? 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                            : 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                        }`}
                        >
                          {isCredit ? (
                            <FiPlus size={22} />
                          ) : (
                            <FiMinus size={22} />
                          )}
                        </div>

                        <div>
                          <p className="text-[#0B2545] dark:text-white font-14 md:font-16 font-semibold leading-[100%] tracking-tight">
                            {title}
                          </p>
                          <p className="font-12 mt-1.5 text-gray-400 dark:text-gray-500">
                            {new Date(tx.timestamp).toLocaleDateString(
                              'en-IN',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col justify-between items-center sm:items-end gap-2">
                        <p
                          className={`font-14 md:font-16 font-bold tracking-tight ${
                            isCredit ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {isCredit ? '+' : '-'} ₹
                          {Number(tx.amount).toLocaleString('en-IN')}
                        </p>

                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all duration-300 uppercase tracking-wider leading-none flex items-center justify-center min-w-[100px]
                          ${
                            tx.status === 'Completed' ||
                            tx.status === 'Success' ||
                            tx.status === 'Confirmed' ||
                            tx.status === 'Approved'
                              ? 'bg-green-400/10 text-green-400 border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.05)]'
                              : tx.status === 'Pending'
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.05)]'
                                : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]'
                          }`}
                        >
                          {tx.status}
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
          <div className="p-3 sm:p-4">
            <EmptyTransactions />
          </div>
        )}
      </motion.div>
    </>
  );
}

export function EmptyTransactions() {
  return (
    <div
      className="
        w-full
        min-h-[260px] sm:min-h-[320px] lg:min-h-[400px]
        flex flex-col items-center justify-center
        text-center
        px-4 sm:px-6 lg:px-10
        rounded-lg
      "
    >
      <p className="font-12 md:font-14 text-gray-400 dark:text-gray-500 mb-2">
        Nothing to show up here!
      </p>
      <p className="font-14 md:font-16 text-gray-600 dark:text-gray-300 font-medium pb-5 flex flex-row items-center gap-2">
        Start Your Investment Journey, Click Here{' '}
        <img
          src="/images/dashboard/pointer-finger.svg"
          alt="pointer"
          className="h-7"
        />
      </p>
      <Link
        to={'/primary-club'}
        className="px-5 py-2.5 bg-[#1F4FE0] hover:bg-[#153eb2] text-white font-12 md:font-14 rounded-lg font-semibold flex flex-row justify-center items-center gap-2 cursor-pointer whitespace-nowrap"
      >
        <CiShare1 size={16} />
        <span>Explore Properties</span>
      </Link>
    </div>
  );
}
