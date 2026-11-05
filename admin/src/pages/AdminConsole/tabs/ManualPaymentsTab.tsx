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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks';
import { useHasPermission } from '@/hooks/redux';

export function ManualPaymentsTab() {
  const canApprove = useHasPermission('manual_payment.approve');
  const canReject = useHasPermission('manual_payment.reject');
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

  const handleApproveClick = (payment: ManualPayment) => {
    setSelectedPayment(payment);
    setApproveModalOpen(true);
  };

  const handleRejectClick = (payment: ManualPayment) => {
    setSelectedPayment(payment);
    setRejectModalOpen(true);
    setRejectionReason('');
    setValidationError('');
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';

    // Handle relative path prefixing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `https://fracto-api-lugr.onrender.com${cleanPath}`;
    }

    // Replace localhost directly with the staging domain
    if (url.includes('localhost')) {
      return url.replace(/^https?:\/\/[^\/]+/, 'https://fracto-api-lugr.onrender.com');
    }

    return url;
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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
          Paid
        </span>
      );
    }
    if (status === 'Failed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-white border border-red-500/25">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
        Pending
      </span>
    );
  };

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load manual payments</div>;

  const res = paymentsResponse as any;

  const rawPayments: ManualPayment[] = Array.isArray(res)
    ? res
    : res?.data || res?.items || res?.result || [];

  const apiTotal = res?.total ?? res?.count ?? res?.totalCount ?? res?.totalItems;

  const isClientSideSlice = rawPayments.length > pageSize;

  let totalCount = apiTotal;
  if (totalCount === undefined) {
    if (isClientSideSlice) {
      totalCount = rawPayments.length;
    } else {
      totalCount = pageIndex * pageSize + rawPayments.length;
    }
  }

  let pageCount = Math.ceil(totalCount / pageSize) || 1;
  if (!isClientSideSlice && apiTotal === undefined && rawPayments.length === pageSize) {
    pageCount = pageIndex + 2;
  }

  const payments = isClientSideSlice
    ? rawPayments.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
    : rawPayments;

  return (
    <div className="animate-fade-in relative">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Manual Payments
        </h2>
        <p className="text-slate-400">
          Review and approve manual/offline payments uploaded by users for asset fraction purchases.
        </p>
      </div>

      <Card className="bg-slate-900/50 mt-6 border-slate-800/80">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-white font-semibold">
                Manual Payment Approvals Queue
              </CardTitle>
              <CardDescription className="text-slate-455">
                Verify user transaction screenshots and approve/reject payments.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative w-full max-w-xs sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by payer info..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageIndex(0);
                  }}
                  className="w-full pl-8 bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-9"
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
          <div className="overflow-x-auto border-b border-slate-800/50">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Asset Name</th>
                  <th className="px-4 py-3">Payer Info</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Screenshot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No manual payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => {
                    const isPending = payment.paymentStatus === 'Pending';

                    return (
                      <tr key={payment.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white text-[14px]">
                          {payment.sharedAsset?.asset?.assetTitle || '—'}
                        </td>
                        <td className="px-4 py-3 text-[14px]">
                          <div className="font-medium text-white">{payment.payerName}</div>
                          <div className="text-xs text-slate-400">{payment.payerEmail}</div>
                          <div className="text-xs text-slate-500">{payment.payerMobile}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-355 text-[14px] font-semibold text-emerald-400">
                          ₹{payment.amountPaid}
                        </td>
                        <td className="px-4 py-3 text-[14px]">
                          {payment.paymentScreenshot ? (
                            <div
                              onClick={() => handleScreenshotClick(payment.paymentScreenshot)}
                              className="relative group h-12 w-12 cursor-pointer overflow-hidden rounded border border-slate-700 hover:border-blue-500 transition-colors"
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
                            <span className="text-slate-500">No image</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(payment.paymentStatus)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canApprove && (
                              <Button
                                onClick={() => handleApproveClick(payment)}
                                className="bg-transparent border border-emerald-600 text-emerald-450 hover:bg-emerald-600 hover:text-white font-semibold text-xs h-8 px-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isPending || isReviewing}
                              >
                                Approve
                              </Button>
                            )}
                            {canReject && (
                              <Button
                                onClick={() => handleRejectClick(payment)}
                                className="bg-transparent border border-rose-600 text-rose-455 hover:bg-rose-600 hover:text-white font-semibold text-xs h-8 px-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isPending || isReviewing}
                              >
                                Reject
                              </Button>
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
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-slate-400 px-2 font-medium">
                Page {pageIndex + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200"
                onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                disabled={pageIndex >= pageCount - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200"
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
            confirmLabel="Approve"
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
            <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white font-display">
                  Reject Payment
                </DialogTitle>
                <DialogDescription className="text-slate-405 text-sm mt-2 leading-relaxed">
                  Please provide a reason for rejecting the manual payment of ₹
                  {selectedPayment.amountPaid} from {selectedPayment.payerName}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 my-4">
                <Textarea
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setValidationError('');
                  }}
                  className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-600 focus-visible:ring-1 min-h-[100px]"
                />
                {validationError && (
                  <p className="text-red-500 text-xs font-semibold">{validationError}</p>
                )}
              </div>
              <DialogFooter className="flex flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedPayment(null);
                  }}
                  className="font-semibold text-xs h-9 border-slate-800 hover:bg-slate-800 text-slate-300 px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitRejection}
                  disabled={isReviewing}
                  className="font-semibold text-xs h-9 bg-red-600 hover:bg-red-700 text-white px-4"
                >
                  Confirm Reject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Zoom Dialog */}
      {screenshotZoomOpen && (
        <Dialog open={screenshotZoomOpen} onOpenChange={(open) => setScreenshotZoomOpen(open)}>
          <DialogContent className="max-w-4xl bg-slate-900 border border-slate-800 text-white p-4 relative">
            <button
              onClick={() => setScreenshotZoomOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogHeader>
              <DialogTitle className="text-white">Payment Screenshot Preview</DialogTitle>
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
