import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Eye, MoreHorizontal, PencilLine } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks';
import { Asset, AssetRow, AssetStatus, AssetType, DateRange, RwaStatus } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useFractionalizeAssetMutation,
  useGetAllAssetsQuery,
  useSwitchToMarketplaceMutation,
} from '@/store/api/assetsApi';
import { Switch } from '@/components/ui/switch';
import Loader from '@/components/common/Loader';
import { FractionalizeAssetModal } from './FractionalizeAssetModal';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

function UserActions({ asset }: { asset: Asset }) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0 hover:bg-slate-700">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-slate-200">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem
          onClick={() => navigate(`/edit-asset/${asset.id}`)}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
        >
          <PencilLine className="w-4 h-4 mr-2" />
          Edit Asset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

export function AssetList() {
  const { userType, id: userId } = useParams();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [fractionModalOpen, setFractionModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<any>(null);
  // const [rwaStatus, setRwaStatus] = useState<RwaStatus | undefined>(RwaStatus.Approved);
  // const [assetStatus, setAssetStatus] = useState<AssetStatus | undefined>(AssetStatus.Draft);
  const [rwaStatus, setRwaStatus] = useState<RwaStatus | undefined>(undefined);
  const [assetStatus, setAssetStatus] = useState<AssetStatus | undefined>(undefined);
  const [assetType, setAssetType] = useState<AssetType>(AssetType.All);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [marketValue, setMarketValue] = useState<any>(null);

  const { data, isLoading, isError } = useGetAllAssetsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch || undefined,
    rwaStatus: rwaStatus,
    assetStatus: assetStatus,
    fromDate: dateRange.from?.toISOString(),
    toDate: dateRange.to?.toISOString(),
    ...(assetType !== 'All' && { assetType: assetType }),
  });

  const assets: AssetRow[] = data?.data?.map(mapAssetToRow) ?? [];
  const totalCount = data?.count ?? 0;

  const [fractionalizeAsset, { isLoading: isFractionalizing }] = useFractionalizeAssetMutation();
  const [switchToMarketplace] = useSwitchToMarketplaceMutation();
  const [switchedAssets, setSwitchedAssets] = useState<Record<number, boolean>>({});

  const availableAssets: ColumnDef<AssetRow>[] = [
    {
      header: 'Initial Price',
      cell: ({ row }) => {
        const price = row.original.initialPricePerFraction;

        if (!price) {
          return <span className="text-slate-500">—</span>;
        }

        return <span className="text-slate-200">₹{Number(price).toLocaleString()}</span>;
      },
    },
    {
      header: 'Current Price',
      cell: ({ row }) => {
        const price = row.original.currentPricePerFraction;

        if (!price) {
          return <span className="text-slate-500">—</span>;
        }

        return <span className="text-slate-200">₹{Number(price).toLocaleString()}</span>;
      },
    },
    {
      header: 'Total Fractions',
      accessorKey: 'totalFractions',
      cell: ({ row }) => <span className="text-slate-300">{row.original.totalFractions}</span>,
    },
    {
      header: 'Sold Fractions',
      accessorKey: 'soldFractions',
      cell: ({ row }) => <span className="text-slate-300">{row.original.soldFractions}</span>,
    },
    {
      header: 'Remaining',
      accessorKey: 'remainingFractions',
      cell: ({ row }) => <span className="text-slate-300">{row.original.remainingFractions}</span>,
    },
  ];

  const draftAssets: ColumnDef<AssetRow> = {
    header: 'Fractionalize',
    cell: ({ row }) => {
      const { rwaStatus, status, id, marketValue } = row.original;

      const canFractionalize = rwaStatus === RwaStatus.Approved && status === AssetStatus.Draft;

      if (!canFractionalize) {
        return <span className="text-slate-600">—</span>;
      }

      return (
        <Button
          size="sm"
          className="h-8 text-xs font-semibold text-white hover:bg-primary/90 text-primary-foreground"
          disabled={isFractionalizing}
          onClick={() => {
            setSelectedAssetId(id);
            setFractionModalOpen(true);
            setMarketValue(marketValue);
          }}
        >
          Fractionalize
        </Button>
      );
    },
  };

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
      header: 'Asset Type',
      accessorKey: 'assetType',
      cell: ({ row }) => <span className="text-slate-300">{row.original.assetType}</span>,
    },
    {
      header: 'RWA Status',
      cell: ({ row }) => {
        const status = row.original.rwaStatus;
        const statusStyles: Record<string, string> = {
          Submitted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          Approved: 'bg-green-500/10 text-green-500 border-green-500/20',
          Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
          LegalReviewed: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
          ValuationReviewed: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          DueDiligence: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        };

        return (
          <Badge variant="outline" className={`${statusStyles[status]} border capitalize`}>
            {status?.toLowerCase()}
          </Badge>
        );
      },
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
      header: 'Created Date',
      accessorKey: 'createdAt',
      cell: ({ row }) => <span className="text-xs text-slate-400">{row.original.createdAt}</span>,
    },
    {
      header: 'Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/asset-list/assets/${row.original.id}`)}
          className="flex items-center justify-center w-full"
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
              onCheckedChange={async () => {
                try {
                  const response = await switchToMarketplace(id).unwrap();
                  toast.dismiss();
                  toast.success(
                    `Marketplace ${isMarketplace ? 'Disabled' : 'Enabled'} successfully`
                  );
                  setSwitchedAssets((prev) => ({ ...prev, [id]: true }));
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
    draftAssets,
    ...(assetStatus !== AssetStatus.Draft ? [...availableAssets] : []),

    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <UserActions asset={row.original} />,
      enableSorting: false,
      enableHiding: false,
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

  const handleFractionalize = async (payload: any) => {
    await fractionalizeAsset({
      id: selectedAssetId,
      totalFractions: payload?.totalFractions,
      pricePerFraction: payload?.pricePerFraction,
    }).unwrap();

    setFractionModalOpen(false);
  };

  return (
    <div className="pb-10 space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Asset List</h2>
          <p className="text-slate-400">Manage your real world assets and fractionalization.</p>
        </div>
      </div>

      <Card className="px-1 shadow-sm bg-slate-900/50">
        <CardContent className="p-0">
          <DataTable
            data={assets}
            columns={columns}
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={Math.ceil(totalCount / pageSize)}
            manualPagination
            search={search}
            onSearchChange={handleSearchChange}
            // Filters
            enableStatusFilter={false} // Custom filters below
            dateRange={dateRange}
            onDateRangeChange={(range) => setDateRange(range)}
            // Pagination
            onPaginationChange={(updater) => {
              const next =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
              setPageIndex(next.pageIndex);
              setPageSize(next.pageSize);
            }}
            // Inject Custom Filters into DataTable Toolbar (if supported) or render above
            renderCustomFilters={() => (
              <>
                <Select
                  value={rwaStatus ?? 'ALL'}
                  onValueChange={(v: RwaStatus | 'ALL') =>
                    setRwaStatus(v === 'ALL' ? undefined : v)
                  }
                >
                  <SelectTrigger className="w-[130px] bg-background border-slate-700 text-slate-200">
                    {/* <SelectValue placeholder="RWA Status" /> */}
                    <SelectValue>
                      {rwaStatus ? rwaStatus : 'RWA Status'} {/* 👈 yeh add karo */}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-background border-slate-700 text-slate-200">
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="LegalReviewed">Legal Reviewed</SelectItem>
                    <SelectItem value="ValuationReviewed">Valuation Reviewed</SelectItem>
                    <SelectItem value="DueDiligence">Due Diligence</SelectItem>
                  </SelectContent>
                </Select>

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
                    <SelectItem value="LegalReviewed">Legal Reviewed</SelectItem>
                    <SelectItem value="ValuationReviewed">Valuation Reviewed</SelectItem>
                    <SelectItem value="DueDiligence">Due Diligence</SelectItem>
                    <SelectItem value="RequestLive">Request Live</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
                  <SelectTrigger className="w-[120px] bg-background border-slate-700 text-slate-200">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-slate-700 text-slate-200">
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="RealEstate">Real Estate</SelectItem>
                    <SelectItem value="Solar">Solar</SelectItem>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          />
        </CardContent>
      </Card>

      {fractionModalOpen && (
        <FractionalizeAssetModal
          open={fractionModalOpen}
          onClose={() => {
            setFractionModalOpen(false);
            setSelectedAssetId(null);
            setMarketValue(null);
          }}
          onConfirm={handleFractionalize}
          marketValue={marketValue}
        />
      )}
    </div>
  );
}
