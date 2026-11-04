import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';

import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import { useGetPaymentRequestsQuery } from '@/store/api/paymentRequestApi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import Loader from '@/components/common/Loader';

export type AssetRow = {
  id: string;
  assetName: string;
  ownerName: string;
  ownerKycStatus: 'Completed' | 'Pending' | 'Rejected';
  rwaStatus: 'Completed' | 'Pending' | 'Rejected';
  status: 'Approved' | 'Pending' | 'Rejected';
  approvalDate: string;
};

export function PropertyList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetPaymentRequestsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch || undefined,
    requestType: 'Deposit',
  });

  const requests: AssetRow[] = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const columns: ColumnDef<AssetRow>[] = [
    {
      header: 'Asset Name',
      accessorKey: 'assetName',
      cell: ({ row }) => (
        <span className="truncate max-w-[120px] block">{row.original.assetName}</span>
      ),
    },
    {
      header: 'Owner Name',
      accessorKey: 'ownerName',
    },
    {
      header: 'Asset Owner KYC Status',
      accessorKey: 'ownerKycStatus',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          {row.original.ownerKycStatus}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </div>
      ),
    },
    {
      header: 'RWA / Compliance Status',
      accessorKey: 'rwaStatus',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          {row.original.rwaStatus}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;

        const styles =
          status === 'Approved'
            ? 'text-green-400'
            : status === 'Pending'
              ? 'text-yellow-400'
              : 'text-red-400';

        return (
          <div className={`flex items-center gap-1 ${styles}`}>
            {status}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </div>
        );
      },
    },
    {
      header: 'Approval Date',
      accessorKey: 'approvalDate',
    },
    {
      header: 'Documents',
      cell: ({ row }) => <Button variant={'outline'}>View Documents</Button>,
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Property List</h2>

      <DataTable
        data={requests}
        columns={columns}
        pageSize={pageSize}
        pageIndex={pageIndex}
        pageCount={Math.ceil(totalCount / pageSize)}
        manualPagination
        enableFilters={false}
        enableSearch={false}
        filterContent={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by property name, owner..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="h-8 w-64"
            />
          </div>
        }
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

          if (next.pageSize !== pageSize) {
            setPageIndex(0);
          } else {
            setPageIndex(next.pageIndex);
          }
          setPageSize(next.pageSize);
        }}
      />
    </div>
  );
}
