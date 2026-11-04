import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks';
import { useGetAllAssetsQuery, useGetUserUploadedAssetsQuery } from '@/store/api/assetsApi';
import { Asset } from '@/types';
import { useNavigate, useParams } from 'react-router-dom';

export type AssetRow = {
  id: number;
  assetName: string;
  ownerName: string;
  ownerKycStatus: 'Completed' | 'Pending' | 'Rejected';
  rwaStatus: 'Completed' | 'Pending' | 'Rejected';
  status: 'Approved' | 'Pending' | 'Rejected';
  approvalDate: string;
};

export const mapAssetToRow = (asset: Asset): AssetRow => {
  return {
    id: asset.id,

    assetName: asset.assetTitle ?? '—',
    ownerName: asset.currentOwnerName ?? '—',

    ownerKycStatus: asset.isVerified ? 'Completed' : 'Pending',
    rwaStatus: asset.isVerified ? 'Completed' : 'Pending',

    status: asset.isSoldOut ? 'Approved' : 'Pending',

    approvalDate: asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : '—',
  };
};

export function UploadedAssets() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { id } = useParams();

  const { data, isLoading, isError } = useGetUserUploadedAssetsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch || undefined,
    accountId: id,
  });

  const assets: AssetRow[] = data?.data?.map(mapAssetToRow) ?? [];
  const totalCount = data?.total ?? 0;

  const columns: ColumnDef<AssetRow>[] = [
    {
      header: 'Asset Name',
      accessorKey: 'assetName',
      cell: ({ row }) => (
        <span className="block max-w-[140px] truncate">{row.original.assetName}</span>
      ),
    },
    {
      header: 'Owner Name',
      accessorKey: 'ownerName',
    },

    {
      header: 'Asset Owner KYC Status',
      accessorKey: 'ownerKycStatus',
      cell: ({ row }) => {
        const status = row.original.ownerKycStatus;

        const statusStyles: Record<string, string> = {
          Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          Completed: 'bg-green-100 text-green-800 border-green-200',
          // Rejected: 'bg-red-100 text-red-800 border-red-200',
        };

        return (
          <span
            className={`inline-flex items-center capitalize rounded-full border px-3 py-1 text-xs font-medium ${
              statusStyles[status]
            }`}
          >
            {status.toLowerCase()}
          </span>
        );
      },
    },

    {
      header: 'RWA / Compliance Status',
      cell: ({ row }) => {
        const status = row.original.rwaStatus;

        const statusStyles: Record<string, string> = {
          Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          Completed: 'bg-green-100 text-green-800 border-green-200',
          // Rejected: 'bg-red-100 text-red-800 border-red-200',
        };

        return (
          <span
            className={`inline-flex items-center capitalize rounded-full border px-3 py-1 text-xs font-medium ${
              statusStyles[status]
            }`}
          >
            {status.toLowerCase()}
          </span>
        );
      },
    },

    {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;

        const statusStyles: Record<string, string> = {
          Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          Approved: 'bg-green-100 text-green-800 border-green-200',
          Rejected: 'bg-red-100 text-red-800 border-red-200',
        };

        return (
          <span
            className={`inline-flex items-center capitalize rounded-full border px-3 py-1 text-xs font-medium ${
              statusStyles[status]
            }`}
          >
            {status.toLowerCase()}
          </span>
        );
      },
    },

    {
      header: 'Approval Date',
      accessorKey: 'approvalDate',
    },
    {
      header: 'Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/asset-list/asset-detail/${row.original.id}`)}
          className="flex items-center justify-center w-full cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </div>
      ),
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  if (isLoading) {
    return <div className="p-6">Loading assets…</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load assets</div>;
  }

  return (
    <div className="space-y-8">
      <DataTable
        data={assets}
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
              placeholder="Search by asset name..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="w-64 h-8"
            />
          </div>
        }
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
      />
    </div>
  );
}
