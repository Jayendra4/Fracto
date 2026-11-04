import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable';
import { formatDate } from '@/utils';
import { useDebounce } from '@/hooks';
import {
  useGetPaymentRequestsQuery,
  useUpdatePaymentRequestStatusMutation,
} from '@/store/api/paymentRequestApi';

import { PaymentRequest, PaymentRequestStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusActionModal } from './StatusActionModal';
import { DateRange, DateRangePicker } from '@/components/common/DateRangePicker';
import Loader from '@/components/common/Loader';

export function WithdrawRequest() {
  const [search, setSearch] = useState('');
  const [remark, setRemark] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [status, setStatus] = useState<PaymentRequestStatus | undefined>(undefined);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const { data, isLoading, isError } = useGetPaymentRequestsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
      status,
      requestType: 'Withdraw',
      fromDate: dateRange.from?.toISOString(),
      toDate: dateRange.to?.toISOString(),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);

  const [updateStatus, { isLoading: isUpdating }] = useUpdatePaymentRequestStatusMutation();

  const openActionModal = (data: any, action: 'Approved' | 'Rejected') => {
    setSelectedRequest(data);
    setActionType(action);
    setRemark('');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setRemark('');
  };

  const handleConfirm = async (remark: string) => {
    if (!selectedRequest || !actionType) return;

    await updateStatus({
      id: selectedRequest.id,
      status: actionType,
      remark,
    }).unwrap();

    closeModal();
  };

  const requests: PaymentRequest[] = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const columns: ColumnDef<PaymentRequest>[] = [
    {
      header: 'Name',
      cell: ({ row }) => {
        const account = row.original.account;
        return (
          <span>
            {account?.name ||
              `${account?.firstname ?? ''} ${account?.lastname ?? ''}`.trim() ||
              '—'}
          </span>
        );
      },
    },
    {
      header: 'Email',
      cell: ({ row }) => <span>{row.original.account?.email || '—'}</span>,
    },
    {
      header: 'Mobile',
      cell: ({ row }) => <span>{row.original.account?.mobile || '—'}</span>,
    },
    {
      header: 'Amount',
      cell: ({ row }) => <span>₹{row.original.amount}</span>,
    },
    {
      header: 'Method',
      cell: ({ row }) => <span>{row.original.methodType}</span>,
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;

        const statusStyles: Record<string, string> = {
          Pending: ' text-yellow-800 bg-yellow-100 rounded-full  border-yellow-500/20',
          Approved: 'text-green-800 bg-green-100 border-green-500/20',
          Failed: 'text-white rounded-full bg-red-500/10 dark:bg-red-900 border-red-500/20',
        };

        return (
          <span
            className={`inline-flex items-center capitalize rounded-full border px-3 py-1 text-xs font-medium ${
              statusStyles[status]
            }`}
          >
            {status.toLowerCase()}
          </span>
        );
      },
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const handleStatusChange = (value: PaymentRequestStatus | 'ALL') => {
    setStatus(value === 'ALL' ? undefined : value);
    setPageIndex(0);
  };

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <h2 className="text-xl font-bold tracking-tight lg:text-2xl xl:text-3xl">
        Withdraw Requests
      </h2>

      {/* Filters */}
      <DataTable
        data={requests}
        columns={columns}
        pageSize={pageSize}
        pageIndex={pageIndex}
        pageCount={Math.ceil(totalCount / pageSize)}
        manualPagination
        enableFilters={false}
        enableSearch={false}
        filterContent={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by username, email and transaction ID"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="w-64 h-8"
            />
            <Select
              value={
                status === 'Pending'
                  ? 'Pending'
                  : status === 'Approved'
                    ? 'Approved'
                    : status === 'Rejected'
                      ? 'Rejected'
                      : status === 'Failed'
                        ? 'Failed'
                        : 'All'
              }
              onValueChange={(v) => {
                const mapping: any = {
                  Pending: 'Pending',
                  Approved: 'Approved',
                  Rejected: 'Rejected',
                  Failed: 'Failed',
                  All: undefined,
                };
                handleStatusChange(mapping[v]);
              }}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
              className="h-8"
            />
          </div>
        }
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

          if (next.pageSize !== pageSize) {
            setPageIndex(0);
          } else {
            setPageIndex(next.pageIndex);
          }
          setPageSize(next.pageSize);
        }}
      />

      <StatusActionModal
        open={!!selectedRequest}
        onClose={closeModal}
        data={selectedRequest}
        action={actionType!}
        onConfirm={handleConfirm}
        loading={isUpdating}
        remark={remark}
        setRemark={setRemark}
        requestType="Withdraw"
      />
    </div>
  );
}
