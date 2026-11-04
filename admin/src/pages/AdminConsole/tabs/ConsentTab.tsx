import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable';
import {
  useGetSpvShareholderRegisterQuery,
  SPVShareholderMember,
  SPVShareholderRecord,
} from '@/store/api/allGroupApi';
import { useDebounce } from '@/hooks';

const shareholderColumns: ColumnDef<SPVShareholderMember>[] = [
  {
    header: 'Investor Name',
    accessorKey: 'name',
    cell: ({ row }) => (
      <div className="font-semibold text-white text-sm">{row.original.name}</div>
    ),
  },
  {
    header: 'Contact Info',
    id: 'contactInfo',
    cell: ({ row }) => (
      <div className="flex flex-col text-xs text-slate-400">
        <span className="font-medium text-slate-200">{row.original.email}</span>
        <span>{row.original.mobile}</span>
      </div>
    ),
  },
  {
    header: 'Units Subscribed',
    accessorKey: 'fractionUnits',
    cell: ({ row }) => (
      <div className="text-sm font-medium text-slate-200">
        {row.original.fractionUnits} {row.original.fractionUnits === 1 ? 'Unit' : 'Units'}
        {row.original.totalPaidAmount > 0 && (
          <span className="text-xs text-slate-400 ml-1.5 font-normal">
            (₹{row.original.totalPaidAmount.toLocaleString()})
          </span>
        )}
      </div>
    ),
  },
  {
    header: 'Allotment Date',
    accessorKey: 'purchaseDate',
    cell: ({ row }) => {
      const dateStr = row.original.purchaseDate;
      if (!dateStr)
        return (
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Pending
          </span>
        );
      try {
        const date = new Date(dateStr);
        return (
          <span className="text-sm text-slate-200">
            {date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      } catch (e) {
        return <span className="text-sm text-slate-200">{dateStr}</span>;
      }
    },
  },
  {
    header: 'Consent',
    accessorKey: 'consent',
    cell: ({ row }) => {
      const consent = row.original.consent;
      if (consent === true) {
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-450 border border-emerald-500/20">
            Yes
          </span>
        );
      }
      if (consent === false) {
        return (
          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-455 border border-rose-500/20">
            No
          </span>
        );
      }
      return (
        <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-700">
          Not Given Yet
        </span>
      );
    },
  },
];

export function ConsentTab() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // SPV List pagination
  const [spvSkip, setSpvSkip] = useState(0);
  const [spvTake, setSpvTake] = useState(10);
  const [accumulatedSpvs, setAccumulatedSpvs] = useState<SPVShareholderRecord[]>([]);
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  // Individual SPV member table paginations: maps assetId -> { pageIndex, pageSize }
  const [spvMemberPagination, setSpvMemberPagination] = useState<
    Record<number | string, { pageIndex: number; pageSize: number }>
  >({});

  // Reset pagination and accumulated list when search changes
  useEffect(() => {
    setSpvSkip(0);
    setAccumulatedSpvs([]);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError } = useGetSpvShareholderRegisterQuery({
    skip: spvSkip,
    take: spvTake,
    search: debouncedSearch || undefined,
  });

  // Append new data when it changes
  useEffect(() => {
    if (data?.data) {
      if (spvSkip === 0) {
        setAccumulatedSpvs(data.data);
      } else {
        setAccumulatedSpvs((prev) => {
          const existingIds = new Set(prev.map((item) => item.assetId));
          const newItems = data.data.filter((item) => !existingIds.has(item.assetId));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data?.data, spvSkip]);

  const hasMore = data ? spvSkip + spvTake < data.count : false;

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting && hasMore && !isFetching) {
          setSpvSkip((prev) => prev + spvTake);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef);
    return () => observer.disconnect();
  }, [loadMoreRef, hasMore, isFetching, spvTake]);

  if (isLoading && spvSkip === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError && spvSkip === 0) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-400">
        Failed to load shareholder register data. Please try again.
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6 animate-fade-in w-full">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Consent
        </h2>
        <p className="text-slate-400">
          Allotment records across all Assets
        </p>
      </div>

      <div className="mb-4 flex w-full items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Asset Title"
          className="h-10 w-full max-w-md rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-6">
        {accumulatedSpvs.length > 0
          ? accumulatedSpvs.map((spv: SPVShareholderRecord) => {
              const pag = spvMemberPagination[spv.assetId] || { pageIndex: 0, pageSize: 5 };
              const paginatedMembers = spv.members?.slice(
                pag.pageIndex * pag.pageSize,
                (pag.pageIndex + 1) * pag.pageSize
              ) || [];

              return (
                <div key={spv.assetId} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
                  <div className="px-5 py-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">{spv.assetTitle}</h2>
                  </div>

                  <div className="p-0">
                    <DataTable
                      data={paginatedMembers}
                      columns={shareholderColumns}
                      enableSearch={false}
                      enableStatusFilter={false}
                      pageSize={pag.pageSize}
                      pageIndex={pag.pageIndex}
                      pageCount={Math.ceil((spv.members?.length || 0) / pag.pageSize)}
                      onPaginationChange={(updater) => {
                        const next = typeof updater === 'function' ? updater(pag) : updater;
                        setSpvMemberPagination((prev) => ({
                          ...prev,
                          [spv.assetId]: next,
                        }));
                      }}
                    />
                  </div>
                </div>
              );
            })
          : !isFetching && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-10 text-center text-sm text-slate-400">
                No shareholder records found.
              </div>
            )}
      </div>

      {/* Infinite Scroll target and status indicator */}
      <div ref={setLoadMoreRef} className="py-6 text-center text-sm text-slate-400 flex justify-center">
        {isFetching && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
        {!hasMore && accumulatedSpvs.length > 0 && <p>No more records to load.</p>}
      </div>
    </div>
  );
}
