import { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable';
import Loader from '@/components/common/Loader';
import {
  useGetSpvShareholderRegisterQuery,
  SPVShareholderMember,
  SPVShareholderRecord,
} from '@/store/api/spvApi';
import { useDebounce } from '@/hooks';

const shareholderColumns: ColumnDef<SPVShareholderMember>[] = [
  {
    header: 'Investor Name',
    accessorKey: 'name',
    cell: ({ row }) => (
      <div className="font-semibold text-foreground text-sm">{row.original.name}</div>
    ),
  },
  {
    header: 'Contact Info',
    id: 'contactInfo',
    cell: ({ row }) => (
      <div className="flex flex-col text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{row.original.email}</span>
        <span>{row.original.mobile}</span>
      </div>
    ),
  },
  {
    header: 'Units Subscribed',
    accessorKey: 'fractionUnits',
    cell: ({ row }) => (
      <div className="text-sm font-medium text-foreground">
        {row.original.fractionUnits} {row.original.fractionUnits === 1 ? 'Unit' : 'Units'}
        {row.original.totalPaidAmount > 0 && (
          <span className="text-xs text-muted-foreground ml-1.5 font-normal">
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
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Pending
          </span>
        );
      try {
        const date = new Date(dateStr);
        return (
          <span className="text-sm text-foreground">
            {date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      } catch (e) {
        return <span className="text-sm text-foreground">{dateStr}</span>;
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
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            Yes
          </span>
        );
      }
      if (consent === false) {
        return (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
            No
          </span>
        );
      }
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Not Given Yet
        </span>
      );
    },
  },
];

const ShareholderRegister = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // SPV List pagination
  const [spvSkip, setSpvSkip] = useState(0);
  const [spvTake, setSpvTake] = useState(10);
  const [accumulatedSpvs, setAccumulatedSpvs] = useState<SPVShareholderRecord[]>([]);
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  // Individual SPV member table paginations: maps spvId -> { pageIndex, pageSize }
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
          const existingIds = new Set(prev.map((item) => item.spvId));
          const newItems = data.data.filter((item) => !existingIds.has(item.spvId));
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
    return <Loader />;
  }

  if (isError && spvSkip === 0) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center text-sm text-destructive">
        Failed to load shareholder register data. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Shareholder Register</h1>
        <p className="mt-1 text-sm text-muted-foreground">Allotment records across all Assets</p>
      </div>

      <div className="mb-4 flex w-full items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Asset Title"
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="space-y-4">
        {accumulatedSpvs.length > 0
          ? accumulatedSpvs.map((spv: SPVShareholderRecord) => {
              const pag = spvMemberPagination[spv.spvId] || { pageIndex: 0, pageSize: 5 };

              return (
                <div key={spv.spvId} className="overflow-hidden rounded-xl bg-background ">
                  <div className="">
                    <h2 className="text-sm font-bold text-foreground">{spv.assetTitle}</h2>
                  </div>

                  <div className="">
                    <DataTable
                      data={spv.members}
                      columns={shareholderColumns}
                      enableSearch={false}
                      enableColumnVisibility={false}
                      pageSize={pag.pageSize}
                      pageIndex={pag.pageIndex}
                      pageCount={Math.ceil((spv.members?.length || 0) / pag.pageSize)}
                      onPaginationChange={(updater) => {
                        const next = typeof updater === 'function' ? updater(pag) : updater;
                        setSpvMemberPagination((prev) => ({
                          ...prev,
                          [spv.spvId]: next,
                        }));
                      }}
                    />
                  </div>
                </div>
              );
            })
          : !isFetching && (
              <div className="rounded-xl border bg-background px-5 py-10 text-center text-sm text-muted-foreground">
                No shareholder records found.
              </div>
            )}
      </div>

      {/* Infinite Scroll target and status indicator */}
      <div ref={setLoadMoreRef} className="py-6 text-center text-sm text-muted-foreground">
        {isFetching && <Loader />}
        {!hasMore && accumulatedSpvs.length > 0 && <p>No more SPVs to load.</p>}
      </div>

      {/* SPV List Info */}
      {/* {data && data.count > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{accumulatedSpvs.length}</span> of{' '}
            <span className="font-medium text-foreground">{data.count}</span> SPVs
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ShareholderRegister;
