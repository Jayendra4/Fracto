import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/common/DataTable';
import { DateRange, DateRangePicker } from '@/components/common/DateRangePicker';

import { formatDate } from '@/utils';
import { useDebounce } from '@/hooks';
import { useGetAccountStatementQuery } from '@/store/api/accountsApi';

import { PaymentRequest, PaymentRequestStatus } from '@/types';
import { Label } from '@/components/ui/label';

export function AccountStatement() {
  const { id } = useParams<{ id: string }>();

  // const [search, setSearch] = useState('');
  // const debouncedSearch = useDebounce(search, 300);

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
    // search: debouncedSearch || undefined,
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
          <div className="font-medium">#{row.original.id}</div>
          <div className="text-muted-foreground">{row.original.requestType}</div>
        </div>
      ),
    },
    {
      header: 'Account',
      cell: ({ row }) => {
        const { bankAccount, upiAccount } = row.original;

        if (bankAccount) {
          return (
            <div className="text-sm">
              <div className="font-medium">{bankAccount.bankName}</div>
              <div className="text-muted-foreground">
                {bankAccount.accountHolderName} • {bankAccount.accountNumber}
              </div>
            </div>
          );
        }

        if (upiAccount) {
          return <span>{upiAccount.upiId}</span>;
        }

        return <span className="text-muted-foreground">—</span>;
      },
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

  if (isLoading) return <div className="p-6">Loading account statement…</div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-6">
      {/* Top Bar removed, filters moved to DataTable */}

      {/* Table */}
      <DataTable
        data={transactions}
        columns={columns}
        pageSize={pageSize}
        pageIndex={pageIndex}
        pageCount={Math.ceil(totalCount / pageSize)}
        manualPagination
        enableSearch={false} // AccountStatement didn't have search enabled previously (commented out). Keeping it off.
        enableColumnVisibility={false}
        // Date Range
        dateRange={dateRange}
        onDateRangeChange={(range: DateRange | undefined) => {
          setDateRange(range || { from: undefined, to: undefined });
          setPageIndex(0);
        }}
        // Status Filter
        enableTransactionStatusFilter={true}
        statusFilter={status ?? 'ALL'}
        onTransactionFilterChange={(val) => handleStatusChange(val as PaymentRequestStatus | 'ALL')}
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
      />
    </div>
  );
}
function setSearch(value: string) {
  throw new Error('Function not implemented.');
}
