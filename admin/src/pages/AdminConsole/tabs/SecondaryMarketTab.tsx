import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import { Asset, AssetRow, AssetStatus } from '@/types';
import { useGetAllAssetsQuery, useSwitchToMarketplaceMutation } from '@/store/api/assetsApi';
import { useHasPermission } from '@/hooks/redux';
import Loader from '@/components/common/Loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const mapAssetToRow = (asset: Asset): AssetRow => {
  const rwaStatus = asset.rwaRequest?.status;
  const newRwaStatus = (asset.rwaRequest as any)?.newRwaStatus;
  const statusSource =
    rwaStatus === 'LegalReviewed' ||
    rwaStatus === 'ValuationReviewed' ||
    rwaStatus === 'DueDiligence'
      ? rwaStatus
      : newRwaStatus === 'LegalReviewed' ||
          newRwaStatus === 'ValuationReviewed' ||
          newRwaStatus === 'DueDiligence'
        ? newRwaStatus
        : null;

  const finalStatus =
    asset.status === 'RequestLive'
      ? AssetStatus.RequestLive
      : asset.status === 'Available' || asset.status === 'Funded' || asset.status === 'Exited'
        ? asset.status
        : statusSource
          ? (statusSource as AssetStatus)
          : asset.status;

  return {
    id: asset.id,
    assetId: asset.assetId,
    marketValue: Number(
      asset?.meta?.find((item) => item.metaKey === 'marketValue')?.metaValue ?? 0
    ),
    assetName: asset.assetTitle ?? '—',
    ownerName: asset.currentOwnerName ?? '—',
    assetType: asset.assetType ?? '—',
    propertyInterest: asset.propertyInterest ?? [],
    ownerKycStatus: asset.isVerified ? 'Completed' : 'Pending',
    rwaStatus: asset.rwaRequest?.status,
    status: finalStatus,
    createdAt: asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : '—',
    totalFractions: asset.totalFractions ?? 0,
    soldFractions: asset.soldFractions ?? 0,
    remainingFractions: asset.remainingFractions ?? 0,
    initialPricePerFraction:
      asset.initialPricePerFraction !== undefined
        ? Number(asset.initialPricePerFraction)
        : asset.price?.initialPricePerFraction !== undefined
          ? Number(asset.price.initialPricePerFraction)
          : undefined,
    currentPricePerFraction:
      asset.currentPricePerFraction !== undefined
        ? Number(asset.currentPricePerFraction)
        : asset.price?.currentPricePerFraction !== undefined
          ? Number(asset.price.currentPricePerFraction)
          : undefined,
    price: asset?.price,
    rwaRequest: asset?.rwaRequest,
    isSoldOut: asset?.isSoldOut,
    isMarketplace: asset?.isMarketplace,
  };
};

export function SecondaryMarketTab() {
  const navigate = useNavigate();
  const canToggleMarketplace = useHasPermission('secondary_marketplace.asset_enable');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Custom Filter: Asset Status
  const [assetStatus, setAssetStatusState] = useState<AssetStatus | undefined>(AssetStatus.Funded);
  const setAssetStatus = (val: AssetStatus | undefined) => {
    setAssetStatusState(val);
    setPageIndex(0);
  };

  // Fetch paginated and filtered assets directly from the backend (server-side)
  const { data, isLoading, isError } = useGetAllAssetsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch || undefined,
    assetStatus: assetStatus,
  });

  const [switchToMarketplace] = useSwitchToMarketplaceMutation();

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

  const paginatedAssets = data?.data?.map(mapAssetToRow) ?? [];
  const totalCount = data?.count ?? 0;

  const columns: ColumnDef<AssetRow>[] = [
    {
      header: 'Asset Name',
      accessorKey: 'assetName',
      cell: ({ row }) => (
        <span className="block max-w-[140px] truncate font-medium text-white">
          {row.original.assetName}
        </span>
      ),
    },
    {
      header: 'Owner Name',
      accessorKey: 'ownerName',
      cell: ({ row }) => <span className="text-slate-300">{row.original.ownerName}</span>,
    },
    {
      header: 'Asset Status',
      cell: ({ row }) => {
        const status = row.original.status as AssetStatus;
        const assetStatusStyles: Record<AssetStatus, string> = {
          [AssetStatus.Draft]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          [AssetStatus.Available]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          [AssetStatus.Funded]: 'bg-green-500/10 text-green-400 border-green-500/20',
          [AssetStatus.Exited]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          [AssetStatus.LegalReviewed]: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          [AssetStatus.ValuationReviewed]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          [AssetStatus.DueDiligence]: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          [AssetStatus.RequestLive]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
        return (
          <Badge variant="outline" className={`${assetStatusStyles[status]} border`}>
            {status}
          </Badge>
        );
      },
    },
    {
      header: 'Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/asset-list/assets/${row.original.id}`)}
          className="flex items-left justify-left w-full"
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
    {
      id: 'marketplace',
      header: 'Marketplace',
      cell: ({ row }) => {
        const { id, isSoldOut, status, isMarketplace } = row.original;
        if (!isSoldOut || status !== AssetStatus.Funded) {
          return <span className="text-slate-600">—</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isMarketplace}
              disabled={!canToggleMarketplace}
              title={
                !canToggleMarketplace
                  ? "You don't have permission to toggle the marketplace listing"
                  : undefined
              }
              onCheckedChange={async () => {
                try {
                  await switchToMarketplace(id).unwrap();
                  toast.dismiss();
                  toast.success(
                    `Marketplace ${isMarketplace ? 'Disabled' : 'Enabled'} successfully`
                  );
                } catch (error: any) {
                  toast.error(error?.data?.message || 'Something went wrong');
                }
              }}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Secondary Marketplace
        </h2>
        <p className="text-slate-400">
          Admin review step for secondary transfer requests, before they go to Trustee for SHA
          checks.
        </p>
      </div>

      <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800/80">
        <CardContent className="p-0">
          <DataTable
            data={paginatedAssets}
            columns={columns}
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={Math.ceil(totalCount / pageSize)}
            manualPagination
            search={search}
            onSearchChange={handleSearchChange}
            enableStatusFilter={false}
            onPaginationChange={(updater) => {
              const next =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
              setPageIndex(next.pageIndex);
              setPageSize(next.pageSize);
            }}
            renderCustomFilters={() => (
              <Select
                value={assetStatus ?? 'ALL'}
                onValueChange={(v: AssetStatus | 'ALL') =>
                  setAssetStatus(v === 'ALL' ? undefined : v)
                }
              >
                <SelectTrigger className="w-[130px] bg-background border-slate-700 text-slate-200">
                  {/* <SelectValue placeholder="Asset Status" /> */}
                  <SelectValue>
                    {assetStatus ? assetStatus : 'Asset Status'} {/* 👈 yeh add karo */}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border-slate-700 text-slate-200">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Funded">Funded</SelectItem>
                  <SelectItem value="Exited">Exited</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
