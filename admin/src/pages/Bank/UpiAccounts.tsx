import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Clock, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/common/DataTable';
import { BankAccount, UpiAccount } from '@/types';
import { formatDate } from '@/utils';
import { useState } from 'react';
import { useDebounce } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { useGetBankAccountsQuery, useToggleBankAccountStatusMutation } from '@/store/api/bankApi';
import { Switch } from '@/components/ui/switch';
import { useGetUpiAccountsQuery, useToggleUpiStatusMutation } from '@/store/api/upiApi';
import { DateRange } from '@/types';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import Loader from '@/components/common/Loader';

interface KycStatusBadgeProps {
  isVerified: boolean;
}

function AccountActions({ account }: { account: BankAccount }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(account.id))}>
          Copy Account ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      }`}
    >
      <span className={`mr-1 h-2 w-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export function KycStatusBadge({ isVerified }: KycStatusBadgeProps) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="h-3 w-3" />
        KYC Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
      <Clock className="h-3 w-3" />
      KYC Pending
    </span>
  );
}

export function UpiAccounts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  // from new 5 update
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  // to new 5 update

  const { data, isLoading, isError } = useGetUpiAccountsQuery({
    search: debouncedSearch,
    // fromDate: dateRange.from?.toISOString(), // new 5 update
    // toDate: dateRange.to?.toISOString(), // new 5 update
  });
  const [toggleStatus, { isLoading: isToggling }] = useToggleUpiStatusMutation();

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };
  const accounts: UpiAccount[] = data ?? [];
  // from new 5 update
  const filteredAccounts = accounts.filter((acc) => {
    if (!dateRange.from || !dateRange.to) return true;

    const created = new Date(acc.createdAt);

    return created >= dateRange.from && created <= dateRange.to;
  });
  // to new 5 update

  const hasActiveUpi = accounts.some((a) => a.isActive);
  const columns: ColumnDef<UpiAccount>[] = [
    {
      header: 'UPI ID',
      cell: ({ row }) => <span className="font-mono">{row.original.upiId}</span>,
    },
    {
      header: 'QR Code',
      cell: ({ row }) =>
        row.original.qrCode ? (
          <img
            src={row.original.qrCode}
            alt="QR"
            className="h-10 w-10 cursor-pointer hover:opacity-80"
            onClick={() => window.open(String(row.original.qrCode), '_blank')}
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const upi = row.original;

        return (
          <Switch
            checked={upi.isActive}
            disabled={isToggling || (!upi.isActive && hasActiveUpi)}
            onCheckedChange={async () => {
              try {
                await toggleStatus({ id: upi.id, isActive: !upi.isActive }).unwrap();
              } catch (err) {
                console.error('Failed to toggle UPI', err);
              }
            }}
          />
        );
      },
    },
    {
      header: 'Created At',
      cell: ({ row }) => <span>{formatDate(new Date(row.original.createdAt))}</span>,
    },
  ];

  const handleDelete = (selectedUsers: UpiAccount[]) => {
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      alert(`${selectedUsers.length} users deleted!`);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load UPI</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">UPI Accounts</h2>
          <p className="text-slate-400">Manage active UPI IDs</p>
        </div>
        <Button onClick={() => navigate('/add-upi')}>Add UPI</Button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-sm overflow-hidden">
        <div className="p-0">
          <DataTable
            data={filteredAccounts}
            columns={columns}
            enableSearch={true}
            search={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search UPI..."
            dateRange={dateRange}
            onDateRangeChange={(range: DateRange | undefined) =>
              setDateRange(range || { from: undefined, to: undefined })
            }
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
