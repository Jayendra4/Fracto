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
import { BankAccount } from '@/types';
import { formatDate } from '@/utils';
import { useState } from 'react';
import { useDebounce } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { useGetBankAccountsQuery, useToggleBankAccountStatusMutation } from '@/store/api/bankApi';
import { Switch } from '@/components/ui/switch';
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
        <Button variant="ghost" className="w-8 h-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
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
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3" />
        KYC Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
      <Clock className="w-3 h-3" />
      KYC Pending
    </span>
  );
}

export function BankAccounts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  // from new 5 update
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // to new 5 update

  const { data, isLoading, isError } = useGetBankAccountsQuery({
    search: debouncedSearch,
    fromDate: dateRange.from?.toISOString(), // new 5 update
    toDate: dateRange.to?.toISOString(), // new 5 update
  });
  const [toggleStatus, { isLoading: isToggling }] = useToggleBankAccountStatusMutation();

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };
  // const accounts: BankAccount[] = data ?? [];
  // from new 5 update
  const accounts: BankAccount[] =
    data?.filter((account) => {
      if (!dateRange.from || !dateRange.to) return true;

      const created = new Date(account.createdAt);
      return created >= dateRange.from && created <= dateRange.to;
    }) ?? [];
  // to new 5 update

  const columns: ColumnDef<BankAccount>[] = [
    {
      header: 'Account Holder',
      cell: ({ row }) => <span className="font-medium">{row.original.accountHolderName}</span>,
    },
    {
      header: 'Bank Name',
      cell: ({ row }) => <span>{row.original.bankName}</span>,
    },
    {
      header: 'Account Number',
      cell: ({ row }) => <span className="font-mono">{row.original.accountNumber}</span>,
    },
    {
      header: 'IFSC Code',
      cell: ({ row }) => <span className="uppercase">{row.original.ifscCode}</span>,
    },

            {
      header: 'Status',
      cell: ({ row }) => {
        const account = row.original;
        return (
          <Switch
            checked={account.isActive}
            disabled={isToggling || !account.isActive}
            onCheckedChange={async (checked) => {
              try {
                await toggleStatus({
                  id: account.id,
                  isActive: !account.isActive,
                }).unwrap();
              } catch (error) {
                console.error('Failed to update status', error);
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
    // {
    //   id: 'actions',
    //   header: 'Actions',
    //   cell: ({ row }) => <AccountActions account={row.original} />,
    //   enableSorting: false,
    // },
  ];

  const handleDelete = (selectedUsers: BankAccount[]) => {
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      alert(`${selectedUsers.length} users deleted!`);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load Accounts</div>;
  }

  return (
    <div className="p-4 pb-20 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Bank Accounts</h2>
          <p className="text-slate-400">Manage connected bank accounts</p>
        </div>
        <Button onClick={() => navigate('/add-bank-account')}>Add Account</Button>
      </div>

      <div className="overflow-hidden border shadow-sm rounded-xl border-slate-800 bg-slate-900/50">
        <div className="p-0">
          <DataTable
            data={accounts}
            columns={columns}
            enableSearch={true}
            search={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search accounts..."
            dateRange={dateRange}
            onDateRangeChange={(range: DateRange | undefined) =>
              setDateRange(range || { from: undefined, to: undefined })
            }
            onDelete={handleDelete}
            hidePagination={false}
          />
        </div>
      </div>
    </div>
  );
}
