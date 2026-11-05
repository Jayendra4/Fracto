import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import {
  useGetPaymentRequestsQuery,
  useUpdatePaymentRequestStatusMutation,
} from '@/store/api/paymentRequestApi';
import { PaymentRequest } from '@/types';
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

export function DepositRequestTab() {
  const canApprove = useHasPermission('deposit_request.approve');
  const canReject = useHasPermission('deposit_request.reject');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [screenshotZoomOpen, setScreenshotZoomOpen] = useState(false);
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalRemark, setApprovalRemark] = useState('');
  const [validationError, setValidationError] = useState('');

  // Filter and pagination states
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch payment requests
  const {
    data: requestsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPaymentRequestsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      requestType: 'Deposit',
      search: debouncedSearch || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    },
    {
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
    }
  );

  const [updateRequestStatus, { isLoading: isUpdating }] = useUpdatePaymentRequestStatusMutation();

  const handleApproveClick = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
    setApprovalRemark('');
  };

  const handleRejectClick = (request: PaymentRequest) => {
    setSelectedRequest(request);
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
    if (!selectedRequest) return;
    try {
      await updateRequestStatus({
        id: selectedRequest.id,
        status: 'Approved',
        remark: approvalRemark.trim(),
      }).unwrap();
      const displayName = selectedRequest.account
        ? `${selectedRequest.account.firstname || ''} ${selectedRequest.account.lastname || ''}`.trim()
        : selectedRequest.name || 'User';
      toast.success(
        `Deposit request of ₹${selectedRequest.amount} by ${displayName} approved successfully.`
      );
      refetch();
      setApproveModalOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to approve deposit request');
      console.error(err);
    }
  };

  const submitRejection = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      setValidationError('Rejection reason is required.');
      return;
    }

    try {
      await updateRequestStatus({
        id: selectedRequest.id,
        status: 'Rejected',
        remark: rejectionReason.trim(),
      }).unwrap();
      const displayName = selectedRequest.account
        ? `${selectedRequest.account.firstname || ''} ${selectedRequest.account.lastname || ''}`.trim()
        : selectedRequest.name || 'User';
      toast.success(
        `Deposit request of ₹${selectedRequest.amount} by ${displayName} rejected successfully.`
      );
      refetch();
      setRejectModalOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reject deposit request');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Approved' || status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-455 border border-emerald-500/25">
          Approved
        </span>
      );
    }
    if (status === 'Rejected' || status === 'Failed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-white border border-red-500/25">
          Rejected
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
  if (isError) return <div className="p-6 text-red-500">Failed to load deposit requests</div>;

  const requests = requestsResponse?.data || [];
  const totalCount = requestsResponse?.total || 0;
  const pageCount = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="animate-fade-in relative">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Deposit Requests
        </h2>
        <p className="text-slate-400">
          Review and approve manual deposit requests uploaded by users.
        </p>
      </div>

      <Card className="bg-slate-900/50 mt-6 border-slate-800/80">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-white font-semibold">
                Deposit Requests Queue
              </CardTitle>
              <CardDescription className="text-slate-400">
                Verify user details, UTR number, and screenshot.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative w-full max-w-xs sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search requests..."
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
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
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
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Number</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">UTR Number</th>
                  <th className="px-4 py-3">Screenshot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No deposit requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => {
                    const isPending = request.status === 'Pending';

                    return (
                      <tr key={request.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white text-[14px]">
                          {request.account
                            ? `${request.account.firstname || ''} ${request.account.lastname || ''}`.trim()
                            : request.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-[14px]">
                          {request.account?.email || request.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-[14px]">
                          {request.account?.mobile ||
                            request.account?.phone ||
                            request.mobile ||
                            '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-355 text-[14px] font-semibold text-emerald-400">
                          ₹{request.amount}
                        </td>
                        <td className="px-4 py-3 text-[14px] font-mono text-slate-300">
                          {request.utrNumber || '—'}
                        </td>
                        <td className="px-4 py-3 text-[14px]">
                          {request.screenshot ? (
                            <div
                              onClick={() => handleScreenshotClick(request.screenshot!)}
                              className="relative group h-12 w-12 cursor-pointer overflow-hidden rounded border border-slate-700 hover:border-blue-500 transition-colors"
                            >
                              <img
                                src={getImageUrl(request.screenshot)}
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
                        <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canApprove && (
                              <Button
                                onClick={() => handleApproveClick(request)}
                                className="bg-transparent border border-emerald-600 text-emerald-455 hover:bg-emerald-600 hover:text-white font-semibold text-xs h-8 px-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isPending || isUpdating}
                              >
                                Approve
                              </Button>
                            )}
                            {canReject && (
                              <Button
                                onClick={() => handleRejectClick(request)}
                                className="bg-transparent border border-rose-600 text-rose-455 hover:bg-rose-600 hover:text-white font-semibold text-xs h-8 px-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isPending || isUpdating}
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
      {selectedRequest && (
        <>
          <Dialog
            open={approveModalOpen}
            onOpenChange={(open) => {
              if (!open) {
                setApproveModalOpen(false);
                setSelectedRequest(null);
              }
            }}
          >
            <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white font-display">
                  Approve Deposit Request
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Are you sure you want to approve the deposit request of ₹{selectedRequest.amount}{' '}
                  from {selectedRequest.name || 'User'}?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 my-4">
                <Textarea
                  placeholder="Enter remark for approval (optional)..."
                  value={approvalRemark}
                  onChange={(e) => setApprovalRemark(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-600 focus-visible:ring-1 min-h-[100px]"
                />
              </div>
              <DialogFooter className="flex flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setApproveModalOpen(false);
                    setSelectedRequest(null);
                  }}
                  className="font-semibold text-xs h-9 border-slate-800 hover:bg-slate-800 text-slate-300 px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitApproval}
                  disabled={isUpdating}
                  className="font-semibold text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                >
                  Confirm Approve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={rejectModalOpen}
            onOpenChange={(open) => {
              if (!open) {
                setRejectModalOpen(false);
                setSelectedRequest(null);
              }
            }}
          >
            <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white font-display">
                  Reject Deposit Request
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Please provide a reason for rejecting the deposit request of ₹
                  {selectedRequest.amount} from {selectedRequest.name || 'User'}.
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
                    setSelectedRequest(null);
                  }}
                  className="font-semibold text-xs h-9 border-slate-800 hover:bg-slate-800 text-slate-300 px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitRejection}
                  disabled={isUpdating || !rejectionReason.trim()}
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
