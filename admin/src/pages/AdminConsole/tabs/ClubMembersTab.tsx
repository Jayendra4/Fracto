import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  useGetClubMembershipsQuery,
  useReviewClubMembershipMutation,
  useCreateSpvMutation,
} from '@/store/api/allGroupApi';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import { useHasPermission } from '@/hooks/redux';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ClubMembersTab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canCreateSpv = useHasPermission('spv.create');

  const secondaryClubId = Number(searchParams.get('secondaryClubId'));
  const urlAssetTitle = searchParams.get('assetTitle') || '';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Confirmation Modal States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');

  // SPV Modal States
  const [spvConfirmOpen, setSpvConfirmOpen] = useState(false);
  const [spvName, setSpvName] = useState('');

  // Fetch club membership requests
  const {
    data: apiResponse,
    isLoading,
    refetch,
  } = useGetClubMembershipsQuery(
    {
      secondaryClubId: secondaryClubId || undefined,
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    },
    {
      skip: !secondaryClubId,
      refetchOnMountOrArgChange: true,
    }
  );

  const [reviewClubMembership, { isLoading: isReviewing }] = useReviewClubMembershipMutation();

  const handleApprove = async (requestId: number) => {
    try {
      await reviewClubMembership({ requestId, status: 'Approved' }).unwrap();
      toast.success('Membership approved successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to approve membership');
      console.error(err);
    }
  };

  // Convert status to camelCase
  const formatCamelCase = (str: string) => {
    if (!str) return '';
    const s = str.toUpperCase();
    if (s === 'NdaPending') return 'NDA Pending';
    if (s === 'PendingADMINAPPROVAL') return 'Pending';
    if (s === 'Approved') return 'Approved';
    if (s === 'Rejected') return 'Rejected';

    // general fallback conversion
    return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  };

  // Helper to convert slug back to Title Case for fallback display
  const getReadableTitle = (slug: string) => {
    if (!slug) return '';
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Extract members and club details from the API response
  const matchingClub = apiResponse?.data?.[0];
  const assetTitle =
    matchingClub?.title || getReadableTitle(urlAssetTitle) || `Asset #${secondaryClubId}`;

  const rawMembers = matchingClub?.members || [];
  const dbMembers = Array.isArray(rawMembers) ? rawMembers : [];

  const [createSpv, { isLoading: isCreatingSpv }] = useCreateSpvMutation();

  const handleCreateSpv = async () => {
    if (!spvName.trim()) {
      toast.error('SPV Name is required.');
      return;
    }

    const accountIds = dbMembers
      .map((m: any) => m.accountId)
      .filter((id): id is number => typeof id === 'number');

    try {
      await createSpv({
        name: spvName.trim(),
        secondaryClubId: secondaryClubId,
        accountIds: accountIds,
      }).unwrap();
      toast.success('SPV created successfully!');
      setSpvConfirmOpen(false);
      setSpvName('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create SPV');
      console.error(err);
    }
  };

  const totalCount = apiResponse?.total ?? apiResponse?.count ?? dbMembers.length;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Member Name',
      cell: ({ row }) => {
        const account = row.original.account;
        const name = account ? `${account.firstname || ''} ${account.lastname || ''}`.trim() : '—';
        return <span className="font-semibold text-white">{name || '—'}</span>;
      },
    },
    {
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-slate-200 text-xs">{row.original.account?.email || '—'}</span>
      ),
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || '';
        const isApproved = status === 'Approved';
        const isRejected = status === 'Rejected';
        const displayStatus = formatCamelCase(status);

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-2xl text-xs font-semibold ${
              isApproved
                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                : isRejected
                  ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
            }`}
          >
            {displayStatus}
          </span>
        );
      },
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const isApproved = row.original.status === 'Approved';
        return (
          <Button
            onClick={() => {
              const account = row.original.account;
              const name = account
                ? `${account.firstname || ''} ${account.lastname || ''}`.trim()
                : 'this member';
              setSelectedRequestId(row.original.id);
              setSelectedMemberName(name);
              setConfirmOpen(true);
            }}
            disabled={isApproved || isReviewing}
            className={`font-semibold text-xs h-8 px-3 transition-colors ${
              isApproved
                ? 'bg-blue-600 border border-emerald-500/25 text-emerald-450 cursor-not-allowed opacity-100'
                : 'bg-transparent border border-blue-600 text-blue-450 hover:bg-blue-600 hover:text-white'
            }`}
          >
            {isApproved ? 'Approved' : 'Approve'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="pb-10 space-y-6 animate-fade-in">
      {/* Back Navigation & Header */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => navigate('/secondary-groups')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">{assetTitle}</h2>
            <p className="text-slate-400">
              View and manage club membership requests for this asset.
            </p>
          </div>
          {canCreateSpv && (
            <Button
              onClick={() => setSpvConfirmOpen(true)}
              disabled={matchingClub?.spvCreated === true}
              className={`font-semibold text-xs h-9 px-4 transition-colors ${
                matchingClub?.spvCreated === true
                  ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 cursor-not-allowed opacity-100'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {matchingClub?.spvCreated === true ? 'SPV Created' : 'Create SPV'}
            </Button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Club Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={dbMembers}
              columns={columns}
              pageSize={pageSize}
              pageIndex={pageIndex}
              pageCount={Math.ceil(totalCount / pageSize)}
              manualPagination
              search={search}
              onSearchChange={handleSearchChange}
              enableStatusFilter={false}
              renderCustomFilters={() => (
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setPageIndex(0);
                  }}
                >
                  <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-800 text-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="NdaPending">NDA Pending</SelectItem>
                    <SelectItem value="PendingADMINAPPROVAL">Pending Admin Approval</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              )}
              onPaginationChange={(updater) => {
                const next =
                  typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
                setPageIndex(next.pageIndex);
                setPageSize(next.pageSize);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Confirm Approve Dialog */}
      {confirmOpen && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white">
                Approve Club Membership
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
                Are you sure you want to approve the club membership for{' '}
                <span className="font-semibold text-white">{selectedMemberName}</span>?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex gap-3 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="h-9 border-slate-800 hover:bg-slate-800 text-slate-300 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (selectedRequestId !== null) {
                    await handleApprove(selectedRequestId);
                    setConfirmOpen(false);
                  }
                }}
                disabled={isReviewing}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                {isReviewing ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create SPV Dialog */}
      {spvConfirmOpen && (
        <Dialog open={spvConfirmOpen} onOpenChange={setSpvConfirmOpen}>
          <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white">Create New SPV</DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
                Enter the legal name of the SPV to initiate creation.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-1.5">
              <label htmlFor="spvName" className="text-xs text-slate-400 font-medium">
                SPV Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="spvName"
                placeholder="e.g. Taj Hotel SPV"
                value={spvName}
                onChange={(e) => setSpvName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-blue-600 text-sm"
              />
            </div>

            <DialogFooter className="flex gap-3 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSpvConfirmOpen(false);
                  setSpvName('');
                }}
                className="h-9 border-slate-800 hover:bg-slate-800 text-slate-300 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSpv}
                disabled={isCreatingSpv || !spvName.trim()}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                {isCreatingSpv ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
