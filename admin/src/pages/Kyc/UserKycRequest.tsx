import { ColumnDef } from '@tanstack/react-table';
import { Eye, Clock, CheckCircle, XCircle, GitPullRequestDraft } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { DataTable } from '@/components/common/DataTable';
import { DateRange } from '@/types';
import { formatDate } from '@/utils';
import { useDebounce } from '@/hooks';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KycRequest, KycStatus, useGetKycAccountsQuery } from '@/store/api/kycApi';

/* ================= BADGES ================= */

function KycStatusBadge({ status }: { status: string }) {
  if (status === 'Approved')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 rounded-full bg-green-500/10 border-green-500/20">
        <CheckCircle className="w-3 h-3" /> Approved
      </span>
    );

  if (status === 'Rejected')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 rounded-full bg-red-500/10 border-red-500/20">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
    if (status === 'Draft')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#8f8c8c21] border-[#8f8f8f]/50 rounded-full">
          <GitPullRequestDraft className="w-3 h-3" /> Draft
        </span>
      );

    if (status === 'Submitted')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 rounded-full bg-blue-500/10 border-blue-500/20">
          <CheckCircle className="w-3 h-3" /> Submitted
        </span>
      );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-500 rounded-full bg-yellow-500/10 border-yellow-500/20">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

/* ================= MAIN COMPONENT ================= */

export function UserKycRequest() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
const [userType, setUserType] = useState<string>('ALL');
  const [status, setStatus] = useState<KycStatus | undefined>();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const { data, isLoading, isError } = useGetKycAccountsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch,
      status,
      fromDate: dateRange.from?.toISOString(),
      toDate: dateRange.to?.toISOString(),
      userType: userType === 'ALL' ? undefined : userType,
    },
    { refetchOnMountOrArgChange: true }
  );

  const columns: ColumnDef<KycRequest>[] = [
    {
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original.account;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 text-white rounded-full bg-primary">
              {user.firstname.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">
                {user.firstname} {user.lastname}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    { header: 'Mobile No.', cell: ({ row }) => row.original.account.mobile },
    { header: 'Type', cell: ({ row }) => row.original.account.type },
    {
      header: 'KYC Status',
      cell: ({ row }) => <KycStatusBadge status={row.original.status} />,
    },
    {
      header: 'Submitted At',
      cell: ({ row }) =>
        row.original.submittedAt ? formatDate(new Date(row.original.submittedAt)) : '—',
    },
    {
      header: 'View Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/user-kyc-request/${row.original.account.id}`)}
          className="flex justify-center cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </div>
      ),
    },
  ];

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load KYC requests</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight">User KYC Requests</h2>

      <div className="px-1 overflow-hidden border shadow-sm rounded-xl border-slate-800 bg-slate-900/50">
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageCount={Math.ceil((data?.count ?? 0) / pageSize)}
          manualPagination
          enableSearch={true}
          search={search}
          userFilter={userType}
          onSearchChange={(val) => {
            setSearch(val);
            setPageIndex(0);
          }}
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range || { from: undefined, to: undefined });
            setPageIndex(0);
          }}
          enableUserFilter={true}
          onUserFilterChange={(val) => {
            setUserType(val);
            setPageIndex(0);
          }}
          enableStatusFilter={false}
          enableStatusFilter2={true}
          statusFilter={status ?? 'ALL'}
          onStatusFilterChange={(val) => {
            setStatus(val === 'ALL' ? undefined : (val as KycStatus));
            setPageIndex(0);
          }}
          onPaginationChange={(updater) => {
            const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
            setPageIndex(next.pageIndex);
            setPageSize(next.pageSize);
          }}
        />
      </div>
    </div>
  );
}

export default UserKycRequest;
