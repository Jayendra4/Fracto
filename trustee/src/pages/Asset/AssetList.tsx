import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks';
import { Asset, AssetStatus, RwaNewStatus, RwaStatus } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllAssetsQuery } from '@/store/api/assetsApi';
import { Label } from '@/components/ui/label';
import { DateRange, DateRangePicker } from '@/components/common/DateRangePicker';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

export type AssetRow = {
  id: number;
  assetName: string;
  ownerName: string;
  spvName: string;
  ownerKycStatus: 'Completed' | 'Pending' | 'Rejected';
  rwaStatus?: RwaNewStatus;
  status: string;
  createdAt: string;
  assetType: string;
  newStatus: string;
};

// export enum RwaNewStatus {
//   Submitted = 'ReviewPending',
//   Approved = 'Reviewed',
//   Rejected = 'ReviewReject',
// }

export const mapAssetToRow = (asset: Asset): AssetRow => {
  return {
    id: asset.id,
    assetName: asset.assetTitle ?? '—',
    ownerName: asset.currentOwnerName ?? '—',
    assetType: asset.assetType ?? '—',
    newStatus: asset.rwaRequest?.newRwaStatus ?? asset.newStatus ?? '—',
    ownerKycStatus: asset.isVerified ? 'Completed' : 'Pending',
    rwaStatus: asset.rwaRequest?.newRwaStatus,
    status: asset.status,
    spvName: asset.spvName ?? '—',
    createdAt: asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : '—',
  };
};

export function AssetList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rwaStatus, setRwaStatus] = useState<RwaNewStatus | undefined>(undefined);
  const [assetStatus, setAssetStatus] = useState<string | undefined>('Reviewed');
  const [assetType, setAssetType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const { data, isLoading, isError } = useGetAllAssetsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
      // rwaStatus: rwaStatus,
      assetStatus: assetStatus,
      assetType: assetType === 'All' ? undefined : assetType,
      fromDate: dateRange.from?.toISOString(),
      toDate: dateRange.to?.toISOString(),
      newRWAStatus: rwaStatus,
    },
    {
      pollingInterval: 30000,
    }
  );

  const assets: AssetRow[] = data?.data?.map(mapAssetToRow) ?? [];
  const totalCount = data?.count ?? 0;

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
      header: 'SPV Name',
      accessorKey: 'spvName',
    },
    {
      header: 'Asset Type',
      accessorKey: 'assetType',
      cell: ({ row }) => {
        const type = row.original.assetType;
        return type ? type.replace(/([A-Z])/g, ' $1').trim() : '—';
      },
    },
    // {
    //   header: 'RWA Status',
    //   cell: ({ row }) => {
    //     const status = row.original.newStatus;
    //     const statusStyles: Record<string, string> = {
    //       ReviewPending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    //       Reviewed: 'bg-green-100 text-green-800 border-green-200',
    //       ReviewReject: 'bg-red-100 text-red-800 border-red-200',
    //     };
    //     const statusLabels: Record<string, string> = {
    //       ReviewPending: 'Pending',
    //       Reviewed: 'Approved',
    //       ReviewReject: 'Rejected',
    //     };

    //     return (
    //       <span
    //         className={`inline-flex items-center capitalize rounded-full border px-3 py-1 text-xs font-medium ${
    //           statusStyles[status]
    //         }`}
    //       >
    //         {/* {status ? status.toLowerCase() : '—'} */} {statusLabels[status] ?? status ?? '—'}
    //       </span>
    //     );
    //   },
    // },

    {
      header: 'Asset Status',
      cell: ({ row }) => {
        const status = row.original.status as AssetStatus;
        const assetStatusStyles: Record<AssetStatus, string> = {
          [AssetStatus.Draft]: 'bg-gray-100 text-gray-800 border-gray-200',
          [AssetStatus.Available]: 'bg-blue-100 text-blue-800 border-blue-200',
          [AssetStatus.Funded]: 'bg-green-100 text-green-800 border-green-200',
          [AssetStatus.Exited]: 'bg-purple-100 text-purple-800 border-purple-200',
        };
        return (
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
              assetStatusStyles[status]
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: 'Created Date',
      accessorKey: 'createdAt',
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
    return <Loader />;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load assets</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Asset List</h2>
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
              placeholder="Search assets..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="w-64 h-8"
            />
            {/* <Select
              value={rwaStatus ?? 'All'}
              onValueChange={(v) => {
                setRwaStatus(v === 'All' ? undefined : (v as RwaNewStatus));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="RWA Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All RWA Status</SelectItem>
                <SelectItem value={RwaNewStatus.Submitted}>Submitted</SelectItem>
                <SelectItem value={RwaNewStatus.Approved}>Approved</SelectItem>
                <SelectItem value={RwaNewStatus.Rejected}>Rejected</SelectItem>
              </SelectContent>
            </Select> */}

            <Select
              value={assetType || 'All'}
              onValueChange={(v) => {
                setAssetType(v === 'All' ? undefined : v);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="RealEstate">Real Estate</SelectItem>
                <SelectItem value="Solar">Solar</SelectItem>
                <SelectItem value="Machinery">Machinery</SelectItem>
                <SelectItem value="EVFleet">EV Fleet</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Store">Store</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="IP">IP</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={assetStatus || 'All'}
              onValueChange={(v) => {
                setAssetStatus(v === 'All' ? undefined : v);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Funded">Funded</SelectItem>
                <SelectItem value="Exited">Exited</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
              className="h-8"
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
