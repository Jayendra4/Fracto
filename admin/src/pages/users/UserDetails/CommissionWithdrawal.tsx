import { useState, useEffect, useMemo } from 'react';
import {
  IndianRupee,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  useGetCommissionPayoutRequestsQuery,
  useReviewPayoutRequestMutation,
} from '@/store/api/brokerApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils';
import { PayoutReviewModal } from './PayoutReviewModal';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/common/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';
import Loader from '@/components/common/Loader';
import { useHasPermission } from '@/hooks/redux';

interface CommissionWithdrawalProps {
  brokerId: number;
}

export function CommissionWithdrawal({ brokerId }: CommissionWithdrawalProps) {
  const canApprove = useHasPermission('broker.commission_withdrawal_approve');
  const canReject = useHasPermission('broker.commission_withdrawal_reject');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Rejected' | 'Pending'>(
    'Pending'
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');
  const [remarks, setRemarks] = useState('');

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetCommissionPayoutRequestsQuery({
    brokerId,
    skip: pageIndex * pageSize,
    take: pageSize,
    status: statusFilter === 'All' ? undefined : statusFilter,
  });

  const [reviewPayout, { isLoading: isReviewing }] = useReviewPayoutRequestMutation();

  useEffect(() => {
    refetch();
  }, [refetch, statusFilter, pageIndex, pageSize]);

  const handleAction = (request: any, action: 'Approved' | 'Rejected') => {
    setSelectedRequest(request);
    setActionType(action);
    setRemarks('');
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      await reviewPayout({
        requestId: selectedRequest.id,
        status: actionType,
        remarks: remarks,
      }).unwrap();

      toast.success(`Request ${actionType} successfully`);
      setModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to process request');
      console.error(error);
    }
  };

  const requestList = response?.data || [];
  const totalCount = response?.count || 0;

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Request ID',
        accessorKey: 'id',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-500">#{getValue() as string}</span>
        ),
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: ({ getValue }) => (
          <span className="text-base font-bold text-white">₹{getValue() as number}</span>
        ),
      },
      {
        header: () => <div className="text-center">Status</div>,
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <div className="text-center">
              <Badge
                className={`px-2 py-1 rounded-full text-[11px] border ${status === 'Approved'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : status === 'Rejected'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}
              >
                {status === 'Approved' && <CheckCircle2 className="inline w-3 h-3 mr-1" />}
                {status === 'Rejected' && <XCircle className="inline w-3 h-3 mr-1" />}
                {status === 'Pending' && <Clock className="inline w-3 h-3 mr-1" />}
                {status}
              </Badge>
            </div>
          );
        },
      },
      {
        header: 'Requested On',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => (
          <div className="text-xs text-slate-400">
            {formatDate(new Date(getValue() as string))}
          </div>
        ),
      },
      {
        header: 'Remarks',
        accessorKey: 'remarks',
        cell: ({ getValue }) => (
          <div className="text-slate-400 text-xs max-w-[200px] truncate">
            {getValue() as string || '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.status === 'Pending' && (canApprove || canReject) ? (
              <div className="flex justify-end gap-2">
                {canApprove && (
                  <Button
                    size="sm"
                    className="px-2 text-white bg-green-600 h-7 hover:bg-green-700"
                    onClick={() => handleAction(row.original, 'Approved')}
                  >
                    Approve
                  </Button>
                )}
                {canReject && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="px-2 h-7"
                    onClick={() => handleAction(row.original, 'Rejected')}
                  >
                    Reject
                  </Button>
                )}
              </div>
            ) : (
              <span className="text-xs italic text-slate-600">No actions</span>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="px-6 py-4 space-y-6">
      {/* Segmented Toggle Control */}
      <div className="flex inline-flex self-start w-full gap-1 p-1 overflow-x-auto border rounded-lg bg-slate-700/50 md:w-auto border-slate-700">
        {['Pending', 'Approved', 'Rejected', 'All'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status as any);
              setPageIndex(0);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 whitespace-nowrap
              ${statusFilter === status
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Header */}
      <div>
        <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <IndianRupee className="w-5 h-5 text-blue-400" />
          Withdrawal Requests
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Manage commission payout requests from this broker
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <div className="p-20 font-medium text-center text-red-400">Failed to load requests.</div>
      ) : (
        <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <DataTable
              data={requestList}
              columns={columns}
              pageCount={Math.ceil(totalCount / pageSize)}
              pageIndex={pageIndex}
              pageSize={pageSize}
              manualPagination={true}
              onPaginationChange={(updater) => {
                const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
                setPageIndex(next.pageIndex);
                setPageSize(next.pageSize);
              }}
              enableSearch={false}
              enableStatusFilter={false}
            />
          </CardContent>
        </Card>
      )}

      <PayoutReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedRequest}
        action={actionType}
        onConfirm={confirmAction}
        loading={isReviewing}
        remarks={remarks}
        setRemarks={setRemarks}
      />
    </div>
  );
}
