import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import Loader from '@/components/common/Loader';
import { useParams } from 'react-router-dom';
import { useGetImmediateSaleListQuery } from '@/store/api/assetsApi';
import { Badge } from '@/components/ui/badge';

type ImmediateSaleRow = {
  id: number;
  assetTitle: string;
  assetType: string;
  pricePerUnit: number;
  units: number;
  totalAmount: number;
  netAmount: number;
  soldTo: string;
  buyerName: string;
  buyerEmail: string;
  tradedAt: string;
};

export function ImmediateSaleList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { propertyId } = useParams();
  const assetId = Number(propertyId);

  const { data, isLoading, isError } = useGetImmediateSaleListQuery(
    {
      assetId,
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
    },
    { skip: !assetId }
  );

  const totalCount = data?.count || 0;

  const rows: ImmediateSaleRow[] =
    data?.data?.map((item) => ({
      id: item.id,
      assetTitle: item.asset?.assetTitle || '—',
      assetType: item.asset?.assetType || '—',
      pricePerUnit: item.pricePerUnit,
      units: item.units,
      totalAmount: item.totalAmount,
      netAmount: item.netAmount,
      soldTo: item.soldTo,
      buyerName: item.buyer?.name || '—',
      buyerEmail: item.buyer?.email || '—',
      tradedAt: item.tradedAt
        ? new Date(item.tradedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—',
    })) || [];

  const columns: ColumnDef<ImmediateSaleRow>[] = [
    {
      header: 'Sr No',
      cell: ({ row }) => pageIndex * pageSize + row.index + 1,
    },
    {
      header: 'Asset Title',
      accessorKey: 'assetTitle',
    },
    {
      header: 'Asset Type',
      accessorKey: 'assetType',
    },
    {
      header: 'Price/Unit',
      cell: ({ row }) => `₹${row.original.pricePerUnit.toLocaleString('en-IN')}`,
    },
    {
      header: 'Units',
      accessorKey: 'units',
    },
    {
      header: 'Total Amount',
      cell: ({ row }) => `₹${row.original.totalAmount.toLocaleString('en-IN')}`,
    },
    {
      header: 'Net Amount',
      cell: ({ row }) => `₹${row.original.netAmount.toLocaleString('en-IN')}`,
    },
    {
      header: 'Sold To',
      cell: ({ row }) => (
        <Badge variant={row.original.soldTo === 'ADMIN' ? 'secondary' : 'default'}>
          {row.original.soldTo}
        </Badge>
      ),
    },
    {
      header: 'Buyer',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-slate-200 text-sm">{row.original.buyerName}</span>
          {row.original.buyerEmail !== '—' && (
            <span className="text-slate-500 text-xs">{row.original.buyerEmail}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Traded At',
      accessorKey: 'tradedAt',
    },
  ];

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load immediate sale list</div>;

  return (
    <div className="space-y-8">
      <DataTable
        data={rows}
        columns={columns}
        pageSize={pageSize}
        pageIndex={pageIndex}
        searchPlaceholder="Search by asset title"
        pageCount={Math.ceil(totalCount / pageSize)}
        manualPagination
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(0);
        }}
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
      />
    </div>
  );
}
