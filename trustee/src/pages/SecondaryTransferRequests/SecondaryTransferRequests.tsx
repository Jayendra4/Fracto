import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Loader from '@/components/common/Loader';
import { useDebounce } from '@/hooks';
import {
  useGetMarketplaceMatchesQuery,
  useApproveMarketplaceMatchMutation,
  useRejectMarketplaceMatchMutation,
  MarketplaceMatch,
} from '@/store/api/secondaryTransferApi';

const SecondaryTransferRequests = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Pagination states referencing Document Vault
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);

  const [expandedTrades, setExpandedTrades] = useState<Record<number, boolean>>({});

  const toggleExpand = (tradeId: number) => {
    setExpandedTrades((prev) => ({
      ...prev,
      [tradeId]: !prev[tradeId],
    }));
  };

  // Reset pagination on search change
  useEffect(() => {
    setSkip(0);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useGetMarketplaceMatchesQuery({
    skip,
    take,
    search: debouncedSearch || undefined,
  });

  const settlements = data?.data || [];
  const totalCount = data?.count || 0;
  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.ceil(totalCount / take) || 1;

  const [approveMatch, { isLoading: isApproving }] = useApproveMarketplaceMatchMutation();
  const [rejectMatch, { isLoading: isRejecting }] = useRejectMarketplaceMatchMutation();
  const [approvingMatchId, setApprovingMatchId] = useState<number | null>(null);
  const [rejectingMatchId, setRejectingMatchId] = useState<number | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [rejectModalConfig, setRejectModalConfig] = useState<{
    isOpen: boolean;
    matchId: number;
    title: string;
    description: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApproveMatch = async (matchId: number) => {
    setApprovingMatchId(matchId);
    try {
      await approveMatch(matchId).unwrap();
      toast.success('Transfer approved successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to approve transfer');
    } finally {
      setApprovingMatchId(null);
    }
  };

  const handleRejectMatch = async (matchId: number, reason: string) => {
    setRejectingMatchId(matchId);
    try {
      await rejectMatch({ matchId, rejectionReason: reason }).unwrap();
      toast.success('Transfer rejected successfully');
      setRejectModalConfig(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reject transfer');
    } finally {
      setRejectingMatchId(null);
    }
  };

  const openApproveModal = (request: MarketplaceMatch) => {
    setModalConfig({
      isOpen: true,
      title: 'Approve Transfer?',
      description: `This approves the transfer of ${request.matchedQuantity} unit(s) of ${request.assetTitle} from ${request.ask.seller || '-'} to ${request.bid.buyer || '-'}. The shareholder register will update immediately.`,
      onConfirm: () => handleApproveMatch(request.id),
    });
  };

  const openRejectModal = (request: MarketplaceMatch) => {
    setRejectionReason('');
    setRejectModalConfig({
      isOpen: true,
      matchId: request.id,
      title: 'Reject Transfer?',
      description: `Please provide a reason for rejecting the transfer of ${request.matchedQuantity} unit(s) of ${request.assetTitle} from ${request.ask.seller || '-'} to ${request.bid.buyer || '-'}.`,
    });
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#FFF1DC] text-[#C47700] dark:bg-[#3A2A12] dark:text-[#F0A83B]';

      case 'Approved':
        return 'bg-[#E3F4E9] text-[#16834A] dark:bg-[#143521] dark:text-[#62C58A]';

      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Secondary Transfer Request</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review SHA restrictions before approving shareholder-to-shareholder transfers.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset title, buyer, or seller name..."
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Loader />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          Failed to load secondary transfer requests. Please try again.
        </div>
      ) : settlements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground bg-muted/5">
          No secondary transfer requests found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {settlements.map((request) => {
              const isExpanded = !!expandedTrades[request.id];
              return (
                <div
                  key={request.id}
                  className="overflow-hidden rounded-xl border border-border bg-background hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div
                      onClick={() => toggleExpand(request.id)}
                      className={`flex items-center justify-between gap-4 px-5 pb-4 pt-4 bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors ${
                        isExpanded ? 'border-b border-border' : ''
                      }`}
                    >
                      <h2 className="text-sm font-bold text-foreground">{request.assetTitle}</h2>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </div>

                  {isExpanded && (
                    <div className="px-5 py-2">
                      <div className="flex min-h-[40px] items-center justify-between gap-4 border-b border-border">
                        <span className="text-base text-muted-foreground">Seller</span>
                        <span className="text-base font-medium text-foreground">
                          {request.ask.seller || '-'}
                        </span>
                      </div>

                      <div className="flex min-h-[40px] items-center justify-between gap-4 border-b border-border">
                        <span className="text-base text-muted-foreground">Buyer</span>
                        <span className="text-base font-medium text-foreground">
                          {request.bid.buyer || '-'}
                        </span>
                      </div>

                      <div className="flex min-h-[40px] items-center justify-between gap-4 border-b border-border">
                        <span className="text-base text-muted-foreground">Units</span>
                        <span className="text-base font-medium text-foreground">
                          {request.matchedQuantity}
                        </span>
                      </div>

                      <div className="flex min-h-[40px] items-center justify-between gap-4 border-b border-border">
                        <span className="text-base text-muted-foreground">Price Per Unit</span>
                        <span className="text-base font-medium text-foreground">
                          ₹{Number(request.tradePrice).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex min-h-[40px] items-center justify-between gap-4 border-b border-border">
                        <span className="text-base text-muted-foreground">Total Amount</span>
                        <span className="text-base font-medium text-foreground">
                          ₹{(Number(request.matchedQuantity) * Number(request.tradePrice)).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex min-h-[40px] items-center justify-between gap-4 border-b border-border">
                        <span className="text-base text-muted-foreground">Net Amount</span>
                        <span className="text-base font-medium text-foreground">
                          ₹{(Number(request.matchedQuantity) * Number(request.tradePrice)).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex min-h-[40px] items-center justify-between gap-4 border-b border-border">
                        <span className="text-base text-muted-foreground">Traded At</span>
                        <span className="text-base text-foreground">
                          {new Date(request.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex min-h-[40px] items-center justify-between gap-4">
                        <span className="text-base text-muted-foreground">Settled At</span>
                        <span className="text-base text-foreground">
                          {request.approvedAt
                            ? new Date(request.approvedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="flex flex-wrap gap-2 px-5 pb-5 pt-3 border-t border-border bg-muted/5">
                    <button
                      type="button"
                      disabled={
                        request.status === 'Approved' ||
                        request.status === 'Rejected' ||
                        request.status === 'Matched' ||
                        (isApproving && approvingMatchId === request.id) ||
                        (isRejecting && rejectingMatchId === request.id)
                      }
                      onClick={() => openApproveModal(request)}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApproving && approvingMatchId === request.id && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      Approve Transfer
                    </button>

                    <button
                      type="button"
                      disabled={
                        request.status === 'Approved' ||
                        request.status === 'Rejected' ||
                        request.status === 'Matched' ||
                        (isApproving && approvingMatchId === request.id) ||
                        (isRejecting && rejectingMatchId === request.id)
                      }
                      onClick={() => openRejectModal(request)}
                      className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRejecting && rejectingMatchId === request.id && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      Reject Transfer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Controls referencing Document Vault */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{skip + 1}</span> to{' '}
              <span className="font-medium text-foreground">
                {Math.min(skip + take, totalCount)}
              </span>{' '}
              of <span className="font-medium text-foreground">{totalCount}</span> requests
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Requests per page</p>
                <select
                  value={take}
                  onChange={(e) => {
                    setTake(Number(e.target.value));
                    setSkip(0);
                  }}
                  className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSkip((prev) => Math.max(0, prev - take))}
                  disabled={skip === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSkip((prev) => prev + take)}
                  disabled={skip + take >= totalCount}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      )}

      {modalConfig && (
        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(null)}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          description={modalConfig.description}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      )}

      {rejectModalConfig && rejectModalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setRejectModalConfig(null)}
          />

          <div className="relative z-50 w-full max-w-md rounded-2xl border border-[#27272a] bg-[#141416] p-6 shadow-2xl transition-all">
            <h3 className="text-base font-bold text-white tracking-tight">{rejectModalConfig.title}</h3>

            <p className="mt-3 text-xs leading-relaxed text-[#9898a0]">{rejectModalConfig.description}</p>

            <div className="mt-4">
              <label htmlFor="rejectionReason" className="mb-2 block text-xs font-medium text-gray-300">
                Rejection Reason
              </label>
              <textarea
                id="rejectionReason"
                rows={4}
                className="w-full rounded-md border border-[#27272a] bg-[#1e1e24] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModalConfig(null)}
                className="rounded-lg border border-[#27272a] bg-[#1e1e24] px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-[#2a2a32] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim() || isRejecting}
                onClick={() => handleRejectMatch(rejectModalConfig.matchId, rejectionReason)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRejecting && <Loader2 className="h-3 w-3 animate-spin" />}
                Reject Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondaryTransferRequests;
