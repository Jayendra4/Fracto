/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import type { UpiAccount } from '@/api/upi.api';
import { useState } from 'react';
import CommonModal from '@/components/CommonModal';
import {
  FiPlus,
  FiCheckCircle,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSmartphone,
} from 'react-icons/fi';

interface Props {
  upis: UpiAccount[];
  onAddUpi?: () => void;
  onSetActive?: (upiId: string, isActive: boolean) => void;
  onDelete?: (upiId: string) => void;
}

export default function UpiDetailsCard({
  upis,
  onAddUpi,
  onSetActive,
  onDelete,
}: Props) {
  const [upiToDelete, setUpiToDelete] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 4;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(upis.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentUpis = upis.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (!upis.length) {
    return (
      <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] p-6 md:p-8 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-inner">
          <FiSmartphone className="text-blue-500 w-8 h-8 opacity-80" />
        </div>
        <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white mb-2">
          No UPI ID Linked
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-12 md:font-14 max-w-sm mb-6">
          Link your UPI ID for quick, seamless, and secure transactions directly
          to your account.
        </p>
        {onAddUpi && (
          <button
            onClick={onAddUpi}
            className="flex items-center justify-center gap-2 px-5 py-2.5 font-12 font-semibold rounded-lg text-white bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            <FiPlus size={16} />
            Link UPI ID
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] p-5 md:p-6 relative">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-150 dark:border-white/5">
        <div>
          <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white">
            UPI Details
          </h3>
          <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400 mt-1">
            Manage linked UPI IDs
          </p>
        </div>

        {onAddUpi && (
          <button
            onClick={onAddUpi}
            className="flex items-center justify-center gap-2 font-12 px-5 py-2.5 font-semibold rounded-lg text-white bg-gradient-to-r from-[#4F46E5] to-[#2563EB] transition-all duration-300 hover:shadow-md hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/60 whitespace-nowrap"
          >
            <FiPlus size={16} />
            Add UPI
          </button>
        )}
      </div>

      <div className="space-y-3">
        {currentUpis.map((upi, index) => (
          <div
            key={`${upi.upiId}-${index}`}
            className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-md
                ${
                  (upi as any).isActive
                    ? 'border-green-500/30 bg-green-500/[0.03] hover:border-green-500/50'
                    : 'border-[#E3E7EE] dark:border-white/10 bg-white dark:bg-[#132436] hover:border-gray-300 dark:hover:border-white/20'
                }
              `}
          >
            {(upi as any).isActive && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            )}

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/5 w-full md:w-auto overflow-hidden">
                <p className="font-14 md:font-16 font-bold text-[#0B2545] dark:text-white tracking-wide truncate max-w-xs md:max-w-md">
                  {upi.upiId}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 font-12 font-medium text-green-500 hidden sm:flex">
                  <FiCheckCircle size={14} />
                  Verified
                </span>

                {onDelete && upi.id && (
                  <button
                    onClick={() => setUpiToDelete(upi.id!.toString())}
                    className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#E3E7EE] dark:border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${
                    (upi as any).isActive
                      ? 'bg-green-500 shadow-lg shadow-green-500/20'
                      : 'bg-gray-300 dark:bg-white/20 shadow-inner hover:bg-gray-300 dark:hover:bg-white/30'
                  }`}
                  onClick={() => {
                    if (onSetActive && upi.id) {
                      onSetActive(upi.id.toString(), !(upi as any).isActive);
                    }
                  }}
                  title={
                    (upi as any).isActive ? 'Active Account' : 'Set as Active'
                  }
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      (upi as any).isActive
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <span
                  className={`font-12 font-semibold uppercase tracking-wider ${(upi as any).isActive ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {(upi as any).isActive ? 'Primary UPI' : 'Set as Primary'}
                </span>
              </div>
              <span className="flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 font-12 font-medium text-green-500">
                <FiCheckCircle size={12} />
                Verified
              </span>
            </div>
          </div>
        ))}

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
                  className={`px-3 py-1 rounded-md font-12 border
                    ${
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

      <CommonModal
        isOpen={!!upiToDelete}
        onClose={() => setUpiToDelete(null)}
        title="Delete UPI ID"
        className="max-w-md mx-auto relative z-[9999]"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 font-12 md:font-14">
            Are you sure you want to delete this UPI ID? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setUpiToDelete(null)}
              className="px-5 py-2.5 font-12 font-semibold text-[#0B2545] dark:text-white border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (upiToDelete && onDelete) onDelete(upiToDelete);
                setUpiToDelete(null);
              }}
              className="px-5 py-2.5 font-12 font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-all duration-300"
            >
              Delete UPI
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
}
