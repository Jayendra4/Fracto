import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks';
import { useGetAllAssetsQuery, useGetUserInvestedAssetsQuery } from '@/store/api/assetsApi';
import { Asset } from '@/types';
import { useNavigate, useParams } from 'react-router-dom';

export type InvestedAssetRow = {
  id: number;
  assetName: string;
  investorName: string;
  fractions: number;
  pricePerUnit: number;
  totalAmount: number;
  assetId: number;
  assetType: string;
  investedOn: string;
};

export const mapInvestmentToRow = (item: any): InvestedAssetRow => {
  return {
    id: item.id,
    assetName: item.asset?.assetTitle ?? '—',
    assetType: item.asset?.assetType ?? '—',
    assetId: item?.assetId,
    investorName: `${item.account?.firstname ?? ''} ${item.account?.lastname ?? ''}`.trim() || '—',

    fractions: item.fractions,
    pricePerUnit: Number(item.pricePerUnit),
    totalAmount: Number(item.totalAmount),

    investedOn: new Date(item.createdAt).toLocaleDateString(),
  };
};

export function InvestedAssets() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { id } = useParams();

  const { data, isLoading, isError } = useGetUserInvestedAssetsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch || undefined,
    accountId: id,
  });

  const assets: InvestedAssetRow[] = data?.data?.map(mapInvestmentToRow) ?? [];

  const totalCount = data?.count ?? 0;

  const columns: ColumnDef<InvestedAssetRow>[] = [
    {
      header: 'Asset Name',
      accessorKey: 'assetName',
    },
    {
      header: 'Asset Type',
      accessorKey: 'assetType',
    },
    {
      header: 'Investor',
      accessorKey: 'investorName',
    },
    {
      header: 'Fractions',
      accessorKey: 'fractions',
    },
    {
      header: 'Price / Unit',
      cell: ({ row }) => `₹${row.original.pricePerUnit.toLocaleString()}`,
    },
    {
      header: 'Total Amount',
      cell: ({ row }) => `₹${row.original.totalAmount.toLocaleString()}`,
    },
    {
      header: 'Invested On',
      accessorKey: 'investedOn',
    },
    {
      header: 'Asset Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/asset-list/asset-detail/${row.original.assetId}`)}
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
              placeholder="Search invested assets..."
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
