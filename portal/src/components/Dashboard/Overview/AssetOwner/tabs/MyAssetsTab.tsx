import { useEffect, useRef, useState, type JSX } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { NavigateFunction } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown, FiInbox } from 'react-icons/fi';
import type { RootState } from '@/redux/store';
import {
  useMyAssets,
  type IMyAsset,
  type MyAssetStatus,
  type MyAssetRwaStatus,
} from '@/api';

const TAKE = 10;

const spaceCase = (str: string) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

const getAssetMeta = (asset: IMyAsset, key: string) =>
  asset.meta.find((m) => m.metaKey === key)?.metaValue;

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  Available:
    'bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400',
  Funded:
    'bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400',
  Rejected: 'bg-[#FBE3E0] text-[#C0392B] dark:bg-red-900/20 dark:text-red-400',
};

const statusBadgeClass = (status: string) =>
  STATUS_STYLES[status] ||
  (status.endsWith('Rejected')
    ? STATUS_STYLES.Rejected
    : 'bg-[#FFF4E0] text-[#B7791F] dark:bg-yellow-900/20 dark:text-yellow-400');

// Once the listing is live (or pending going live), the per-stage review
// statuses no longer matter — the single overall status badge covers it.
const isInReviewPipeline = (asset: IMyAsset) => {
  const stepsNum = parseInt(asset.steps || '', 10);
  return asset.status === 'Reviewed' && (stepsNum === 5 || stepsNum === 6);
};

// Legal, Valuation and Due Diligence are reviewed independently — `steps`
// alone (5 vs 6) doesn't reflect a rejection on any one of them, so check
// the three statusFor* fields directly rather than trusting the step count.
const hasAnyReviewRejection = (asset: IMyAsset) =>
  asset.rwaRequest?.statusForLegal === 'LegalRejected' ||
  asset.rwaRequest?.statusForValuation === 'ValuationRejected' ||
  asset.rwaRequest?.statusForDueDiligence === 'DueDiligenceRejected';

// Due Diligence showing approved doesn't guarantee Legal/Valuation are
// still approved too — a stage can be reset back to "Submitted" for
// re-review after a resubmission, so all three must be checked explicitly.
const isReviewFullyApproved = (asset: IMyAsset) =>
  asset.rwaRequest?.statusForLegal === 'LegalReviewed' &&
  asset.rwaRequest?.statusForValuation === 'ValuationReviewed' &&
  asset.rwaRequest?.statusForDueDiligence === 'DueDiligence';

const getDisplayStatus = (asset: IMyAsset) => {
  if (asset.status === 'Available') return 'Live';
  if (asset.status === 'RequestLive') return 'Live Pending';

  if (isInReviewPipeline(asset)) {
    // Legal, Valuation and Due Diligence are reviewed independently — a
    // rejection on any one of them (not just the combined rwaRequest.status)
    // must surface here, naming the exact stage that was rejected.
    if (asset.rwaRequest?.statusForLegal === 'LegalRejected') {
      return 'Legal Rejected';
    }
    if (asset.rwaRequest?.statusForValuation === 'ValuationRejected') {
      return 'Valuation Rejected';
    }
    if (asset.rwaRequest?.statusForDueDiligence === 'DueDiligenceRejected') {
      return 'Due Diligence Rejected';
    }

    if (asset.rwaRequest?.statusForDueDiligence === 'DueDiligence') {
      return 'Due Diligence Approved';
    }
    if (asset.rwaRequest?.statusForValuation === 'ValuationReviewed') {
      return 'Due Diligence Pending';
    }
    if (asset.rwaRequest?.statusForLegal === 'LegalReviewed') {
      return 'Valuation Review Pending';
    }
    return 'Legal Review Pending';
  }
  return asset.status;
};

const REVIEW_STAGES: Array<{
  key: 'statusForLegal' | 'statusForValuation' | 'statusForDueDiligence';
  reasonKey:
    | 'legalRejectionReason'
    | 'valuationRejectionReason'
    | 'dueDiligenceRejectionReason';
  label: string;
  rejectedValue: string;
  approvedValue: string;
}> = [
  {
    key: 'statusForLegal',
    reasonKey: 'legalRejectionReason',
    label: 'Legal',
    rejectedValue: 'LegalRejected',
    approvedValue: 'LegalReviewed',
  },
  {
    key: 'statusForValuation',
    reasonKey: 'valuationRejectionReason',
    label: 'Valuation',
    rejectedValue: 'ValuationRejected',
    approvedValue: 'ValuationReviewed',
  },
  {
    key: 'statusForDueDiligence',
    reasonKey: 'dueDiligenceRejectionReason',
    label: 'Due Diligence',
    rejectedValue: 'DueDiligenceRejected',
    approvedValue: 'DueDiligence',
  },
];

const stageBadgeClass = (
  value: string | undefined,
  rejectedValue: string,
  approvedValue: string
) => {
  if (value === rejectedValue) return STATUS_STYLES.Rejected;
  if (value === approvedValue) return STATUS_STYLES.Available;
  return 'bg-[#FFF4E0] text-[#B7791F] dark:bg-yellow-900/20 dark:text-yellow-400';
};

function ReviewStageBadges({ asset }: { asset: IMyAsset }) {
  return (
    <div className="flex flex-col gap-1">
      {REVIEW_STAGES.map((stage) => {
        const value = asset.rwaRequest?.[stage.key];
        const isRejected = value === stage.rejectedValue;
        const stageText = isRejected
          ? 'Rejected'
          : value === stage.approvedValue
            ? 'Approved'
            : 'In Progress';
        const reason = asset.rwaRequest?.[stage.reasonKey];
        return (
          <span
            key={stage.key}
            title={isRejected ? reason || 'No reason provided' : undefined}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold leading-none w-fit ${stageBadgeClass(value, stage.rejectedValue, stage.approvedValue)} ${isRejected ? 'cursor-help' : ''}`}
          >
            {stage.label}: {stageText}
          </span>
        );
      })}
    </div>
  );
}

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

interface MyAssetsTabProps {
  navigate: NavigateFunction;
  selectedAssetDetail: null | 'sora' | 'crescent';
  setSelectedAssetDetail: (asset: null | 'sora' | 'crescent') => void;
  soraTab: 'overview' | 'lifecycle' | 'distributions' | 'docsgov';
  setSoraTab: (
    tab: 'overview' | 'lifecycle' | 'distributions' | 'docsgov'
  ) => void;
  crescentTab: 'overview' | 'lifecycle' | 'distributions' | 'docsgov';
  setCrescentTab: (
    tab: 'overview' | 'lifecycle' | 'distributions' | 'docsgov'
  ) => void;
  showConfirm: (title: string, text: string, onConfirm: () => void) => void;
  crescentSignoffStatus: 'pending' | 'agreed' | 'objected';
  setCrescentSignoffStatus: (status: 'pending' | 'agreed' | 'objected') => void;
  crescentSignoffNote: string;
  setCrescentSignoffNote: (note: string) => void;
}

export default function MyAssetsTab({
  navigate,
  selectedAssetDetail,
  setSelectedAssetDetail,
  soraTab,
  setSoraTab,
  crescentTab,
  setCrescentTab,
  showConfirm,
  crescentSignoffStatus,
  setCrescentSignoffStatus,
  crescentSignoffNote,
  setCrescentSignoffNote,
}: MyAssetsTabProps): JSX.Element {
  const [crescentSignoffActionVisible, setCrescentSignoffActionVisible] =
    useState(true);

  const { role, user } = useSelector((state: RootState) => state.authLogin);
  const isBroker =
    (role || user?.type || user?.role || '').toLowerCase() === 'broker';

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [assetStatus, setAssetStatus] = useState<MyAssetStatus | ''>('');
  const [rwaStatus, setRwaStatus] = useState<MyAssetRwaStatus | ''>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const skip = (page - 1) * TAKE;
  const { data: myAssetsRes, isLoading: isAssetsLoading } = useMyAssets({
    skip,
    take: TAKE,
    search,
    assetStatus,
    rwaStatus,
  });

  const assets = myAssetsRes?.success ? (myAssetsRes.data?.data ?? []) : [];
  const totalAssets = myAssetsRes?.success ? (myAssetsRes.data?.count ?? 0) : 0;
  const totalPages = Math.max(1, Math.ceil(totalAssets / TAKE));
  const submitSignOff = (choice: 'agree' | 'object') => {
    const title =
      choice === 'agree' ? 'Sign Off — No Objection?' : 'Raise Objection?';
    const text =
      choice === 'agree'
        ? 'This confirms you have no objection to the proposed exit terms (₹14,80,00,000 sale price). Your sign-off will be sent to the Trustee.'
        : `This sends your objection${crescentSignoffNote ? ` ("${crescentSignoffNote}")` : ''} to the Trustee and Admin for review before the sale can proceed.`;

    showConfirm(title, text, () => {
      if (choice === 'agree') {
        setCrescentSignoffStatus('agreed');
        setCrescentSignoffActionVisible(false);
        toast.success('Sign-off recorded — sent to Trustee');
      } else {
        setCrescentSignoffStatus('objected');
        setCrescentSignoffActionVisible(false);
        toast.success('Objection raised — sent to Trustee');
      }
    });
  };

  return (
    <div className="space-y-6">
      {!selectedAssetDetail ? (
        <>
          <div className="pagehead">
            <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
              My Assets
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
              All assets submitted, in review, live, or closed.
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
            <input
              type="text"
              value={searchInput}
              placeholder="Search by asset name"
              className="w-full sm:max-w-xs px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg font-12 md:font-14 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-[#1F4FE0] focus:bg-white dark:focus:bg-white/10"
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <TableFilterSelect
                value={assetStatus}
                placeholder="All Status"
                options={[
                  { label: 'All Status', value: '' },
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Reviewed', value: 'Reviewed' },
                  { label: 'Rejected', value: 'Rejected' },
                  { label: 'Live', value: 'Available' },
                  { label: 'Funded', value: 'Funded' },
                  { label: 'RequestLive', value: 'RequestLive' },
                ]}
                onChange={(val) => {
                  setAssetStatus(val as MyAssetStatus | '');
                  setRwaStatus('');
                  setPage(1);
                }}
              />
              <TableFilterSelect
                value={rwaStatus}
                placeholder="All RWA Status"
                options={[
                  { label: 'All RWA Status', value: '' },
                  { label: 'Legal Reviewed', value: 'LegalReviewed' },
                  { label: 'Valuation Reviewed', value: 'ValuationReviewed' },
                  { label: 'Due Diligence', value: 'DueDiligence' },
                  { label: 'Legal Rejected', value: 'LegalRejected' },
                  { label: 'ValuationRejected', value: 'ValuationRejected' },
                  {
                    label: 'Due Diligence Rejected',
                    value: 'DueDiligenceRejected',
                  },
                ]}
                onChange={(val) => {
                  setRwaStatus(val as MyAssetRwaStatus | '');
                  setAssetStatus('');
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Assets Table */}
          <div className="bg-white dark:bg-[#132436] p-3 sm:p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-x-auto">
            <table className="w-full text-left font-12 md:font-14 border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-[#E3E7EE] dark:border-white/10">
                  <th className="py-3 px-3 sm:px-4 text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                    Asset
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                    Type
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                    City
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                    Market Value
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                    Ownership
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap text-right">
                    Action
                  </th>
                  {isBroker && (
                    <th className="py-3 px-3 sm:px-4 text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap text-right">
                      View
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EE] dark:divide-white/10 text-gray-700 dark:text-gray-300">
                {isAssetsLoading ? (
                  <tr>
                    <td
                      colSpan={isBroker ? 8 : 7}
                      className="py-8 text-center text-gray-400"
                    >
                      Loading assets…
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isBroker ? 8 : 7}
                      className="py-8 text-center text-gray-400"
                    >
                      {search
                        ? `No assets found for "${search}"`
                        : 'No assets yet'}
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const city = getAssetMeta(asset, 'city');
                    const marketValue = getAssetMeta(asset, 'marketValue');
                    const thumbnail = asset.documents.find(
                      (d) => d.documentType === 'ASSET_IMAGE'
                    )?.url;

                    return (
                      <tr
                        key={asset.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 px-3 sm:px-4 font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt=""
                                className="w-8 h-8 rounded-md object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-white/5 shrink-0" />
                            )}
                            <span
                              className="truncate max-w-[160px] sm:max-w-[220px] md:max-w-[300px] lg:max-w-none block"
                              title={asset.assetTitle}
                            >
                              {asset.assetTitle}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                          {spaceCase(asset.assetType)}
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                          {city || '—'}
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                          {marketValue
                            ? `₹${Number(marketValue).toLocaleString('en-IN')}`
                            : '—'}
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                          {spaceCase(asset.ownershipModel)}
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                          {isInReviewPipeline(asset) ? (
                            <ReviewStageBadges asset={asset} />
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold leading-none ${statusBadgeClass(asset.status)}`}
                            >
                              {asset.status === 'Available' && (
                                <span className="relative flex w-1.5 h-1.5 shrink-0">
                                  <span className="absolute inset-0 rounded-full bg-[#0F9D58] opacity-75 animate-ping" />
                                  <span className="relative rounded-full w-1.5 h-1.5 bg-[#0F9D58]" />
                                </span>
                              )}
                              <span>{getDisplayStatus(asset)}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                          {asset.status === 'Draft' ||
                          asset.status === 'Reviewed' ||
                          asset.status === 'Rejected' ||
                          asset.status === 'RequestLive' ? (
                            (() => {
                              let label = 'Continue Onboarding';
                              let targetStep = 2;

                              if (asset.status === 'Rejected') {
                                label = 'Update Onboarding';
                                targetStep = 1;
                              } else if (asset.status === 'RequestLive') {
                                label = 'Review Live Status';
                                targetStep = 6;
                              } else {
                                const stepsNum = asset.steps
                                  ? parseInt(asset.steps, 10)
                                  : NaN;
                                if (stepsNum === 1) {
                                  label = 'Check Review Status';
                                  targetStep = 2;
                                } else if (stepsNum === 2) {
                                  label = 'Continue Onboarding';
                                  targetStep = 2;
                                } else if (stepsNum === 5 || stepsNum === 6) {
                                  // `steps` alone (5 vs 6) doesn't reflect a
                                  // rejection or pending stage — check the
                                  // actual Legal/Valuation/Due Diligence
                                  // statuses so a rejected/pending review
                                  // always routes back to Step 5, not the
                                  // "Review Live Status" (Step 6) screen.
                                  if (hasAnyReviewRejection(asset)) {
                                    label = 'Review Rejection';
                                    targetStep = 5;
                                  } else if (isReviewFullyApproved(asset)) {
                                    label = 'Review Live Status';
                                    targetStep = 6;
                                  } else {
                                    label = 'Check Review Status';
                                    targetStep = 5;
                                  }
                                } else if (!isNaN(stepsNum) && stepsNum > 0) {
                                  targetStep = stepsNum;
                                }
                              }

                              return (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/add-asset?id=${asset.id}&step=${targetStep}`
                                    )
                                  }
                                  className="font-12 cursor-pointer font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline"
                                >
                                  {label}
                                </button>
                              );
                            })()
                          ) : asset.status === 'Available' ||
                            asset.status === 'Funded' ? (
                            <button
                              onClick={() =>
                                navigate(
                                  isBroker
                                    ? `/property-details/${asset.id}`
                                    : `/dashboard/PropertyFractionDetails/${asset.id}`
                                )
                              }
                              className="font-12 cursor-pointer font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline"
                            >
                              View Details
                            </button>
                          ) : null}
                        </td>
                        {isBroker && (
                          <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() =>
                                navigate(`/dashboard/my-assets/${asset.id}`)
                              }
                              className="font-12 cursor-pointer font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline"
                            >
                              View
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isAssetsLoading && totalAssets > 0 && (
            <div className="flex items-center justify-between font-12 text-gray-500 dark:text-gray-400">
              <span>
                Showing {skip + 1}–{Math.min(skip + TAKE, totalAssets)} of{' '}
                {totalAssets}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {!isAssetsLoading && totalAssets === 0 && !search && (
            <div className="bg-white dark:bg-[#132436] p-8 rounded-xl border border-dashed border-gray-300 dark:border-white/10 text-center space-y-4">
              <div className="flex justify-center text-gray-400 dark:text-gray-500 py-2">
                <FiInbox size={48} />
              </div>
              <h3 className="font-semibold font-18 text-[#0B2545] dark:text-white">
                Start your first asset listing
              </h3>
              <p className="font-12 md:font-14 text-gray-500 max-w-sm mx-auto">
                Submit basic details to begin the onboarding pipeline —
                preliminary review, full asset details, documents, valuation,
                and listing approval.
              </p>
              <button
                onClick={() => navigate('/dashboard/add-asset')}
                className="bg-[#1F4FE0] text-white px-5 py-2.5 rounded-lg font-12 md:font-14 font-semibold shadow-md hover:bg-[#153eb2]"
              >
                + Add Your First Asset
              </button>
              <div className="text-left max-w-sm mx-auto font-12 text-gray-400 space-y-1 pt-4 border-t border-gray-100 dark:border-white/5">
                <div>1. Submit preliminary information</div>
                <div>2. Wait for Admin's preliminary review</div>
                <div>3. Complete full asset details &amp; documents</div>
                <div>4. Pass legal &amp; valuation review</div>
                <div>5. Approve your listing draft and go live</div>
              </div>
            </div>
          )}
        </>
      ) : selectedAssetDetail === 'sora' ? (
        /* SORA HEIGHTS DETAILS VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedAssetDetail(null)}
            className="font-12 text-gray-500 dark:text-gray-400 font-medium hover:underline flex items-center gap-1"
          >
            <span className="inline-flex items-center gap-1.5">
              <FiArrowLeft size={14} /> Back to My Assets
            </span>
          </button>

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white flex items-center gap-2">
                Sora Heights, Jaipur
                <span className="px-2.5 py-1 rounded-full font-12 font-bold bg-[#E6F4EA] text-[#0F9D58]">
                  Managed
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
                FRACTO-SPV-014 · Funding closed, asset transitioned to Managed.
              </p>
            </div>
          </div>

          {/* Detail subtabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#E3E7EE] dark:border-white/10 pb-3">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'lifecycle', label: 'Lifecycle' },
              { id: 'distributions', label: 'Distributions by Type' },
              { id: 'docsgov', label: 'Documents & Governance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setSoraTab(
                    tab.id as
                      | 'overview'
                      | 'lifecycle'
                      | 'distributions'
                      | 'docsgov'
                  )
                }
                className={`px-4 py-2 rounded-full font-12 md:font-14 font-semibold transition ${
                  soraTab === tab.id
                    ? 'bg-[#1F4FE0] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {soraTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#132436] p-8 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center space-y-4">
                <span className="px-4 py-2 rounded-full font-12 md:font-14 font-bold bg-[#E6F4EA] text-[#0F9D58]">
                  Fully Funded &amp; Closed
                </span>
                <p className="text-gray-500 dark:text-gray-400 font-12 md:font-14 max-w-lg mx-auto">
                  ₹15.0Cr raised from 11 identified investors. SPV has acquired
                  the asset and operations have begun.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Final Raise
                  </div>
                  <div className="font-18 md:font-20 font-semibold font-serif text-[#0B2545] dark:text-white">
                    ₹15.0Cr
                  </div>
                </div>
                <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Investors
                  </div>
                  <div className="font-18 md:font-20 font-semibold font-serif text-[#0B2545] dark:text-white">
                    11
                  </div>
                </div>
                <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Closing Date
                  </div>
                  <div className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white py-1">
                    14 Mar 2026
                  </div>
                </div>
                <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Profit Types
                  </div>
                  <div className="flex gap-1 justify-center mt-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#0F9D58]">
                      Rental
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8EEFC] text-[#1F4FE0]">
                      Timeshare
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF4E0] text-[#B7791F]">
                      Sale
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px] mb-4">
                  Your Acquisition Payout
                </h3>
                <div className="space-y-3 font-12 md:font-14">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Raised</span>
                    <span className="font-semibold">₹15.0Cr</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 dark:border-white/5 pt-2">
                    <span className="text-gray-500">
                      Platform / Structuring Fee
                    </span>
                    <span className="text-red-500 font-semibold">−₹42,000</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 dark:border-white/5 pt-2">
                    <span className="text-gray-500">
                      Stamp Duty / Registration (estimate)
                    </span>
                    <span className="text-red-500 font-semibold">−₹16,000</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-white/10 pt-2 font-14 md:font-16 font-bold text-[#0B2545] dark:text-white">
                    <span>Net Payout to You</span>
                    <span>₹14,42,000</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#0F9D58]">
                    Completed
                  </span>
                  <span className="text-[11px] text-gray-400">
                    — credited 16 Mar 2026 to your verified bank account
                  </span>
                </div>
              </div>
            </div>
          )}

          {soraTab === 'lifecycle' && (
            <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10">
              <div className="flex flex-col sm:flex-row justify-between gap-4 py-4">
                {[
                  { label: 'Secondary Club Formed', done: true },
                  { label: 'SPV Incorporated', done: true },
                  { label: 'Subscription Closed', done: true },
                  { label: 'Managed', current: true },
                  { label: 'Exit' },
                  { label: 'Closure' },
                ].map((step, idx) => {
                  let cDot = 'bg-gray-200 dark:bg-white/10';
                  let cTxt = 'text-gray-400';
                  if (step.done) {
                    cDot = 'bg-[#1F4FE0] text-white';
                    cTxt = 'text-[#1F4FE0] dark:text-blue-400 font-semibold';
                  } else if (step.current) {
                    cDot =
                      'bg-[#0B2545] dark:bg-[#60a5fa] text-white ring-4 ring-blue-100 dark:ring-blue-900/30';
                    cTxt = 'text-[#0B2545] dark:text-[#60a5fa] font-bold';
                  }
                  return (
                    <div
                      key={idx}
                      className="flex-1 text-center flex flex-col items-center relative"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-12 mb-2 ${cDot}`}
                      >
                        {idx + 1}
                      </div>
                      <div className={`text-[11.5px] ${cTxt}`}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="font-12 md:font-14 text-gray-500 mt-6 border-t border-gray-100 dark:border-white/5 pt-4">
                Currently Managed — generating Rental and Timeshare income for
                SPV shareholders. No exit has been proposed for this asset.
              </p>
            </div>
          )}

          {soraTab === 'distributions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-2">
                  Rental
                </h3>
                <p className="font-12 text-gray-500 leading-relaxed">
                  Rental Distribution is paid to SPV shareholders (investors),
                  not to you as Asset Owner — you received your one-time
                  Acquisition Payout at closing (see Overview).
                </p>
              </div>
              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-2">
                  Timeshare
                </h3>
                <p className="font-12 text-gray-500 leading-relaxed">
                  Timeshare Income is also paid to SPV shareholders. Your
                  ongoing role is limited to occupancy/operational updates (see
                  Documents &amp; Governance).
                </p>
              </div>
              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-2">
                  Sale Profit
                </h3>
                <p className="font-12 text-gray-500 leading-relaxed">
                  No exit has been proposed for this asset yet. If one is,
                  you'll get a sign-off step here before the sale proceeds.
                </p>
              </div>
            </div>
          )}

          {soraTab === 'docsgov' && (
            <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
              <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px] mb-4">
                Post-Funding Asset Management
              </h3>
              <div className="divide-y divide-[#E3E7EE] dark:divide-white/10">
                <div className="flex justify-between items-center py-3 font-12 md:font-14">
                  <span>Q1 FY26-27 Performance Report</span>
                  <button
                    onClick={() =>
                      toast.info('Upload dialog opened for quarterly report')
                    }
                    className="text-[#1F4FE0] dark:text-[#60a5fa] font-semibold hover:underline"
                  >
                    Upload
                  </button>
                </div>
                <div className="flex justify-between items-center py-3 font-12 md:font-14">
                  <span>Distribution Paid — 12 Jun 2026 (₹48,500 gross)</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E6F4EA] text-[#0F9D58]">
                    Completed
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 font-12 md:font-14">
                  <span>Occupancy Update</span>
                  <button
                    onClick={() => toast.info('Occupancy update form opened')}
                    className="text-[#1F4FE0] dark:text-[#60a5fa] font-semibold hover:underline"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CRESCENT BUSINESS PARK DETAILS VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedAssetDetail(null)}
            className="font-12 text-gray-500 dark:text-gray-400 font-medium hover:underline flex items-center gap-1"
          >
            <span className="inline-flex items-center gap-1.5">
              <FiArrowLeft size={14} /> Back to My Assets
            </span>
          </button>

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white flex items-center gap-2">
                Crescent Business Park, Gurugram
                <span className="px-2.5 py-1 rounded-full font-12 font-bold bg-[#FFF4E0] text-[#B7791F]">
                  Exit In Progress
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
                FRACTO-SPV-021 · Managed since acquisition, now in Club-led exit
                process.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#E3E7EE] dark:border-white/10 pb-3">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'lifecycle', label: 'Lifecycle' },
              { id: 'distributions', label: 'Distributions by Type' },
              { id: 'docsgov', label: 'Documents & Governance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setCrescentTab(
                    tab.id as
                      | 'overview'
                      | 'lifecycle'
                      | 'distributions'
                      | 'docsgov'
                  )
                }
                className={`px-4 py-2 rounded-full font-12 md:font-14 font-semibold transition ${
                  crescentTab === tab.id
                    ? 'bg-[#1F4FE0] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {crescentTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Final Raise
                  </div>
                  <div className="font-18 md:font-20 font-semibold font-serif text-[#0B2545] dark:text-white">
                    ₹12.5Cr
                  </div>
                </div>
                <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Investors
                  </div>
                  <div className="font-18 md:font-20 font-semibold font-serif text-[#0B2545] dark:text-white">
                    9
                  </div>
                </div>
                <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Closing Date
                  </div>
                  <div className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white py-1">
                    02 Jan 2025
                  </div>
                </div>
                <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Profit Types
                  </div>
                  <div className="flex gap-1 justify-center mt-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#0F9D58]">
                      Rental
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF4E0] text-[#B7791F]">
                      Sale
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px] mb-4">
                  Your Acquisition Payout
                </h3>
                <div className="space-y-3 font-12 md:font-14">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Raised</span>
                    <span className="font-semibold">₹12.5Cr</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 dark:border-white/5 pt-2">
                    <span className="text-gray-500">
                      Platform / Structuring Fee
                    </span>
                    <span className="text-red-500 font-semibold">−₹35,000</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 dark:border-white/5 pt-2">
                    <span className="text-gray-500">
                      Stamp Duty / Registration (estimate)
                    </span>
                    <span className="text-red-500 font-semibold">−₹14,000</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-white/10 pt-2 font-14 md:font-16 font-bold text-[#0B2545] dark:text-white">
                    <span>Net Payout to You</span>
                    <span>₹12,00,49,000 (est.)</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#0F9D58]">
                    Completed
                  </span>
                  <span className="text-[11px] text-gray-400">
                    — credited at original closing
                  </span>
                </div>
              </div>
            </div>
          )}

          {crescentTab === 'lifecycle' && (
            <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10">
              <div className="flex flex-col sm:flex-row justify-between gap-4 py-4">
                {[
                  { label: 'Secondary Club Formed', done: true },
                  { label: 'SPV Incorporated', done: true },
                  { label: 'Subscription Closed', done: true },
                  { label: 'Managed', done: true },
                  { label: 'Exit', current: true },
                  { label: 'Closure' },
                ].map((step, idx) => {
                  let cDot = 'bg-gray-200 dark:bg-white/10';
                  let cTxt = 'text-gray-400';
                  if (step.done) {
                    cDot = 'bg-[#1F4FE0] text-white';
                    cTxt = 'text-[#1F4FE0] dark:text-blue-400 font-semibold';
                  } else if (step.current) {
                    cDot =
                      'bg-[#0B2545] dark:bg-[#60a5fa] text-white ring-4 ring-blue-100 dark:ring-blue-900/30';
                    cTxt = 'text-[#0B2545] dark:text-[#60a5fa] font-bold';
                  }
                  return (
                    <div
                      key={idx}
                      className="flex-1 text-center flex flex-col items-center relative"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-12 mb-2 ${cDot}`}
                      >
                        {idx + 1}
                      </div>
                      <div className={`text-[11.5px] ${cTxt}`}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="font-12 md:font-14 text-gray-500 mt-6 border-t border-gray-100 dark:border-white/5 pt-4">
                The Club has proposed selling this asset. Updated valuation:
                ₹14.8Cr (vs. original ₹12.5Cr). Shareholder vote is open,
                closing 30 Jun 2026. Your sign-off is required before sale
                proceeds — see Documents &amp; Governance.
              </p>
            </div>
          )}

          {crescentTab === 'distributions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-2">
                  Rental
                </h3>
                <p className="font-12 text-gray-500 leading-relaxed">
                  Rental Distribution is paid to SPV shareholders (investors),
                  not to you as Asset Owner.
                </p>
              </div>
              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-2">
                  Timeshare
                </h3>
                <p className="font-12 text-gray-500 leading-relaxed">
                  Not applicable — this asset isn't tagged Timeshare-eligible.
                </p>
              </div>
              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-2">
                  Sale Profit
                </h3>
                <p className="font-12 text-gray-500 leading-relaxed">
                  An exit is in progress. You don't receive a share of Sale
                  Profit (that goes to SPV shareholders), but your sign-off on
                  the terms is required — see Documents &amp; Governance.
                </p>
              </div>
            </div>
          )}

          {crescentTab === 'docsgov' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px] mb-4">
                  Exit Terms — Your Sign-Off
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-12 md:font-14 mb-4 border-collapse">
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-white/5">
                        <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                          Proposed Sale Price
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">
                          ₹14,80,00,000
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-white/5">
                        <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                          Shareholder Vote
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          5 of 9 voted, closes 30 Jun 2026
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-white/5">
                        <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                          Your Sign-Off Status
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {crescentSignoffStatus === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF4E0] text-[#B7791F]">
                              Pending Sign-Off
                            </span>
                          )}
                          {crescentSignoffStatus === 'agreed' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6F4EA] text-[#0F9D58]">
                              Signed Off — No Objection
                            </span>
                          )}
                          {crescentSignoffStatus === 'objected' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FBE3E0] text-[#C0392B]">
                              Objection Raised
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {crescentSignoffActionVisible && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-12 text-gray-500 font-medium">
                        Note or Objection (optional)
                      </label>
                      <textarea
                        value={crescentSignoffNote}
                        onChange={(e) => setCrescentSignoffNote(e.target.value)}
                        placeholder="e.g. concerns about timeline, buyer identity, or price"
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 md:font-14 bg-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitSignOff('agree')}
                        className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold shadow hover:bg-[#153eb2]"
                      >
                        Sign Off — No Objection
                      </button>
                      <button
                        onClick={() => submitSignOff('object')}
                        className="bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-12 font-semibold hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        Raise Objection
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10">
                <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px] mb-4">
                  Post-Funding Asset Management
                </h3>
                <div className="divide-y divide-[#E3E7EE] dark:divide-white/10 font-12 md:font-14">
                  <div className="flex justify-between items-center py-3">
                    <span>Q1 FY26-27 Performance Report</span>
                    <button
                      onClick={() =>
                        toast.info('Upload dialog opened for quarterly report')
                      }
                      className="text-[#1F4FE0] dark:text-[#60a5fa] font-semibold hover:underline"
                    >
                      Upload
                    </button>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span>Occupancy Update</span>
                    <button
                      onClick={() => toast.info('Occupancy update form opened')}
                      className="text-[#1F4FE0] dark:text-[#60a5fa] font-semibold hover:underline"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
