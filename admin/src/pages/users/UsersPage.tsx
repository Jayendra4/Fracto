import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Eye,
  Clock,
  CheckCircle,
  Trash2,
  ShieldMinus,
  ShieldCheck,
  CheckSquare,
  Search,
  GitPullRequestDraft,
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
import { Account, DateRange } from '@/types';
import { formatDate } from '@/utils';
import Loader from '@/components/common/Loader';
import { useGetAccountsQuery, useUpdateUserStatusMutation } from '@/store/api/accountsApi';
import { useHasPermission } from '@/hooks/redux';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface KycStatusBadgeProps {
  isVerified: boolean;
}

function UserActions({ user }: { user: Account }) {
  const [updateStatus, { isLoading }] = useUpdateUserStatusMutation();
  const canActivate = useHasPermission('users.activate');
  const canDeactivate = useHasPermission('users.deactivate');

  const handleStatusUpdate = async (
    payload: { isDeleted?: true } | { status?: 'Active' | 'Blocked' | 'Suspended' }
  ) => {
    try {
      await updateStatus({
        accountId: Number(user.id),
        ...payload,
      }).unwrap();
    } catch (err) {
      console.error('Failed to update user status', err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-8 h-8 p-0 hover:bg-slate-700"
          aria-label="dropdown "
          disabled={isLoading}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-slate-200">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />

        {/* DELETE */}
        <DropdownMenuItem
          onClick={() => handleStatusUpdate({ isDeleted: true })}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete user
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-700" />

        {user.status === 'Active' ? (
          canDeactivate && (
            <>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate({ status: 'Blocked' })}
                className="hover:bg-slate-700 focus:bg-slate-700"
              >
                <ShieldMinus className="w-4 h-4 mr-2" />
                Block
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleStatusUpdate({ status: 'Suspended' })}
                className="hover:bg-slate-700 focus:bg-slate-700"
              >
                <ShieldMinus className="w-4 h-4 mr-2" />
                Suspend
              </DropdownMenuItem>
            </>
          )
        ) : (
          canActivate && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate({ status: 'Active' })}
              className="text-green-400 hover:bg-slate-700 focus:bg-slate-700 focus:text-green-300"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Activate
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type UserStatus = 'Active' | 'Suspended' | 'Blocked';

function StatusBadge({ status }: { status: UserStatus }) {
  const config: Record<
    UserStatus,
    {
      label: string;
      styles: string;
    }
  > = {
    Active: {
      label: 'Active',
      styles: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
    },
    Suspended: {
      label: 'Suspended',
      styles: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
    },
    Blocked: {
      label: 'Blocked',
      styles: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
    },
  };

  const { label, styles } = config[status] || config.Active;

  return (
    <Badge variant="outline" className={`${styles} px-2.5 py-0.5 border`}>
      {label}
    </Badge>
  );
}

export function KycStatusBadge({ status }: { status: string }) {
  if (status === 'Pending') {
    return (
      <Badge variant="outline" className="gap-1 ">
        <Clock className="w-3 h-3" />
        KYC Pending
      </Badge>
    );
  }

  if (status === 'Submitted' || status === 'submitted') {
    return (
      <Badge variant="outline" className="gap-1 text-blue-400 bg-blue-500/10 border-blue-500/20">
        <CheckSquare className="w-3 h-3" />
        KYC Submitted
      </Badge>
    );
  }

  if (status === 'Approved') {
    return (
      <Badge variant="outline" className="gap-1 text-green-400 bg-green-500/10 border-green-500/20">
        <CheckCircle className="w-3 h-3" />
        KYC Approved
      </Badge>
    );
  }

  if (status === 'Rejected' || status === 'rejected') {
    return (
      <Badge variant="outline" className="gap-1 text-red-400 bg-red-500/10 border-red-500/20">
        <ShieldMinus className="w-3 h-3" />
        KYC Rejected
      </Badge>
    );
  }

  if (status === 'Draft') {
    return (
      <Badge variant="outline" className="gap-1 text-white bg-[#8f8c8c21] border-[#8f8f8f]/50">
        <GitPullRequestDraft className="w-3 h-3" />
        KYC Draft
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20">
      {status || 'N/A'}
    </Badge>
  );
}

export function KybStatusBadge({ status }: { status: string }) {
  if (status === 'Draft' || status === 'draft') {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      >
        <Clock className="w-3 h-3" />
        KYB Pending
      </Badge>
    );
  }

  if (status === 'Submitted' || status === 'submitted') {
    return (
      <Badge variant="outline" className="gap-1 text-blue-400 bg-blue-500/10 border-blue-500/20">
        <CheckSquare className="w-3 h-3" />
        KYB Submitted
      </Badge>
    );
  }

  if (status === 'Approved') {
    return (
      <Badge variant="outline" className="gap-1 text-green-400 bg-green-500/10 border-green-500/20">
        <CheckCircle className="w-3 h-3" />
        KYB Approved
      </Badge>
    );
  }

  if (status === 'Rejected' || status === 'rejected') {
    return (
      <Badge variant="outline" className="gap-1 text-red-400 bg-red-500/10 border-red-500/20">
        <ShieldMinus className="w-3 h-3" />
        KYB Rejected
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20">
      {status || 'N/A'}
    </Badge>
  );
}
export function UsersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const canViewBroker = useHasPermission('broker.view');
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { userType } = useParams();

  // Unified User Type filter state
  const [selectedUserType, setSelectedUserType] = useState<string>(() => {
    const typeParam = new URLSearchParams(window.location.search).get('type');
    return userType || typeParam || 'ALL';
  });

  // Sync selected user type when query parameters change
  useEffect(() => {
    const typeParam = new URLSearchParams(location.search).get('type');
    setSelectedUserType(userType || typeParam || 'ALL');
  }, [location.search, userType]);

  // Redirect /users/:userType path parameter to /user-management?type=:userType
  useEffect(() => {
    if (userType) {
      navigate(`/user-management?type=${userType}`, { replace: true });
    }
  }, [userType, navigate]);

  useEffect(() => {
    setPageIndex(0);
    setSearch('');
  }, [selectedUserType]);

  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const { data, isLoading, isError } = useGetAccountsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch,
    accountType: selectedUserType === 'ALL' ? undefined : selectedUserType,
    kycStatus: statusFilter === 'ALL' ? undefined : (statusFilter as any),
    fromDate: dateRange.from?.toISOString(),
    toDate: dateRange.to?.toISOString(),
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const handleUserTypeChange = (value: string) => {
    setPageIndex(0);
    setSearch('');
    if (value === 'ALL') {
      navigate('/user-management');
    } else {
      navigate(`/user-management?type=${value}`);
    }
  };

  //   if (!kycFilter || kycFilter === 'ALL') return true;

  //   // Map DataTable filter values to API/Data values if necessary
  //   // "Draft" -> "Draft"
  //   // "Submitted" -> "Submitted"
  //   // "Verified" -> "Approved" or "Verified"
  //   // "Rejected" -> "Rejected"

  //   if (kycFilter === 'Verified') {
  //     return u.kycStatus === 'Approved' || u.kycStatus === 'Verified';
  //   }

  //   if (kycFilter === 'Draft') {
  //     return u.kycStatus === 'Draft' || !u.kycStatus;
  //   }

  //   return u.kycStatus === kycFilter;
  // });

  // const totalCount = filteredUsers.length;
  // const users = filteredUsers.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const requests = data?.data || [];
  const totalCount = data?.total || 0;

  const columns: ColumnDef<Account>[] = [
    {
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;
        const fullName = `${user.firstname} ${user.lastname}`.trim();
        return (
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-primary p-[2px] shadow-sm">
              <div className="flex items-center justify-center w-full h-full overflow-hidden rounded-full bg-slate-950">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {user?.firstname?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="font-semibold text-white text-[14px]">{fullName}</div>
              <div className="text-xs text-slate-400">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Mobile No.',
      cell: ({ row }) => (
        <span className="capitalize text-slate-300 text-[14px]">{row.original.mobile}</span>
      ),
    },
    {
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize text-slate-300 text-[14px]">{row.original.type}</span>
      ),
    },
    ...(selectedUserType !== 'Company'
      ? [
          {
            id: 'kycStatus',
            header: 'KYC',
            accessorKey: 'kycStatus',
            cell: ({ row }: any) => {
              const status =
                row.original.type === 'Company'
                  ? row.original.companyKyc?.kycStatus
                  : row.original.kycStatus;
              return <KycStatusBadge status={status} />;
            },
          },
        ]
      : []),
    ...(selectedUserType === 'Company'
      ? [
          {
            id: 'kycStatus',
            header: 'KYC',
            accessorKey: 'kycStatus',
            cell: ({ row }: any) => <KycStatusBadge status={row.original.companyKyc?.kycStatus} />,
          },
        ]
      : []),
    ...(selectedUserType === 'ALL' || selectedUserType === 'Company'
      ? [
          {
            id: 'kybStatus',
            header: 'KYB',
            accessorKey: 'kybStatus',
            cell: ({ row }: any) => {
              const status =
                row.original.type === 'Company' ? row.original.companyKyc?.kybStatus : undefined;
              return <KybStatusBadge status={status} />;
            },
          },
        ]
      : []),
    {
      header: 'Details',
      cell: ({ row }) => {
        const isBroker = row?.original?.type === 'Broker';
        const isDisabled = isBroker && !canViewBroker;
        return (
          <div
            onClick={() => {
              if (isDisabled) return;
              navigate(`/users/${row?.original?.type}/detail/${row?.original?.id}`);
            }}
            title={isDisabled ? "You don't have permission to view broker details" : undefined}
            className="flex items-center justify-center w-full"
          >
            <span
              className={
                isDisabled
                  ? 'text-slate-500 cursor-not-allowed text-xs font-semibold opacity-50'
                  : 'text-primary hover:underline cursor-pointer text-xs font-semibold'
              }
            >
              View
            </span>
          </div>
        );
      },
    },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      header: 'Assigned RM',
      cell: () => <span className="text-sm text-slate-400">—</span>,
    },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <UserActions user={row.original} /> },
  ];

  const handleDelete = (selectedUsers: Account[]) => {
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      alert(`${selectedUsers.length} users deleted!`);
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load users</div>;

  return (
    <div className="p-6 pb-20 space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">User Listing</h2>
          <p className="text-slate-400">
            Manage your {selectedUserType === 'ALL' ? 'user' : selectedUserType?.toLowerCase()}{' '}
            accounts.
          </p>
        </div>
        <div className="flex gap-2 p-1 border rounded-lg bg-slate-900/50 border-slate-800">
          <Button
            onClick={() =>
              navigate(
                `/create-user/${selectedUserType === 'ALL' ? 'CorporateInvestor' : selectedUserType}`
              )
            }
            aria-label="add user "
            className="bg-primary hidden hover:bg-primary/90 text-primary-foreground"
          >
            Add User
          </Button>
        </div>
      </div>

      <Card className="shadow-xl bg-slate-900/50">
        <CardContent className="p-0">
          <DataTable
            data={requests}
            columns={columns}
            enableStatusFilter2={true}
            pageSize={pageSize}
            pageIndex={pageIndex}
            kycFilterValue={kycFilter ?? 'ALL'}
            pageCount={Math.ceil((data?.count ?? 0) / pageSize)}
            manualPagination
            onDelete={handleDelete}
            enableSearch={true}
            search={search}
            onSearchChange={handleSearchChange}
            dateRange={dateRange}
            // onDateRangeChange={setDateRange}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => {
              setStatusFilter(value);
              setPageIndex(0);
            }}
            onDateRangeChange={(range) => {
              setDateRange(range);
              setPageIndex(0);
            }}
            onPaginationChange={(updater) => {
              const next =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
              setPageIndex(next.pageIndex);
              setPageSize(next.pageSize);
            }}
            renderCustomFilters={() => (
              <Select value={selectedUserType} onValueChange={handleUserTypeChange}>
                <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                  <SelectItem value="ALL">All Users</SelectItem>
                  <SelectItem value="CorporateInvestor">Investor</SelectItem>
                  <SelectItem value="AssetOwner">Asset Owner</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Broker">Partner</SelectItem>
                  <SelectItem value="Trustee">Trustee</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
