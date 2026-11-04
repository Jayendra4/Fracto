import { useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Filter,
  Search,
  Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import {
  useGetPaymentRequestsQuery,
  useUpdatePaymentRequestStatusMutation,
} from '@/store/api/paymentRequestApi';
import { PaymentRequest, DateRange } from '@/types';
import { formatDate } from '@/utils';
import Loader from '@/components/common/Loader';
import { useDebounce } from '@/hooks';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Reusable Actions Component
function RequestActions({
  request,
  onAction,
}: {
  request: PaymentRequest;
  onAction: (r: PaymentRequest, type: 'APPROVE' | 'REJECT') => void;
}) {
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
        {/* {request.status === 'Pending' && (
          <>
            <DropdownMenuItem
              onClick={() => onAction(request, 'APPROVE')}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10 focus:bg-green-500/10 focus:text-green-300"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction(request, 'REJECT')}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </DropdownMenuItem>
          </>
        )} */}
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(request.id.toString());
            toast.success('ID Copied');
          }}
          className="hover:bg-slate-700 focus:bg-slate-700"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Reusable Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
    Failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const icons: Record<string, any> = {
    Pending: Clock,
    COMPLETED: CheckCircle,
    Failed: XCircle,
  };

  const Icon = icons[status] || Clock;

  return (
    <Badge
      variant="outline"
      className={`${styles[status] || 'bg-slate-500/10 text-slate-400'} border gap-1`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
}

// Modal Component
function StatusActionModal({
  open,
  onClose,
  data,
  action,
  onConfirm,
  loading,
  remark,
  setRemark,
  requestType,
}: {
  open: boolean;
  onClose: () => void;
  data: PaymentRequest | null;
  action: 'APPROVE' | 'REJECT';
  onConfirm: () => void;
  loading: boolean;
  remark: string;
  setRemark: (s: string) => void;
  requestType: 'Deposit' | 'Withdraw';
}) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onClose()}>
      <DialogContent className="relative border shadow-2xl bg-slate-950 border-slate-800 text-slate-200 sm:max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <XCircle className="w-5 h-5 transition-colors text-slate-400 hover:text-white" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {action === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Review the details below before {action.toLowerCase()}ing this{' '}
            {requestType.toLowerCase()} request.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-900 border-slate-800">
            <span className="text-sm text-slate-400">Requested Amount</span>
            <span className="text-2xl font-bold text-white">₹{data.amount}</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 text-sm">
              <span className="text-slate-500">Method:</span>
              <span className="col-span-2 font-medium text-white uppercase">
                {data.methodType || 'Bank'}
              </span>
            </div>

            {data.methodType === 'Upi' && data.upiAccount ? (
              <div className="grid grid-cols-3 text-sm">
                <span className="text-slate-500">UPI ID:</span>
                <span className="col-span-2 font-mono text-slate-200">{data.upiAccount.upiId}</span>
              </div>
            ) : data.bankAccount ? (
              <>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-slate-500">Bank:</span>
                  <span className="col-span-2 text-slate-200">{data.bankAccount.bankName}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-slate-500">Account:</span>
                  <span className="col-span-2 font-mono text-slate-200">
                    {data.bankAccount.accountNumber}
                    <span className="block text-xs text-slate-500">
                      {data.bankAccount.accountHolderName}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-slate-500">IFSC:</span>
                  <span className="col-span-2 font-mono text-slate-200">
                    {data.bankAccount.ifscCode}
                  </span>
                </div>
              </>
            ) : null}

            {/* Proof Display for Deposits */}
            {(data.proof || data.screenshot) && (
              <div className="mt-2">
                <span className="block mb-1 text-sm text-slate-500">Proof/Screenshot:</span>
                <a
                  href={data.proof || data.screenshot || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block w-full h-32 overflow-hidden border rounded-md border-slate-800 bg-slate-900 group"
                >
                  <img
                    src={data.proof || data.screenshot || ''}
                    alt="Proof"
                    className="object-contain w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                    <span className="px-2 py-1 text-xs font-medium text-white rounded bg-black/60">
                      Click to View
                    </span>
                  </div>
                </a>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remark" className="text-slate-400">
              {action === 'REJECT' ? 'Rejection Reason (Required)' : 'Remark (Optional)'}
            </Label>
            <Textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="bg-slate-900/50 border-input text-white focus:border-primary min-h-[80px]"
              placeholder={
                action === 'REJECT'
                  ? 'e.g. Invalid screenshot, amount mismatch...'
                  : 'Add a note...'
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-input text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || (action === 'REJECT' && !remark.trim())}
            className={
              action === 'APPROVE'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }
          >
            {loading
              ? 'Processing...'
              : action === 'APPROVE'
                ? 'Confirm Approve'
                : 'Reject Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DepositRequest() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [remark, setRemark] = useState('');

  const [updatePaymentRequest, { isLoading: isUpdating }] = useUpdatePaymentRequestStatusMutation();

  const { data, isLoading, isError } = useGetPaymentRequestsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    requestType: 'Deposit',
    status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
    startDate: dateRange.from?.toISOString(),
    endDate: dateRange.to?.toISOString(),
    // search: debouncedSearch,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const requests = data?.data || [];
  const totalCount = data?.total || 0;

  const handleAction = (request: PaymentRequest, type: 'APPROVE' | 'REJECT') => {
    setSelectedRequest(request);
    setActionType(type);
    setRemark('');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
  };

  const handleConfirm = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      await updatePaymentRequest({
        id: selectedRequest.id,
        status: actionType === 'APPROVE' ? 'Approved' : 'Rejected',
        remark: remark, // API uses remark
      }).unwrap();
      toast.success(`Request ${actionType === 'APPROVE' ? 'Approved' : 'Rejected'} Successfully`);
      closeModal();
    } catch (error) {
      toast.error('Failed to update request status');
      console.error(error);
    }
  };

  const columns: ColumnDef<PaymentRequest>[] = [
    {
      header: 'Account Details',
      cell: ({ row }) => {
        const { bankAccount, upiAccount, user, requestType } = row.original;

        if (upiAccount) {
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-white">UPI Payment</span>
              <span className="font-mono text-sm text-slate-300">{upiAccount.upiId}</span>
              <span className="mt-1 text-xs text-slate-500">
                {user?.firstname} {user?.lastname}
              </span>
            </div>
          );
        }

        if (bankAccount) {
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-white">{bankAccount.bankName}</span>
              <div className="flex items-center gap-1 text-sm text-slate-300">
                <span>{bankAccount.accountHolderName}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-400">
                  {bankAccount.accountNumber
                    ?.slice(-4)
                    .padStart(bankAccount.accountNumber.length, '•') || '****'}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium text-white">
              {user?.firstname} {user?.lastname}
            </span>
            <span className="text-xs text-slate-400">{user?.email}</span>
            <span className="text-xs text-slate-500 mt-0.5">ID: {row.original.id}</span>
          </div>
        );
      },
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => (
        <span className="font-medium text-emerald-400">₹{row.original.amount}</span>
      ),
    },
    {
      header: 'Method',
      accessorKey: 'methodType', // Use correct accessor
      cell: ({ row }) => (
        <span className="font-medium text-slate-300">{row.original.methodType || 'Bank'}</span>
      ),
    },
    {
      header: 'Screenshot',
      cell: ({ row }) => {
        const proofUrl = row.original.proof || row.original.screenshot;
        return proofUrl ? (
          <div className="relative w-16 h-10 overflow-hidden border rounded-md cursor-pointer bg-slate-800 border-slate-700 group">
            <a href={proofUrl} target="_blank" rel="noreferrer" className="block w-full h-full">
              <img src={proofUrl} alt="proof" className="object-cover w-full h-full" />
              <div className="absolute inset-0 transition-colors bg-black/20 group-hover:bg-black/0" />
            </a>
          </div>
        ) : (
          <span className="text-xs italic text-slate-500">Pending</span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-xs text-slate-400">
          {formatDate(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => <RequestActions request={row.original} onAction={handleAction} />,
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load deposit requests</div>;

  return (
    <div className="pb-10 space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Deposit Requests</h2>
          <p className="text-slate-400">Manage incoming deposit requests from users.</p>
        </div>
      </div>

      <Card className="px-1 shadow-sm border-slate-800 bg-slate-900/50">
        <CardContent className="p-0">
          <DataTable
            data={requests}
            columns={columns}
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={Math.ceil(totalCount / pageSize)}
            manualPagination
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onTransactionFilterChange={(value) => {
              setStatusFilter(value);
              setPageIndex(0);
            }}
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              setDateRange(range);
              setPageIndex(0);
            }}
            enableTransactionStatusFilter
            onPaginationChange={(updater) => {
              const next =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

              setPageIndex(next.pageIndex);
              setPageSize(next.pageSize);
            }}
          />
        </CardContent>
      </Card>

      <StatusActionModal
        open={!!selectedRequest}
        onClose={closeModal}
        data={selectedRequest}
        action={actionType!}
        onConfirm={handleConfirm}
        loading={isUpdating}
        remark={remark}
        setRemark={setRemark}
        requestType="Deposit"
      />
    </div>
  );
}
