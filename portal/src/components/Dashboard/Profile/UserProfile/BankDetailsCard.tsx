import { useState } from 'react';
import CommonModal from '@/components/CommonModal';
import {
  FiPlus,
  FiCheckCircle,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
} from 'react-icons/fi';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  paymentOwnerId: number;
}

interface Props {
  banks: BankAccount[];
  onAddBank?: () => void;
  onSetActive?: (bankId: number, isActive: boolean) => void;
  onDelete?: (bankId: number) => void;
}

export default function BankDetailsCard({
  banks,
  onAddBank,
  onSetActive,
  onDelete,
}: Props) {
  const [showAccountId, setShowAccountId] = useState<number | null>(null);
  const [bankToDelete, setBankToDelete] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 4;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(banks.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentBanks = banks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (!banks.length) {
    return (
      <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] p-6 md:p-8 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-inner">
          <FiCreditCard className="text-blue-500 w-8 h-8 opacity-80" />
        </div>
        <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white mb-2">
          No Bank Accounts Linked
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-12 md:font-14 max-w-sm mb-6">
          Securely link your bank account to receive payouts and manage your
          transactions seamlessly.
        </p>
        {onAddBank && (
          <button
            onClick={onAddBank}
            className="flex items-center justify-center gap-2 px-5 py-2.5 font-12 font-semibold rounded-lg text-white bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            <FiPlus size={16} />
            Link Bank Account
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] p-3 md:p-6 relative">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 pb-4 border-b border-gray-150 dark:border-white/5">
        <div>
          <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white">
            Bank Details
          </h3>
          <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400 mt-1">
            Manage linked bank accounts
          </p>
        </div>

        {onAddBank && (
          <button
            onClick={onAddBank}
            className="flex items-center justify-center gap-2 font-12 px-5 py-2.5 font-semibold rounded-lg text-white bg-gradient-to-r from-[#4F46E5] to-[#2563EB] transition-all duration-300 hover:shadow-md hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/60 whitespace-nowrap"
          >
            <FiPlus size={16} />
            Add Bank
          </button>
        )}
      </div>

      <div className="space-y-3">
        {currentBanks.map((bank) => {
          const showNumber = showAccountId === bank.id;

          return (
            <div
              key={bank.id}
              className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-md
                ${
                  bank.isActive
                    ? 'border-green-500/30 bg-green-500/[0.03] hover:border-green-500/50'
                    : 'border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] hover:border-gray-300 dark:hover:border-white/20'
                }
              `}
            >
              {bank.isActive && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              )}

              <div className="flex items-start justify-between gap-3 relative">
                <div>
                  <p className="font-14 md:font-16 font-bold text-[#0B2545] dark:text-white flex items-center gap-2">
                    {bank.bankName}
                  </p>
                  <p className="font-12 text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    {bank.accountHolderName}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 font-12 font-medium text-green-500">
                    <FiCheckCircle size={14} />
                    Verified
                  </span>

                  {onDelete && (
                    <button
                      onClick={() => setBankToDelete(bank.id)}
                      className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Delete Account"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 font-12 space-y-2 relative">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/5">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400 font-medium w-24">
                      Account No:
                    </span>
                    <span className="text-[#0B2545] dark:text-white font-mono font-semibold tracking-wider">
                      {showNumber
                        ? bank.accountNumber
                        : `•••• •••• ${bank.accountNumber.slice(-4)}`}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setShowAccountId(showNumber ? null : bank.id)
                    }
                    className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    title={
                      showNumber ? 'Hide Account Number' : 'Show Account Number'
                    }
                  >
                    {showNumber ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                <div className="flex items-center gap-3 px-3 py-1">
                  <span className="text-gray-500 dark:text-gray-400 font-medium w-24">
                    IFSC Code:
                  </span>
                  <span className="text-[#0B2545] dark:text-white font-semibold tracking-wide uppercase">
                    {bank.ifscCode}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#E3E7EE] dark:border-white/10 relative">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div
                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                      bank.isActive
                        ? 'bg-green-500 shadow-lg shadow-green-500/20'
                        : 'bg-gray-300 dark:bg-white/20 shadow-inner hover:bg-gray-300 dark:hover:bg-white/30'
                    }`}
                    onClick={() => {
                      onSetActive?.(bank.id, !bank.isActive);
                    }}
                    title={bank.isActive ? 'Active Account' : 'Set as Active'}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                        bank.isActive ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span
                    className={`font-12 font-semibold uppercase tracking-wider ${bank.isActive ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {bank.isActive ? 'Primary Account' : 'Set as Primary'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CommonModal
        isOpen={!!bankToDelete}
        onClose={() => setBankToDelete(null)}
        title="Delete Bank Account"
        className="max-w-md mx-auto relative z-[9999]"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 font-12 md:font-14">
            Are you sure you want to delete this bank account? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setBankToDelete(null)}
              className="px-5 py-2.5 font-12 font-semibold text-[#0B2545] dark:text-white border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (bankToDelete && onDelete) onDelete(bankToDelete);
                setBankToDelete(null);
              }}
              className="px-5 py-2.5 font-12 font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all duration-300"
            >
              Delete Account
            </button>
          </div>
        </div>
      </CommonModal>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-5">
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
                className={`px-3 py-1 rounded-md font-12 border ${
                  page === pageNum
                    ? 'bg-[#0B2545] dark:bg-white text-[#132436]'
                    : 'text-[#0B2545] dark:text-white border-gray-300 dark:border-white/20'
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
    </div>
  );
}
