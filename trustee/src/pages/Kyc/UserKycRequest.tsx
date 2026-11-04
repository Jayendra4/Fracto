import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Eye,
  Clock,
  CheckCircle,
  Trash2,
  ShieldMinus,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

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
import { Account } from '@/types';
import { formatDate } from '@/utils';
import { useGetAccountsQuery } from '@/store/api/accountsApi';
import React, { useState } from 'react';
import { useDebounce } from '@/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { KycRequest, KycStatus, useGetKycAccountsQuery } from '@/store/api/kycApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import Loader from '@/components/common/Loader';

interface KycStatusBadgeProps {
  status: KycStatus;
}

type UserStatus = 'Active' | 'Suspended' | 'Blocked';

function StatusBadge({ status }: { status: UserStatus }) {
  const config: Record<
    UserStatus,
    {
      label: string;
      container: string;
      dot: string;
    }
  > = {
    Active: {
      label: 'Active',
      container: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      dot: 'bg-green-400',
    },
    Suspended: {
      label: 'Suspended',
      container: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      dot: 'bg-yellow-400',
    },
    Blocked: {
      label: 'Blocked',
      container: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      dot: 'bg-red-400',
    },
  };

  const { label, container, dot } = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${container}`}
    >
      <span className={`mr-1 h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function KycStatusBadge({ status }: KycStatusBadgeProps) {
  if (status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3" />
        KYC Approved
      </span>
    );
  }

  if (status === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-200">
        <XCircle className="w-3 h-3" />
        KYC Rejected
      </span>
    );
  }
if (status === 'Submitted') {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
      <Clock className="w-3 h-3" />
      KYC Submitted
    </span>
  );
}
  // Submitted / Pending
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
      <Clock className="w-3 h-3" />
      KYC Pending
    </span>
  );
}

export function UserKycRequest() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<KycStatus | undefined>();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const { data, isLoading, isError } = useGetKycAccountsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch,
      status: status,
      fromDate: dateRange.from?.toISOString(),
      toDate: dateRange.to?.toISOString(),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0); // 👈 always reset to first page
  };
  const totalCount = data?.count ?? data?.total ?? 0;

  // Hybrid pagination: if backend fails to slice and returns full data, handle it on client
  const requests: KycRequest[] =
    data?.data && data.data.length > pageSize
      ? data.data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
      : (data?.data ?? []);

  const columns: ColumnDef<KycRequest>[] = [
    {
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original.account;
        const fullName = `${user.firstname} ${user.lastname}`;

        return (
          <div className="flex items-center space-x-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium overflow-hidden
              ${
                user.profileImage
                  ? 'border border-primary bg-transparent'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {user.profileImage ? (
                <img src={user.profileImage} className="object-cover w-full h-full rounded-full" />
              ) : (
                user.firstname.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },

    {
      header: 'Mobile No.',
      cell: ({ row }) => row.original.account.mobile,
    },

    {
      header: 'Type',
      cell: ({ row }) => row.original.account.type,
    },

    {
      header: 'KYC',
      cell: ({ row }) => <KycStatusBadge status={row.original.status} />,
    },

    {
      header: 'View Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/user-kyc-request/user-kyc-detail/${row.original.account.id}`)}
          className="flex justify-center cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </div>
      ),
    },

    {
      header: 'Created',
      cell: ({ row }) => formatDate(new Date(row.original.account.createdAt)),
    },
  ];

  const handleDelete = (selectedUsers: Account[]) => {
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      alert(`${selectedUsers.length} users deleted!`);
    }
  };
  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load users</div>;
  }

  const handleStatusChange = (value: KycStatus | undefined) => {
    setStatus(value);
    setPageIndex(0);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Kyc Requests</h2>
        </div>
      </div>

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
              placeholder="Search by name, email, mobile..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="w-64 h-8"
            />
            <Select
              value={status || 'All'}
              onValueChange={(v) => handleStatusChange(v === 'All' ? undefined : (v as KycStatus))}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
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
    </div>
  );
}
