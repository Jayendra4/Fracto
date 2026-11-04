import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import { useGetUserReferredAssetsQuery } from '@/store/api/assetsApi';
import Loader from '@/components/common/Loader';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

export type ReferredPropertyRow = {
  id: number;
  assetOwnerName: string;
  email: string;
  mobile: string;
  city: string;
  finalCommissionPct: string;
  assetOwnerStatus: string;
  assetId: number;
  assetTitle: string;
};

export const mapReferredProperty = (item: any): ReferredPropertyRow => ({
  id: item.id,
  assetId: item.assetId,

  assetOwnerName:
    `${item.assetOwnerDetails?.firstName ?? ''} ${item.assetOwnerDetails?.lastName ?? ''}`.trim() ||
    '—',

  email: item.assetOwnerEmail ?? '—',
  mobile: item.assetOwnerDetails?.mobile ?? '—',
  city: item.propertyDetails?.city ?? '—',
  finalCommissionPct: item.finalCommissionPct ?? '—',
  assetOwnerStatus: item.assetOwnerStatus ?? '—',
  assetTitle: item.propertyDetails?.assetTitle,
});

export default function RefferedProperties() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { id } = useParams();

  const { data, isLoading, isError } = useGetUserReferredAssetsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch || undefined,
    accountId: id,
  });

  const propertiesArray = data?.data ?? [];

  const assets: ReferredPropertyRow[] = propertiesArray.map(mapReferredProperty);

  const totalCount = data?.count ?? 0;


  const columns: ColumnDef<ReferredPropertyRow>[] = [
    {
      header: 'Asset Name',
      accessorKey: 'assetTitle',
    },
    {
      header: 'Asset Owner Name',
      accessorKey: 'assetOwnerName',
    },
    {
      header: 'Owner Email',
      accessorKey: 'email',
    },
    {
      header: 'Owner Mobile',
      accessorKey: 'mobile',
    },

    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Commission (%)',
      cell: ({ row }) => `${row.original.finalCommissionPct}%`,
    },
    {
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.original.assetOwnerStatus === 'Approved'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {row.original.assetOwnerStatus}
        </span>
      ),
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

  if (isLoading) return <Loader />;

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
        search={search}
        searchPlaceholder="Search by asset name, owner name"
        onSearchChange={handleSearchChange}
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
      />
    </div>
  );
}