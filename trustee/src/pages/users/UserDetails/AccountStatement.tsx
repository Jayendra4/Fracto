import { ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable';
import { DateRange, DateRangePicker } from '@/components/common/DateRangePicker';
import Loader from '@/components/common/Loader';

import { formatDate } from '@/utils';
import { useDebounce } from '@/hooks';
import { useGetAccountStatementQuery } from '@/store/api/accountsApi';

import { PaymentRequest, PaymentRequestStatus } from '@/types';

export function AccountStatement() {
  const { id } = useParams<{ id: string }>();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [status, setStatus] = useState<PaymentRequestStatus | undefined>();

  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetAccountStatementQuery({
    accountId: id,
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch || undefined,
    status,
    fromDate: dateRange.from?.toISOString(),
    toDate: dateRange.to?.toISOString(),
  });

  const transactions: PaymentRequest[] = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  /* -------------------------------- Columns -------------------------------- */

  const columns: ColumnDef<PaymentRequest>[] = [
    {
      header: 'Transaction',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-muted-foreground">{row.original.requestType}</div>
        </div>
      ),
    },

    {
      header: 'Type',
      cell: ({ row }) => {
        const isDeposit = row.original.requestType === 'Deposit';

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              isDeposit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isDeposit ? 'credit' : 'debit'}
          </span>
        );
      },
    },
    {
      header: 'Amount',
      cell: ({ row }) => {
        const isDeposit = row.original.requestType === 'Deposit';
        const amount = Number(row.original.amount);

        return (
          <span className={`font-medium ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
            {isDeposit ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;

        const statusStyles: Record<string, string> = {
          Pending: 'bg-yellow-100 text-yellow-800',
          Approved: 'bg-green-100 text-green-800',
          Rejected: 'bg-red-100 text-red-800',
        };

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              statusStyles[status]
            }`}
          >
            {status.toLowerCase()}
          </span>
        );
      },
    },
    {
      header: 'Screenshot',
      cell: ({ row }) =>
        row.original.screenshot ? (
          <a href={row.original.screenshot} target="_blank" rel="noopener noreferrer">
            <img
              src={row.original.screenshot}
              alt="Screenshot"
              className="w-10 h-10 rounded cursor-pointer hover:opacity-80"
            />
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: 'Date',
      cell: ({ row }) => <span>{formatDate(new Date(row.original.createdAt))}</span>,
    },
  ];

  /* -------------------------------- Handlers -------------------------------- */

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const handleStatusChange = (value: PaymentRequestStatus | 'ALL') => {
    setStatus(value === 'ALL' ? undefined : value);
    setPageIndex(0);
  };

  /* -------------------------------- UI -------------------------------- */

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-8">
      <DataTable
        data={transactions}
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
              placeholder="Search transactions..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="h-8 w-64"
            />
            <div className="flex items-center gap-2">
              <DateRangePicker
                value={dateRange}
                onChange={(range) => {
                  setDateRange(range);
                  setPageIndex(0);
                }}
                placeholder="Select date range"
                className="h-8"
              />
              <Select
                value={
                  status === 'Pending'
                    ? 'Submitted'
                    : status === 'Approved'
                      ? 'Approved'
                      : status === 'Rejected'
                        ? 'Rejected'
                        : 'All'
                }
                onValueChange={(v) => {
                  const mapping: any = {
                    Submitted: 'Pending',
                    Approved: 'Approved',
                    Rejected: 'Rejected',
                    All: undefined,
                  };
                  handleStatusChange(mapping[v]);
                }}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
      />
    </div>
  );
}
