import { ColumnDef } from '@tanstack/react-table';
import { Eye, Clock, CheckCircle, ShieldMinus, GitPullRequestDraft } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable';
import { Account } from '@/types';
import { formatDate } from '@/utils';
import { useGetAccountsQuery } from '@/store/api/accountsApi';
import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker, DateRange } from '@/components/common/DateRangePicker';
import Loader from '@/components/common/Loader';

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      }`}
    >
      <div className={`mr-1 h-2 w-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

interface KycStatusBadgeProps {
  status: string | undefined;
  type?: 'KYC' | 'KYB';
}

export function KycStatusBadge({ status, type = 'KYC' }: KycStatusBadgeProps) {
  const label = `${type} ${status || 'N/A'}`;

  if (status === 'Submitted') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
        <Clock className="w-3 h-3" />
        {label}
      </span>
    );
  }

  if (status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3" />
        {label}
      </span>
    );
  }

  if (status === 'Rejected' || status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 rounded-full bg-red-500/10 dark:bg-red-900 dark:text-red-200">
        <ShieldMinus className="w-3 h-3" />
        {label}
      </span>
    );
  }

  if (status === 'Draft') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-300 rounded-full bg-white/10 border border-white/20">
        <GitPullRequestDraft className="w-3 h-3" />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
      {label}
    </span>
  );
}

export function UsersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType } = useParams();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Unified selected user type from query param, defaulting to 'ALL'
  const queryType = new URLSearchParams(location.search).get('type');
  const selectedUserType = queryType || 'ALL';

  // Redirect /users/:userType path parameter to /user-management?type=:userType
  useEffect(() => {
    if (userType) {
      navigate(`/user-management?type=${userType}`, { replace: true });
    }
  }, [userType, navigate]);

  const { data, isLoading, isError } = useGetAccountsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch,
      accountType: selectedUserType === 'ALL' ? undefined : selectedUserType,
      fromDate: dateRange.from?.toISOString(),
      toDate: dateRange.to?.toISOString(),
      kycStatus: statusFilter === 'ALL' ? undefined : (statusFilter as any),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPageIndex(0);
  };

  const handleUserTypeChange = (value: string) => {
    setPageIndex(0);
    setSearch('');
    setStatusFilter('ALL');
    setDateRange({ from: undefined, to: undefined });
    if (value === 'ALL') {
      navigate('/user-management');
    } else {
      navigate(`/user-management?type=${value}`);
    }
  };

  const users: Account[] = data?.data ?? [];
  const totalCount = data?.count ?? 0;

  const columns: ColumnDef<Account>[] = [
    {
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;
        const fullName = `${user.firstname} ${user.lastname}`.trim();

        return (
          <div className="flex items-center space-x-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium overflow-hidden
                ${
                  user?.profileImage
                    ? 'border border-primary bg-transparent'
                    : 'bg-primary text-primary-foreground'
                }`}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="profile"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                user?.firstname?.charAt(0).toUpperCase()
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
      cell: ({ row }) => <span className="capitalize">{row.original.mobile}</span>,
    },
    {
      header: 'Type',
      cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
    },

    // KYC column
    {
      id: 'kycStatus',
      header: 'KYC',
      cell: ({ row }: any) => {
        const status =
          row.original.type === 'Company' ? row.original.companyKyc?.kycStatus : row.original.kycStatus;
        return <KycStatusBadge status={status} type="KYC" />;
      },
    },

    // KYB column
    ...(selectedUserType === 'ALL' || selectedUserType === 'Company'
      ? [
          {
            id: 'kybStatus',
            header: 'KYB',
            cell: ({ row }: any) => {
              const status =
                row.original.type === 'Company' ? row.original.companyKyc?.kybStatus : undefined;
              return <KycStatusBadge status={status} type="KYB" />;
            },
          },
        ]
      : []),

    {
      header: 'Status',
      cell: ({ row }) => <StatusBadge isActive={row.original.status === 'Active'} />,
    },
    {
      header: 'Created',
      cell: ({ row }) => <span>{formatDate(new Date(row.original.createdAt))}</span>,
    },
    {
      header: 'View Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/users/${row.original.type}/detail/${row.original.id}`)}
          className="flex justify-center cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </div>
      ),
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

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col flex-wrap w-full gap-4 md:items-center md:flex-row md:gap-10">
        <h2 className="text-xl font-bold tracking-tight lg:text-2xl xl:text-3xl">User Listing</h2>
      </div>

      <DataTable
        data={users}
        columns={columns}
        pageSize={pageSize}
        pageIndex={pageIndex}
        pageCount={Math.ceil(totalCount / pageSize)}
        manualPagination
        onDelete={handleDelete}
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
            <Select value={selectedUserType} onValueChange={handleUserTypeChange}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                <SelectItem value="CorporateInvestor">Investors</SelectItem>
                <SelectItem value="AssetOwner">Asset Owner</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
                <SelectItem value="Broker">Broker</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
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
