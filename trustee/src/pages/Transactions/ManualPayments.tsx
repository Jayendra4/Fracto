import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import {
  useGetManualPaymentsQuery,
  useReviewManualPaymentMutation,
  ManualPayment,
} from '@/store/api/manualPaymentApi';
import Loader from '@/components/common/Loader';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search,
  Eye,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks';

export function ManualPayments() {
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [screenshotZoomOpen, setScreenshotZoomOpen] = useState(false);
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [validationError, setValidationError] = useState('');

  // Filter and pagination states
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch payments
  const {
    data: paymentsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetManualPaymentsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      page: pageIndex + 1,
      limit: pageSize,
      pageSize: pageSize,
      search: debouncedSearch || undefined,
      paymentStatus: statusFilter === 'ALL' ? undefined : statusFilter,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [reviewManualPayment, { isLoading: isReviewing }] = useReviewManualPaymentMutation();
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const cleanBase = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    return `${cleanBase}/storage/${url}`;
  };

  const handleScreenshotClick = (url: string) => {
    setSelectedScreenshotUrl(getImageUrl(url));
    setScreenshotZoomOpen(true);
  };

  const submitApproval = async () => {
    if (!selectedPayment) return;
    try {
      await reviewManualPayment({
        interestId: selectedPayment.id,
        paymentStatus: 'Paid',
      }).unwrap();
      toast.success(
        `Payment of ₹${selectedPayment.amountPaid} by ${selectedPayment.payerName} approved successfully.`
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to approve payment');
      console.error(err);
    } finally {
      setSelectedPayment(null);
      setApproveModalOpen(false);
    }
  };

  const submitRejection = async () => {
    if (!selectedPayment) return;
    if (!rejectionReason.trim()) {
      setValidationError('Rejection reason is required.');
      return;
    }

    try {
      await reviewManualPayment({
        interestId: selectedPayment.id,
        paymentStatus: 'Failed',
        rejectionReason: rejectionReason.trim(),
      }).unwrap();
      toast.success(
        `Payment of ₹${selectedPayment.amountPaid} by ${selectedPayment.payerName} rejected successfully.`
      );
      refetch();
      setRejectModalOpen(false);
      setSelectedPayment(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reject payment');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Paid') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
          Paid
        </span>
      );
    }
    if (status === 'Failed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-650 border border-red-500/25">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/25">
        Pending
      </span>
    );
  };

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load manual payments</div>;

  const rawPayments = paymentsResponse?.data || [];
  const totalCount = paymentsResponse?.total || 0;

  const pageCount = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="animate-fade-in relative space-y-4 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight lg:text-2xl xl:text-3xl">
          Manual Payments
        </h2>
        <p className="text-muted-foreground text-sm">
          Review and approve manual/offline payments uploaded by users for asset fraction purchases.
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">
                Manual Payment Approvals Queue
              </CardTitle>
              <CardDescription>
                Verify user transaction screenshots and approve/reject payments.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative w-full max-w-xs sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by payer info..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageIndex(0);
                  }}
                  className="w-full pl-8 h-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border-b border-muted">
            <table className="w-full text-sm text-left text-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-muted">
                <tr>
                  <th className="px-4 py-3">Asset Name</th>
                  <th className="px-4 py-3">Payer Info</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Screenshot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/50">
                {rawPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No manual payments found.
                    </td>
                  </tr>
                ) : (
                  rawPayments.map((payment) => {
                    const isPending = payment.paymentStatus === 'Pending';

                    return (
                      <tr key={payment.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-semibold text-[14px]">
                          {payment.sharedAsset?.asset?.assetTitle || '—'}
                        </td>
                        <td className="px-4 py-3 text-[14px]">
                          <div className="font-medium">{payment.payerName}</div>
                          <div className="text-xs text-muted-foreground">{payment.payerEmail}</div>
                          <div className="text-xs text-muted-foreground/80">
                            {payment.payerMobile}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[14px] font-semibold text-emerald-600">
                          ₹{payment.amountPaid}
                        </td>
                        <td className="px-4 py-3 text-[14px]">
                          {payment.paymentScreenshot ? (
                            <div
                              onClick={() => handleScreenshotClick(payment.paymentScreenshot)}
                              className="relative group h-12 w-12 cursor-pointer overflow-hidden rounded border border-muted hover:border-primary transition-colors"
                            >
                              <img
                                src={getImageUrl(payment.paymentScreenshot)}
                                alt="Screenshot"
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No image</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(payment.paymentStatus)}</td>
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
              <p className="text-xs font-medium text-muted-foreground">Rows per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
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
                className="w-8 h-8 p-0"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-8 h-8 p-0"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2 font-medium">
                Page {pageIndex + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                className="w-8 h-8 p-0"
                onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                disabled={pageIndex >= pageCount - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-8 h-8 p-0"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={pageIndex >= pageCount - 1}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modals */}
      {selectedPayment && (
        <>
          <ConfirmationModal
            isOpen={approveModalOpen}
            onClose={() => {
              setApproveModalOpen(false);
              setSelectedPayment(null);
            }}
            onConfirm={submitApproval}
            title="Approve Manual Payment"
            description={`Are you sure you want to approve the manual payment of ₹${selectedPayment.amountPaid} from ${selectedPayment.payerName}?\nThis action will mark the status as Paid.`}
            confirmText="Approve"
          />

          <Dialog
            open={rejectModalOpen}
            onOpenChange={(open) => {
              if (!open) {
                setRejectModalOpen(false);
                setSelectedPayment(null);
              }
            }}
          >
            <DialogContent className="max-w-md p-6">
              <DialogHeader>
                <DialogTitle>Reject Payment</DialogTitle>
                <div className="text-sm mt-2 leading-relaxed text-muted-foreground">
                  Please provide a reason for rejecting the manual payment of ₹
                  {selectedPayment.amountPaid} from {selectedPayment.payerName}.
                </div>
              </DialogHeader>
              <div className="space-y-4 my-4">
                <Textarea
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setValidationError('');
                  }}
                  className="min-h-[100px]"
                />
                {validationError && (
                  <p className="text-destructive text-xs font-semibold">{validationError}</p>
                )}
              </div>
              <div className="flex flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedPayment(null);
                  }}
                  className="font-semibold text-xs h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitRejection}
                  disabled={isReviewing}
                  className="font-semibold text-xs h-9 bg-destructive hover:bg-destructive/90 text-white px-4"
                >
                  Confirm Reject
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Zoom Dialog */}
      {screenshotZoomOpen && (
        <Dialog open={screenshotZoomOpen} onOpenChange={(open) => setScreenshotZoomOpen(open)}>
          <DialogContent className="max-w-4xl p-4 relative">
            <button
              onClick={() => setScreenshotZoomOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogHeader>
              <DialogTitle>Payment Screenshot Preview</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center mt-2 max-h-[80vh] overflow-auto">
              <img
                src={selectedScreenshotUrl}
                alt="Full Payment Screenshot"
                className="max-h-[70vh] max-w-full object-contain rounded"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
