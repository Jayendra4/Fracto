import { useEffect, useRef, useState, type JSX } from 'react';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import {
  useDueDiligenceDocuments,
  type DueDiligenceStatusFilter,
} from '@/api/dueDiligenceDocuments.api';

const TableFilterSelect = <T extends string>({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (val: T) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative w-full sm:w-44" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-2 border rounded-lg font-12 md:font-14 flex items-center justify-between transition cursor-pointer
          border-gray-300 dark:border-white/10 text-gray-800 dark:text-white
          ${
            open
              ? 'bg-white dark:bg-[#132436] border-[#1F4FE0]'
              : 'bg-gray-50 dark:bg-white/5 hover:border-[#1F4FE0]/50'
          }
        `}
      >
        <span className="truncate font-medium">
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown
          className={`text-gray-500 dark:text-gray-300 transition-transform shrink-0 ml-1 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-[999] w-full min-w-[170px] mt-1 bg-white dark:bg-[#132436] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
          <ul className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-100 dark:divide-white/5">
            {options.map((o) => (
              <li
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`px-4 py-2 text-xs md:text-sm text-start cursor-pointer transition
                  ${
                    value === o.value
                      ? 'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/40 dark:text-blue-300 font-semibold'
                      : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                  }
                `}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

type StatusFilterValue = 'All' | DueDiligenceStatusFilter;

const STATUS_OPTIONS: { label: string; value: StatusFilterValue }[] = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Approved', value: 'DueDiligence' },
  { label: 'Rejected', value: 'DueDiligenceRejected' },
];

// Turns messy backend document-type strings ("registeredValuationReport",
// "ELECTRICITY_BILL") into a readable label.
function formatDocLabel(value: string): string {
  const spaced = value
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

const TAKE = 10;

export default function DocumentsTab(): JSX.Element {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the search box so we don't refetch on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const skip = (page - 1) * TAKE;
  const { data, isLoading } = useDueDiligenceDocuments(
    skip,
    TAKE,
    search || undefined,
    statusFilter === 'All' ? undefined : statusFilter
  );

  const assets = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / TAKE));

  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Documents &amp; Compliance
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Per-asset document checklist and due diligence review status.
        </p>
      </div>

      {/* Search documents */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
        <input
          type="text"
          placeholder="Search by asset name…"
          value={searchInput}
          className="flex-grow px-4 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 md:font-14 bg-transparent outline-none focus:border-[#1F4FE0]/50 text-gray-800 dark:text-white"
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <TableFilterSelect
          value={statusFilter}
          placeholder="All Statuses"
          options={STATUS_OPTIONS}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        />
      </div>

      {/* Documents */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm text-center text-gray-400 font-12 md:font-14">
          Loading…
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm text-center text-gray-400 font-12 md:font-14">
          No documents found.
        </div>
      ) : (
        assets.map((asset) => {
          const isApproved = asset.status === 'DueDiligence';
          const isRejected = asset.status === 'DueDiligenceRejected';
          return (
            <div
              key={asset.assetId}
              className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-white/5 pb-2">
                <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white">
                  {asset.assetName}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">
                    Reviewed{' '}
                    {new Date(asset.reviewedAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isApproved
                        ? 'bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400'
                        : isRejected
                          ? 'bg-[#FBE3E0] text-[#C0392B] dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                    }`}
                  >
                    {isApproved
                      ? 'Approved'
                      : isRejected
                        ? 'Rejected'
                        : asset.status}
                  </span>
                </div>
              </div>

              {isRejected && asset.rejectionReason && (
                <p className="text-[12px] text-[#C0392B] dark:text-red-400 bg-[#FBE3E0]/40 dark:bg-red-900/10 rounded-lg px-3 py-2">
                  {asset.rejectionReason.trim()}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {asset.documents
                  .filter(
                    (doc) =>
                      doc.documentType !== 'ASSET_IMAGE' &&
                      doc.documentType !== 'ASSET_VIDEO'
                  )
                  .map((doc) => (
                    <a
                      key={doc.documentId}
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#1F4FE0]/50 hover:text-[#1F4FE0] dark:hover:text-[#60a5fa] transition"
                    >
                      {formatDocLabel(doc.documentType || doc.documentName)}
                    </a>
                  ))}
              </div>
            </div>
          );
        })
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-md border border-[#E3E7EE] dark:border-white/10 text-gray-700 dark:text-white disabled:opacity-40"
          >
            <FiChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1 rounded-md text-sm border ${
                  page === pageNum
                    ? 'bg-[#1F4FE0] text-white border-[#1F4FE0]'
                    : 'border-[#E3E7EE] dark:border-white/10 text-gray-700 dark:text-white'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-md border border-[#E3E7EE] dark:border-white/10 text-gray-700 dark:text-white disabled:opacity-40"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
