import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import {
  useGetAllAssetsQuery,
  useSwitchToMarketplaceMutation,
  useAdminReviewAssetMutation,
  useFractionalizeAssetMutation,
} from '@/store/api/assetsApi';
import { FractionalizeAssetModal } from '@/pages/Asset/FractionalizeAssetModal';
import Loader from '@/components/common/Loader';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

export function ListingApprovalTab() {
  const navigate = useNavigate();

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [approvedAssetIds, setApprovedAssetIds] = useState<number[]>([]);

  // Fractionalization Modal State
  const [fractionModalOpen, setFractionModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [marketValue, setMarketValue] = useState<number>(0);

  // Filter and pagination states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: assetsResponse,
    isLoading,
    isError,
  } = useGetAllAssetsQuery({
    take: 100,
  });

  const [switchToMarketplace, { isLoading: isSwitching }] = useSwitchToMarketplaceMutation();
  const [adminReviewAsset, { isLoading: isReviewing }] = useAdminReviewAssetMutation();
  const [fractionalizeAsset, { isLoading: isFractionalizing }] = useFractionalizeAssetMutation();

  const handleGoLiveClick = (asset: any) => {
    setSelectedAsset(asset);
    setModalOpen(true);
  };

  const handleConfirmGoLive = async () => {
    if (!selectedAsset) return;
    try {
      await switchToMarketplace(selectedAsset.id).unwrap();
      toast.success(`${selectedAsset.assetTitle} is now Live on the Marketplace`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to take asset live');
      console.error(err);
    } finally {
      setModalOpen(false);
      setSelectedAsset(null);
    }
  };

  const handleApproveClick = (asset: any) => {
    setSelectedAsset(asset);
    setApproveModalOpen(true);
  };

  const submitApproval = async () => {
    if (!selectedAsset) return;
    try {
      await adminReviewAsset({
        assetId: selectedAsset.id,
        status: 'Reviewed',
        newStatus: 'NewReviewed',
      }).unwrap();
      setApprovedAssetIds((prev) => [...prev, selectedAsset.id]);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 7000);
      setApproveModalOpen(false);
      setSelectedAsset(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to approve asset');
      console.error(err);
    }
  };

  const handleRejectClick = (asset: any) => {
    setSelectedAsset(asset);
    setRejectModalOpen(true);
    setRejectionReason('');
    setValidationError('');
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      setValidationError('Rejection reason is required.');
      return;
    }
    if (rejectionReason.trim().length < 10) {
      setValidationError('Rejection reason must be at least 10 characters.');
      return;
    }

    try {
      await adminReviewAsset({
        assetId: selectedAsset.id,
        status: 'Rejected',
        newStatus: 'Rejected',
        rejectionReason: rejectionReason.trim(),
      }).unwrap();
      toast.success(`${selectedAsset.assetTitle} rejected successfully`);
      setRejectModalOpen(false);
      setSelectedAsset(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reject asset');
      console.error(err);
    }
  };

  const handleFractionalize = async (payload: {
    totalFractions: number;
    pricePerFraction: number;
  }) => {
    if (!selectedAssetId) return;
    try {
      await fractionalizeAsset({
        id: selectedAssetId,
        totalFractions: payload.totalFractions,
        pricePerFraction: payload.pricePerFraction,
      }).unwrap();
      toast.success('Asset fractionalized successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to fractionalize asset');
    } finally {
      setFractionModalOpen(false);
      setSelectedAssetId(null);
    }
  };

  const getMarketValue = (metaList?: any[]) => {
    if (!metaList) return '—';
    const metaItem = metaList.find((m) => m.metaKey === 'marketValue');
    return metaItem ? metaItem.metaValue : '—';
  };

  const getStatusBadge = (asset: any) => {
    if (asset.isMarketplace || (asset.status as string) === 'Available') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
          Live
        </span>
      );
    }

    if ((asset.status as string) === 'RequestLive') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
          Request Live
        </span>
      );
    }

    const rwaStatus = asset.rwaRequest?.status;
    const newRwaStatus = asset.rwaRequest?.newRwaStatus;
    const specialRwaStatus =
      rwaStatus === 'LegalReviewed' ||
      rwaStatus === 'ValuationReviewed' ||
      rwaStatus === 'DueDiligence'
        ? rwaStatus
        : newRwaStatus === 'LegalReviewed' ||
            newRwaStatus === 'ValuationReviewed' ||
            newRwaStatus === 'DueDiligence'
          ? newRwaStatus
          : null;

    if (specialRwaStatus) {
      const styles: Record<string, string> = {
        LegalReviewed: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
        ValuationReviewed: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
        DueDiligence: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
      };

      const labels: Record<string, string> = {
        LegalReviewed: 'Legal Reviewed',
        ValuationReviewed: 'Valuation Reviewed',
        DueDiligence: 'Due Diligence',
      };

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${styles[specialRwaStatus]} border`}
        >
          {labels[specialRwaStatus] || specialRwaStatus}
        </span>
      );
    }

    const isApproved =
      (asset.status as string) === 'Reviewed' ||
      (asset.status as string) === 'NewReviewed' ||
      approvedAssetIds.includes(asset.id);
    const isRejected = (asset.status as string) === 'Rejected';
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
          Reviewed
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-white border border-red-500/25">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
        {asset.status || 'Draft'}
      </span>
    );
  };

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load assets</div>;

  const allAssets = assetsResponse?.data || [];

  const filteredAssets = allAssets.filter((asset) => {
    // Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const title = (asset.assetTitle || '').toLowerCase();
      const type = (asset.assetType || '').toLowerCase();
      const owner = (
        asset.currentOwnerName ||
        (asset as any).assetOwner?.name ||
        ''
      ).toLowerCase();

      const matchesSearch =
        title.includes(query) ||
        type.includes(query) ||
        owner.includes(query);

      if (!matchesSearch) return false;
    }

    const rwaStatus = asset.rwaRequest?.status;
    const newRwaStatus = asset.rwaRequest?.newRwaStatus;
    const specialRwaStatus =
      rwaStatus === 'LegalReviewed' ||
      rwaStatus === 'ValuationReviewed' ||
      rwaStatus === 'DueDiligence'
        ? rwaStatus
        : newRwaStatus === 'LegalReviewed' ||
            newRwaStatus === 'ValuationReviewed' ||
            newRwaStatus === 'DueDiligence'
          ? newRwaStatus
          : null;

    const statusForFiltering =
      asset.isMarketplace || (asset.status as string) === 'Available'
        ? 'Live'
        : (asset.status as string) === 'RequestLive'
          ? 'RequestLive'
          : ((specialRwaStatus || asset.status) as string);

    const isApproved =
      statusForFiltering === 'Reviewed' ||
      statusForFiltering === 'NewReviewed' ||
      approvedAssetIds.includes(asset.id);

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'Live')
      return asset.isMarketplace || (asset.status as string) === 'Available';
    if (statusFilter === 'Reviewed')
      return isApproved && !specialRwaStatus && (asset.status as string) !== 'RequestLive';
    if (statusFilter === 'Draft') return statusForFiltering === 'Draft' && !asset.isMarketplace;

    return statusForFiltering === statusFilter && !asset.isMarketplace;
  });

  const totalCount = filteredAssets.length;
  const assets = filteredAssets.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <div className="animate-fade-in relative">
      {/* Success Banner Popup */}
      {showSuccessPopup && (
        <div className="fixed top-20 right-4 z-[9999] max-w-sm w-full bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-2xl animate-fade-in">
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-450 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-emerald-450 font-bold text-sm">Asset Approved</p>
              <p className="text-xs text-emerald-400 font-semibold leading-relaxed">
                This confirms the asset's basic information and allows the Asset Owner to complete
                the detailed asset profile for further review.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="text-slate-400 hover:text-white text-xs align-top font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Listing Approval
        </h2>
        <p className="text-slate-400">
          Final admin sign-off before an asset goes live on the Marketplace. An asset must clear
          every gate first.
        </p>
      </div>

      <Card className="bg-slate-900/50 mt-6 border-slate-800/80">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-white font-semibold">
                Asset Listing Approval Queue
              </CardTitle>
              <CardDescription className="text-slate-455">
                Review and approve pending listings to make them available on the marketplace.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-[220px]">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPageIndex(0);
                  }}
                  className="h-9 pl-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-slate-700"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-9 w-[150px] bg-slate-950 border-slate-800 text-slate-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                  <SelectItem value="ALL">All Asset Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Requested">Requested</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Live">Live</SelectItem>
                  <SelectItem value="LegalReviewed">Legal Reviewed</SelectItem>
                  <SelectItem value="ValuationReviewed">Valuation Reviewed</SelectItem>
                  <SelectItem value="DueDiligence">Due Diligence</SelectItem>
                  <SelectItem value="RequestLive">Request Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-b border-slate-800/50">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Asset Title</th>
                  <th className="px-4 py-3">Asset Type</th>
                  <th className="px-4 py-3">Current Owner</th>
                  <th className="px-4 py-3">Market Value</th>
                  <th className="px-4 py-3">Detail</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Fractionalize</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No assets found.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const canApproveOrReject =
                      (asset.status || 'Draft') === 'Draft' ||
                      (asset.status as string) === 'Rejected';

                    return (
                      <tr key={asset.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white text-[14px]">
                          {asset.assetTitle}
                        </td>
                        <td className="px-4 py-3 text-slate-350 text-[14px]">{asset.assetType}</td>
                        <td className="px-4 py-3 text-slate-355 text-[14px]">
                          {asset.currentOwnerName || (asset as any).assetOwner?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-355">{getMarketValue(asset.meta)}</td>
                        <td className="px-4 py-3 text-[14px]">
                          <span
                            onClick={() => navigate(`/listing-approval/assets/${asset.id}`)}
                            className="text-primary hover:underline cursor-pointer text-xs font-semibold"
                          >
                            View
                          </span>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(asset)}</td>
                        <td className="px-4 py-3 text-[14px]">
                          {asset.isSecondaryClubCreated === true ? (
                            <Button
                              size="sm"
                              className="h-8 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                              disabled={
                                isFractionalizing ||
                                asset.rwaRequest?.fractionalizationStatus === 'Completed'
                              }
                              onClick={() => {
                                setSelectedAssetId(asset.id);
                                setFractionModalOpen(true);
                                const val = getMarketValue(asset.meta);
                                setMarketValue(Number(val) || 0);
                              }}
                            >
                              Fractionalize
                            </Button>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {!(asset.isMarketplace || (asset.status as string) === 'Available') && (
                              <>
                                <Button
                                  onClick={() => handleApproveClick(asset)}
                                  className="bg-transparent border border-emerald-600 text-emerald-450 hover:bg-emerald-600 hover:text-white font-semibold text-xs h-8 px-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!canApproveOrReject || isReviewing}
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleRejectClick(asset)}
                                  className="bg-transparent border border-rose-600 text-rose-455 hover:bg-rose-600 hover:text-white font-semibold text-xs h-8 px-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!canApproveOrReject || isReviewing}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {(asset.isMarketplace || (asset.status as string) === 'Available') && (
                              <span className="text-emerald-455 font-semibold text-xs flex items-center pr-2">
                                Live
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-xs font-medium text-slate-400">Rows per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-8 w-[70px] bg-slate-900/50 border-slate-800 text-slate-200">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top" className="bg-slate-950 border-slate-800 text-slate-200">
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                aria-label="First page"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                aria-label="Previous page"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex w-[100px] items-center justify-center text-xs font-medium text-slate-400">
                Page {pageIndex + 1} of {Math.max(1, Math.ceil(totalCount / pageSize))}
              </div>
              <Button
                variant="outline"
                aria-label="Next page"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200"
                onClick={() =>
                  setPageIndex((p) =>
                    Math.min(Math.max(1, Math.ceil(totalCount / pageSize)) - 1, p + 1)
                  )
                }
                disabled={(pageIndex + 1) * pageSize >= totalCount}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                aria-label="Last page"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200"
                onClick={() => setPageIndex(Math.max(0, Math.ceil(totalCount / pageSize) - 1))}
                disabled={(pageIndex + 1) * pageSize >= totalCount}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Go Live Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAsset(null);
        }}
        title="Approve Listing — Go Live?"
        description={`This makes ${selectedAsset?.assetTitle || 'the asset'} visible on the Marketplace to all eligible investors per its access ladder. This is the final gate before public listing.`}
        onConfirm={handleConfirmGoLive}
      />

      {/* Approve Asset Modal */}
      <Dialog
        open={approveModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setApproveModalOpen(false);
            setSelectedAsset(null);
          }
        }}
      >
        <DialogContent className="max-w-md border border-input">
          <DialogHeader>
            <DialogTitle>Approve Asset Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-1 text-sm">
            <div>
              <strong>Asset:</strong> {selectedAsset?.assetTitle}
            </div>
          </div>

          <p className="text-sm text-slate-400 mt-2">
            Are you sure you want to approve this asset listing request?
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              disabled={isReviewing}
              onClick={() => {
                setApproveModalOpen(false);
                setSelectedAsset(null);
              }}
            >
              Cancel
            </Button>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              disabled={isReviewing}
              onClick={submitApproval}
            >
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRejectModalOpen(false);
            setSelectedAsset(null);
            setRejectionReason('');
            setValidationError('');
          }
        }}
      >
        <DialogContent className="max-w-md border border-input">
          <DialogHeader>
            <DialogTitle>Reject Asset Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-1 text-sm">
            <div>
              <strong>Asset:</strong> {selectedAsset?.assetTitle}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">
              Remark <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Reason for rejection (required)"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setValidationError('');
              }}
            />
            {validationError && (
              <p className="text-xs text-red-500 font-medium">{validationError}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              disabled={isReviewing}
              onClick={() => {
                setRejectModalOpen(false);
                setSelectedAsset(null);
                setRejectionReason('');
                setValidationError('');
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={!rejectionReason.trim() || isReviewing}
              onClick={submitRejection}
            >
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <FractionalizeAssetModal
        open={fractionModalOpen}
        onClose={() => {
          setFractionModalOpen(false);
          setSelectedAssetId(null);
        }}
        loading={isFractionalizing}
        marketValue={marketValue}
        onConfirm={handleFractionalize}
      />
    </div>
  );
}
