import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import Loader from '@/components/common/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Eye,
  Heart,
  MoreHorizontal,
  Receipt,
  ShareIcon,
  TrendingDown,
  XCircle,
  X,
} from 'lucide-react';
import { useGetAssetsInGroupQuery } from '@/store/api/allGroupApi';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateSharedAssetMutation } from '@/store/api/allGroupApi';
import { useFinalizeListingMutation } from '@/store/api/assetsApi';
import { FractionalizeAssetModal } from '@/pages/Asset/FractionalizeAssetModal';
import { useHasPermission } from '@/hooks/redux';

export type GroupAssetRow = {
  id: number;
  assetTitle: string;
  assetType: string;
  assetSubType: string;
  landArea: string;
  marketValue: number;
  location: string;
  status: string;
  assetStatus: string;
  rwaStatus: string;
  fractionalizationStatus: string;
  isSecondaryClubCreated: boolean;
  rwaRequest?: any;
  currentOwnerName: string;
  tokenAmount: number | null;
  sharedAssetId: number;
};

// type AssetStatus = 'Pending' | 'Approved' | 'Rejected';

function GroupActions({ asset }: { asset: GroupAssetRow }) {
  const canApprove = useHasPermission('asset.review_approve');
  const canReject = useHasPermission('asset.review_reject');
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [amountError, setAmountError] = useState('');
  const [reasonError, setReasonError] = useState('');

  const [updateSharedAsset, { isLoading }] = useUpdateSharedAssetMutation();

  const handleSubmit = async () => {
    let isValid = true;

    setAmountError('');
    setReasonError('');

    if (actionType === 'Rejected') {
      if (!reason.trim()) {
        setReasonError('Reject reason is required');
        isValid = false;
      }
    }

    if (!isValid) return;

    try {
      const payload: any = {
        sharedAssetId: asset.sharedAssetId,
        status: actionType,
      };

      if (actionType === 'Rejected') {
        payload.rejectNote = reason;
      } else if (actionType === 'Approved') {
        payload.title = asset.assetTitle;
      }

      await updateSharedAsset(payload).unwrap();

      toast.success('Updated successfully');

      setOpen(false);
      setAmount('');
      setReason('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };
  return (
    <>
      {/* Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuSeparator />

          {canApprove && (
            <DropdownMenuItem
              onClick={() => {
                setActionType('Approved');
                setOpen(true);
              }}
              disabled={
                !(
                  asset?.status === 'Pending' ||
                  asset?.assetStatus?.toUpperCase() === 'DRAFT' ||
                  asset?.assetStatus?.toUpperCase() === 'Rejected'
                )
              }
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Approve
            </DropdownMenuItem>
          )}

          {canApprove && canReject && <DropdownMenuSeparator />}

          {canReject && (
            <DropdownMenuItem
              onClick={() => {
                setActionType('Rejected');
                setOpen(true);
              }}
              disabled={
                !(
                  asset?.status === 'Pending' ||
                  asset?.assetStatus?.toUpperCase() === 'DRAFT' ||
                  asset?.assetStatus?.toUpperCase() === 'Rejected'
                )
              }
            >
              <XCircle className="w-4 h-4 mr-2 text-red-500" />
              Reject
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent preventCloseOnOutsideClick>
          <div className="flex justify-between items-center mb-4 space-y-1">
            <DialogTitle>
              {actionType === 'Approved' ? 'Approve Asset' : 'Reject Asset'}
            </DialogTitle>
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {actionType === 'Approved' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">Are you sure you want to approve this asset?</p>
            </div>
          )}

          {actionType === 'Rejected' && (
            <>
              <Textarea
                placeholder="Enter Reject Reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setReasonError('');
                }}
              />

              {reasonError && <p className="text-red-500 text-xs mt-1">{reasonError}</p>}
            </>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleSubmit} disabled={isLoading}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
function StatusBadge({ status }: { status: string }) {
  if (status === 'Approved')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 rounded-full bg-green-500/10 border-green-500/20">
        <CheckCircle className="w-3 h-3" /> Approved
      </span>
    );

  if (status === 'Rejected')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 rounded-full bg-red-500/10 border-red-500/20">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-500 rounded-full bg-yellow-500/10 border-yellow-500/20">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

export const mapGroupAssetToRow = (item: any): GroupAssetRow => {
  const asset = item?.sharedAsset?.asset;
  const meta = asset?.meta || [];

  const metaObj = Object.fromEntries(meta.map((m: any) => [m.metaKey, m.metaValue]));

  const location = [metaObj.city, metaObj.state, metaObj.country, metaObj.pincode]
    .filter(Boolean)
    .join(', ');

  const rwaRequest = item?.sharedAsset?.rwaRequest || asset?.rwaRequest;
  const rwaStatus = rwaRequest?.status ?? '—';
  const assetStatus = asset?.status ?? '—';
  const fractionalizationStatus = rwaRequest?.fractionalizationStatus ?? '—';

  return {
    id: item.id,
    assetTitle: asset?.assetTitle ?? '—',
    assetType: asset?.assetType ?? '—',
    assetSubType: metaObj.assetSubType ?? '—',
    landArea: metaObj.landArea ?? '—',
    marketValue: Number(metaObj.marketValue ?? 0),
    sharedAssetId: item.sharedAsset?.assetId,
    location,
    status: item?.sharedAsset?.status ?? '—',
    assetStatus,
    rwaStatus,
    fractionalizationStatus,
    isSecondaryClubCreated: item?.isSecondaryClubCreated ?? item?.isSecondaryGroupCreated ?? false,
    rwaRequest,
    tokenAmount: item?.sharedAsset?.tokenAmount ?? null,
    currentOwnerName: asset?.currentOwnerName ?? '—',
  };
};

export function Properties() {
  const canFinalize = useHasPermission('asset.finalize');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [assetStatus, setAssetStatus] = useState<string>('');
  const [rwaStatus, setRwaStatus] = useState<string>('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { id } = useParams();

  const [liveApproveModalOpen, setLiveApproveModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  const [totalFractions, setTotalFractions] = useState<string>('');
  const [pricePerFraction, setPricePerFraction] = useState<string>('');
  const [listingAmount, setListingAmount] = useState<string>('');
  const [marketValue, setMarketValue] = useState<string>('');
  const [liveApproveName, setLiveApproveName] = useState<string>('');

  const [totalFractionsError, setTotalFractionsError] = useState('');
  const [pricePerFractionError, setPricePerFractionError] = useState('');
  const [listingAmountError, setListingAmountError] = useState('');
  const [liveApproveNameError, setLiveApproveNameError] = useState('');

  const [finalizeListing, { isLoading: isFinalizing }] = useFinalizeListingMutation();

  const { data, isLoading, isError, refetch } = useGetAssetsInGroupQuery(
    {
      groupId: Number(id),
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
      AssetStatus: assetStatus && assetStatus !== 'ALL' ? assetStatus : undefined,
      RwaStatus: rwaStatus && rwaStatus !== 'ALL' ? rwaStatus : undefined,
    },
    {
      pollingInterval: 30000,
    }
  );

  const handleLiveApprove = async () => {
    let isValid = true;
    setTotalFractionsError('');
    setPricePerFractionError('');
    setListingAmountError('');
    setLiveApproveNameError('');

    if (!liveApproveName) {
      setLiveApproveNameError('Name is required');
      isValid = false;
    }
    if (!totalFractions) {
      setTotalFractionsError('Total Fractions is required');
      isValid = false;
    }
    if (!pricePerFraction) {
      setPricePerFractionError('Price per Fraction is required');
      isValid = false;
    }
    if (!listingAmount) {
      setListingAmountError('Document Fees is required');
      isValid = false;
    }

    if (!isValid || !selectedAssetId) return;

    const selectedItem = data?.data?.find((d: any) => d?.sharedAsset?.assetId === selectedAssetId);
    const apiSecondaryClubId = selectedItem?.secondaryClubId || Number(id);

    try {
      await finalizeListing({
        assetId: selectedAssetId,
        status: 'Available',
        name: liveApproveName,
        secondaryClubId: apiSecondaryClubId,
        totalFractions: Number(totalFractions),
        pricePerFraction: Number(pricePerFraction),
        listingAmount: Number(listingAmount),
      }).unwrap();

      toast.success('Listing approved successfully');
      refetch();

      setLiveApproveModalOpen(false);
      setSelectedAssetId(null);
      setLiveApproveName('');
      setTotalFractions('');
      setPricePerFraction('');
      setListingAmount('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve listing');
    }
  };

  const totalCount = data?.count || 0;
  const assets: GroupAssetRow[] = data?.data?.map(mapGroupAssetToRow) ?? [];

  const columns: ColumnDef<GroupAssetRow>[] = [
    {
      header: 'S.No',
      cell: ({ row }) => <span>{pageIndex * pageSize + row.index + 1}</span>,
    },
    {
      header: 'Asset Title',
      accessorKey: 'assetTitle',
    },
    {
      header: 'Owner Name',
      accessorKey: 'currentOwnerName',
    },

    {
      header: 'Market Value',
      cell: ({ row }) => `₹${row.original.marketValue.toLocaleString()}`,
    },
    {
      header: 'Asset Status',
      cell: ({ row }) => {
        const status = row.original.assetStatus;
        const assetStatusStyles: Record<string, string> = {
          Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          Available: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          Funded: 'bg-green-500/10 text-green-400 border-green-500/20',
          Exited: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          LegalReviewed: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          ValuationReviewed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          DueDiligence: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          RequestLive: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
          Reviewed: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        };
        const style =
          assetStatusStyles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        const displayStatus = status === 'Available' ? 'Live' : status;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${style} border`}
          >
            {displayStatus}
          </span>
        );
      },
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
          Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          Under_Review: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          LegalRejected: 'bg-red-500/10 text-red-500 border-red-500/20',
          ValuationRejected: 'bg-red-500/10 text-red-500 border-red-500/20',
          DueDiligenceRejected: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        const style = statusStyles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${style} border`}
          >
            {status}
          </span>
        );
      },
    },
    ...(canFinalize
      ? [
          {
            header: 'Live Approve',
            cell: ({ row }: { row: { original: GroupAssetRow } }) => {
              const isRequestLive = row.original.assetStatus === 'RequestLive';

              return isRequestLive ? (
                <Button
                  size="sm"
                  className="h-8 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setSelectedAssetId(row.original.sharedAssetId);
                    setListingAmount('');
                    setMarketValue(row.original.marketValue?.toString() || '');
                    setLiveApproveModalOpen(true);
                  }}
                >
                  Live Approve
                </Button>
              ) : (
                <span className="text-slate-600">—</span>
              );
            },
          },
        ]
      : []),
    {
      header: 'Token Amount',
      cell: ({ row }) =>
        row.original.tokenAmount ? `₹${Number(row.original.tokenAmount).toLocaleString()}` : '—',
    },
    {
      header: 'Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/asset-list/assets/${row?.original?.sharedAssetId}`)}
          className="flex items-center justify-start w-full"
        >
          <Button
            variant="ghost"
            aria-label="eye "
            size="sm"
            className="w-8 h-8 p-0 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <GroupActions asset={row.original} />,
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
    <>
      <div className="space-y-8">
        <DataTable
          data={assets}
          columns={columns}
          pageSize={pageSize}
          pageIndex={pageIndex}
          searchPlaceholder="Search by property name"
          // pageCount={Math.ceil(totalCount / pageSize)}
          pageCount={Math.ceil(totalCount / pageSize)} // new 6 update
          manualPagination
          // enableFilters={false}
          search={search}
          enableGroupAssetStatusFilter={true}
          groupAssetStatusFilter={assetStatus || 'ALL'}
          onGroupAssetStatusFilterChange={(val) => {
            setAssetStatus(val === 'ALL' ? '' : val);
            setPageIndex(0);
          }}
          enableGroupRwaStatusFilter={true}
          groupRwaStatusFilter={rwaStatus || 'ALL'}
          onGroupRwaStatusFilterChange={(val) => {
            setRwaStatus(val === 'ALL' ? '' : val);
            setPageIndex(0);
          }}
          onSearchChange={handleSearchChange}
          onPaginationChange={(updater) => {
            const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

            setPageIndex(next.pageIndex);
            setPageSize(next.pageSize);
          }}
        />
      </div>

      <Dialog
        open={liveApproveModalOpen}
        onOpenChange={(open) => {
          setLiveApproveModalOpen(open);
          if (!open) {
            setTotalFractionsError('');
            setPricePerFractionError('');
            setLiveApproveNameError('');
            setListingAmountError('');
          }
        }}
      >
        <DialogContent className="max-w-md border border-input bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>Live Approve Property</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 my-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                SPV Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter SPV name"
                value={liveApproveName}
                onChange={(e) => {
                  setLiveApproveName(e.target.value);
                  setLiveApproveNameError('');
                }}
                className="bg-slate-950 border-slate-800 text-white"
              />
              {liveApproveNameError && (
                <p className="text-red-500 text-xs mt-1">{liveApproveNameError}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Total Fractions <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onKeyDown={(e) => {
                  if (['-', 'e', 'E', '+', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="0"
                value={totalFractions}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes('.')) val = val.split('.')[0] || '';
                  setTotalFractions(val);
                  setTotalFractionsError('');

                  if (!val || Number(val) === 0) {
                    setPricePerFraction('');
                  } else if (val && Number(val) > 0 && marketValue && Number(marketValue) > 0) {
                    const price = Math.round(Number(marketValue) / Number(val));
                    setPricePerFraction(price.toString());
                    setPricePerFractionError('');
                  }
                }}
                className="bg-slate-950 border-slate-800 text-white"
              />
              {totalFractionsError && (
                <p className="text-red-500 text-xs mt-1">{totalFractionsError}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Price per Fraction <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onKeyDown={(e) => {
                  if (['-', 'e', 'E', '+', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="0"
                value={pricePerFraction}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes('.')) val = val.split('.')[0] || '';
                  setPricePerFraction(val);
                  setPricePerFractionError('');

                  if (!val || Number(val) === 0) {
                    setTotalFractions('');
                  } else if (val && Number(val) > 0 && marketValue && Number(marketValue) > 0) {
                    const fractions = Math.round(Number(marketValue) / Number(val));
                    setTotalFractions(fractions.toString());
                    setTotalFractionsError('');
                  }
                }}
                className="bg-slate-950 border-slate-800 text-white"
              />
              {pricePerFractionError && (
                <p className="text-red-500 text-xs mt-1">{pricePerFractionError}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Market Value</label>
              <Input
                type="number"
                placeholder="0"
                value={marketValue}
                disabled
                onChange={(e) => {
                  const val = e.target.value;
                  setMarketValue(val);

                  if (val && Number(val) > 0 && totalFractions && Number(totalFractions) > 0) {
                    const price = Math.round(Number(val) / Number(totalFractions));
                    setPricePerFraction(price.toString());
                    setPricePerFractionError('');
                  }
                }}
                className="bg-slate-950 border-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Document Fees <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onKeyDown={(e) => {
                  if (['-', 'e', 'E', '+', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="0"
                value={listingAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setListingAmount(val);
                  setListingAmountError('');
                }}
                className="bg-slate-950 border-slate-800 text-white"
              />
              {listingAmountError && (
                <p className="text-red-500 text-xs mt-1">{listingAmountError}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setLiveApproveModalOpen(false);
                setSelectedAssetId(null);
                setTotalFractionsError('');
                setPricePerFractionError('');
                setLiveApproveNameError('');
                setListingAmountError('');
              }}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLiveApprove}
              disabled={isFinalizing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
