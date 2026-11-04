import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

import Loader from '@/components/common/Loader';
import { useDebounce } from '@/hooks';
import { useGetExitLiquidationTrackerQuery, ExitLiquidationRecord } from '@/store/api/spvApi';

const TrackerRecordItem = ({ record }: { record: ExitLiquidationRecord }) => {
  const isLegalStatus = record.status?.legalStatus === 'LegalReviewed';
  const isValuationStatus = record.status?.valuationStatus === 'ValuationReviewed';
  const isDueDiligenceStatus = record.status?.dueDiligence === 'DueDiligence';
  const isClubCreated = record.status?.hasSecondaryClub;
  const isFractionalized = record.status?.fractionalizationStatus?.toLowerCase() === 'completed';
  const isSpvCreated = record.status?.hasSpv;
  const isFunded = record.status?.isFunded;
  const isMarketplaceAvailable = record.status?.hasSecondaryMarketplace;

  const steps = [
    {
      label: 'Legal Status',
      subLabel: isLegalStatus ? 'Completed' : undefined,
      isCompleted: isLegalStatus,
      incompleteReason: 'Pending Trustee Review',
    },
    {
      label: 'Valuation',
      subLabel: isValuationStatus ? 'Completed' : undefined,
      isCompleted: isValuationStatus,
      incompleteReason: 'Pending Trustee Review',
    },
    {
      label: 'Due Diligence',
      subLabel: isDueDiligenceStatus ? 'Completed' : undefined,
      isCompleted: isDueDiligenceStatus,
      incompleteReason: 'Pending Trustee Review',
    },
    {
      label: 'Secondary Club',
      subLabel: isClubCreated ? 'Completed' : undefined,
      isCompleted: isClubCreated,
      incompleteReason: 'Pending Admin Review – Admin will review the asset and create the Secondary Club.',
    },
    {
      label: 'Fractionalization',
      subLabel: record.status?.fractionalizationStatus || undefined,
      isCompleted: isFractionalized,
      incompleteReason: 'Admin Will fractionalize when asset go live.',
    },
    {
      label: 'SPV',
      subLabel:
        isSpvCreated && record.status?.spvName
          ? record.status.spvName
          : isSpvCreated && record.status?.spvId
            ? `ID: ${record.status.spvId}`
            : undefined,
      isCompleted: isSpvCreated,
      incompleteReason: 'Admin will Create SPV when Asset Go live.',
    },
    {
      label: 'Funding',
      subLabel: isFunded ? 'Funded' : undefined,
      isCompleted: isFunded,
      incompleteReason: 'Pending Funding – The asset will be marked as funded once all available fractions are sold.',
    },
    {
      label: 'Secondary Marketplace',
      subLabel: isMarketplaceAvailable ? 'Available' : undefined,
      isCompleted: isMarketplaceAvailable,
      incompleteReason: 'Pending Funding – Admin will enable the asset in the Secondary Marketplace once the asset is fully funded.',
    },
  ];

  const firstIncompleteStepIndex = steps.findIndex((s) => !s.isCompleted);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(
    firstIncompleteStepIndex !== -1 ? firstIncompleteStepIndex : null
  );

  return (
    <div
      key={record.assetId}
      className="overflow-hidden rounded-xl border bg-background"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-3 pt-4 border-b">
        <h2 className="text-sm font-bold text-foreground">{record.assetTitle}</h2>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            record.exit?.hasActiveExit
              ? 'bg-amber-500/15 text-amber-500'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {record.exit?.statusLabel || 'No Active Exit'}
        </span>
      </div>

      <div className="flex w-full items-start overflow-x-auto px-5 py-6 gap-4">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`flex flex-1 items-start min-w-[120px] ${!step.isCompleted ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (!step.isCompleted) {
                setActiveStepIndex(index);
              }
            }}
          >
            <div className="flex flex-col items-center gap-1.5 px-1 text-center w-full relative">
              {step.isCompleted ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#FFB816] bg-background ring-4 ring-[#FFB816]/10 z-10">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFB816]" />
                </span>
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background ring-4 ring-muted/40 z-10">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                </span>
              )}

              <span
                className={`text-xs font-medium leading-tight ${
                  !step.isCompleted ? 'text-muted-foreground/60' : 'text-foreground'
                }`}
              >
                {step.label}
              </span>

              {step.subLabel && (
                <span className="text-[11px] text-muted-foreground leading-tight truncate max-w-[120px]">
                  {step.subLabel}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeStepIndex !== null && steps[activeStepIndex] && !steps[activeStepIndex].isCompleted && (
        <div className="px-5 pb-4">
          <div className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground border border-border">
             <span className="font-medium text-foreground">{steps[activeStepIndex].label}:</span> {steps[activeStepIndex].incompleteReason}
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-slate-850 rounded-xl m-8 mt-2">
        <table className="w-full text-sm text-left text-slate-350">
          <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Track</th>
              <th className=" w-[300px] px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            <tr className="hover:bg-slate-800/10">
              <td className="px-4 py-3">Market Value</td>
              <td className="px-4 py-3">{record?.marketValue ?? '-'}</td>
            </tr>
            <tr className="hover:bg-slate-800/10">
              <td className="px-4 py-3">Voted Shareholders</td>
              <td className="px-4 py-3">
                {record.shareholderVote?.votedShareholders ?? '-'}
              </td>
            </tr>
            <tr className="hover:bg-slate-800/10">
              <td className="px-4 py-3">Total Shareholders</td>
              <td className="px-4 py-3">
                {record.shareholderVote?.totalShareholders ?? '-'}
              </td>
            </tr>
            <tr className="hover:bg-slate-800/10">
              <td className="px-4 py-3">Not Voted Shareholders</td>
              <td className="px-4 py-3">
                {record.shareholderVote?.notVotedShareholders ?? '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExitLiquidationTracker = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Reset pagination index when search queries change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useGetExitLiquidationTrackerQuery({
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    search: debouncedSearch || undefined,
  });

  const recordList = data?.data || [];

  const pageCount = useMemo(() => {
    if (!data) return 1;
    return Math.ceil((data.count || 0) / pagination.pageSize) || 1;
  }, [data, pagination.pageSize]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Exit / Liquidation Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the fractionalization status, SPV setup, funding status, and marketplace readiness
          for each asset.
        </p>
      </div>

      <div className="mb-6 flex w-full items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset title..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load tracker records. Please try again.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {recordList.length > 0 ? (
              recordList.map((record) => (
                <TrackerRecordItem key={record.assetId} record={record} />
              ))
            ) : (
              <div className="rounded-xl border bg-background px-5 py-10 text-center text-sm text-muted-foreground">
                No exit/liquidation records found.
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {data && data.count > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 mt-6">
              <div className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                  {pagination.pageIndex * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-foreground">
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.count)}
                </span>{' '}
                of <span className="font-medium text-foreground">{data.count}</span> Assets
              </div>

              <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Assets per page</p>
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => {
                      setPagination({
                        pageIndex: 0,
                        pageSize: Number(e.target.value),
                      });
                    }}
                    className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {pagination.pageIndex + 1} of {pageCount}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
                    }
                    disabled={pagination.pageIndex === 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
                    }
                    disabled={(pagination.pageIndex + 1) * pagination.pageSize >= data.count}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExitLiquidationTracker;
