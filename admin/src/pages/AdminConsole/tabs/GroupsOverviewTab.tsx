import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { useCreateInterestGroupMutation, useGetAllPaidAssetsQuery } from '@/store/api/allGroupApi';
import { DataTable } from '@/components/common/DataTable';
import Loader from '@/components/common/Loader';
import { useDebounce } from '@/hooks';
import { useHasPermission } from '@/hooks/redux';

export interface AssetInterestRow {
  assetId: number;
  assetTitle: string;
  ownerName: string;
  ownerEmail: string;
  ownerMobile: string;
  totalMembers: number;
  createdAt: string;
  isGroupCreated?: boolean;
  secondaryClubId?: number;
  startDate?: string;
  endDate?: string;
}

const formatDateIndian = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export function GroupsOverviewTab() {
  const navigate = useNavigate();
  const canCreateGroup = useHasPermission('secondary_group.club_create');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [targetAssetId, setTargetAssetId] = useState<number | null>(null);
  const [createdGroups, setCreatedGroups] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: apiResponse, isLoading } = useGetAllPaidAssetsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch.trim() || undefined,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [createInterestGroup, { isLoading: isCreating }] = useCreateInterestGroupMutation();

  const dbAssets: AssetInterestRow[] = (apiResponse?.data || []).map((item: any) => ({
    assetId: item.assetId,
    assetTitle: item.assetDetails?.asset?.assetTitle || `Asset #${item.assetId}`,
    ownerName: item.assetDetails?.sharedBy
      ? `${item.assetDetails.sharedBy.firstname} ${item.assetDetails.sharedBy.lastname}`
      : '—',
    ownerEmail: item.assetDetails?.sharedBy?.email || '—',
    ownerMobile: item.assetDetails?.sharedBy?.mobile || '—',
    totalMembers: item.totalMembers || 0,
    createdAt: item.members?.[0]?.createdAt || new Date().toISOString(),
    isGroupCreated: item.assetDetails?.status === true || item.assetDetails?.status === 'true',
    secondaryClubId: item.members?.[0]?.secondaryClubId || item.id,
    startDate: item.assetDetails?.startDate,
    endDate: item.assetDetails?.endDate,
  }));

  if (isLoading && dbAssets.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCreateGroupClick = (assetId: number) => {
    setTargetAssetId(assetId);
    setStartDate('');
    setEndDate('');
    setCreateModalOpen(true);
  };

  const handleCreateGroup = async () => {
    if (!targetAssetId) return;
    if (!startDate || !endDate) {
      toast.error('Please select both start and end date for voting duration.');
      return;
    }

    const todayStr = getLocalDateString(new Date());
    const startYear = startDate.split('-')[0] || '';
    const endYear = endDate.split('-')[0] || '';

    if (startYear.length > 4 || endYear.length > 4) {
      toast.error('Year must be a 4-digit number.');
      return;
    }
    if (startDate < todayStr) {
      toast.error('Start date cannot be before today.');
      return;
    }
    if (startDate > endDate) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }

    const targetAsset = dbAssets.find((a) => a.assetId === targetAssetId);
    const assetTitle = targetAsset?.assetTitle || `Asset #${targetAssetId}`;
    try {
      await createInterestGroup({
        assetId: targetAssetId,
        title: assetTitle,
        startDate: startDate,
        endDate: endDate,
        description: `${assetTitle} are created`,
      }).unwrap();
      toast.success('Group created successfully!');
      setCreatedGroups((prev) => [...prev, targetAssetId]);
      setCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create group');
      console.error(err);
    }
  };

  const isServerSide = apiResponse?.total !== undefined || apiResponse?.count !== undefined;

  const filteredData = isServerSide
    ? dbAssets
    : dbAssets.filter((item) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = item.assetTitle.toLowerCase().includes(q);
          const matchOwner =
            item.ownerName.toLowerCase().includes(q) ||
            item.ownerEmail.toLowerCase().includes(q) ||
            item.ownerMobile.includes(q);
          if (!matchTitle && !matchOwner) return false;
        }
        if (dateRange.from || dateRange.to) {
          const createdTime = new Date(item.createdAt).getTime();
          if (dateRange.from && createdTime < dateRange.from.getTime()) return false;
          if (dateRange.to && createdTime > dateRange.to.getTime()) return false;
        }
        return true;
      });

  const totalCount = isServerSide
    ? (apiResponse?.total ?? apiResponse?.count ?? 0)
    : filteredData.length;

  const paginatedData = isServerSide
    ? filteredData
    : filteredData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const columns: ColumnDef<AssetInterestRow>[] = [
    {
      header: 'Asset Title',
      accessorKey: 'assetTitle',
      cell: ({ row }) => (
        <span className="font-semibold text-white">{row.original.assetTitle}</span>
      ),
    },
    {
      header: 'Owner Details',
      cell: ({ row }) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-slate-200">{row.original.ownerName}</div>
          <div className="text-slate-400">{row.original.ownerEmail}</div>
          <div className="text-slate-500">{row.original.ownerMobile}</div>
        </div>
      ),
    },
    {
      header: 'Total Members',
      accessorKey: 'totalMembers',
      cell: ({ row }) => (
        <span className="font-medium text-slate-350">{row.original.totalMembers}</span>
      ),
    },
    // {
    //   header: 'Voting Duration',
    //   cell: ({ row }) => {
    //     const start = row.original.startDate;
    //     const end = row.original.endDate;
    //     if (!start && !end) return <span className="text-slate-500">—</span>;
    //     return (
    //       <div className="text-xs  space-y-1 font-medium text-slate-350">
    //         <div>{formatDateIndian(start)}</div>
    //         <div className="text-slate-500 text-[14px]">to</div>
    //         <div>{formatDateIndian(end)}</div>
    //       </div>
    //     );
    //   },
    // },
    {
      header: 'Interested Member',
      cell: ({ row }) => (
        <span
          onClick={() => navigate(`/secondary-groups/interests/${row.original.assetId}`)}
          className="text-blue-500 hover:text-blue-400 hover:underline cursor-pointer font-medium text-sm"
        >
          View
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isGroupCreated = row.original.isGroupCreated;
        return (
          <Button
            onClick={() => handleCreateGroupClick(row.original.assetId)}
            disabled={isGroupCreated || !canCreateGroup}
            title={!canCreateGroup ? "You don't have permission to create a group" : undefined}
            className={`font-semibold text-xs h-8 px-3 transition-colors ${
              isGroupCreated
                ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 cursor-not-allowed opacity-100'
                : 'bg-transparent border border-blue-600 text-blue-450 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-450'
            }`}
          >
            {isGroupCreated ? 'Group Created' : 'Create Group'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="pb-10 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Groups Overview</h2>
        <p className="text-slate-400">
          Manage interests submitted for shared assets and create group channels.
        </p>
      </div>

      {/* Asset Interest Groups Overview Table */}
      <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Asset Group Interests</CardTitle>
          <CardDescription className="text-slate-400">
            Overview of real world assets that have active syndicate/group interest.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedData}
            columns={columns}
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={Math.ceil(totalCount / pageSize)}
            manualPagination
            search={search}
            searchPlaceholder={'Search by asset title'}
            onSearchChange={handleSearchChange}
            enableStatusFilter={false}
            dateRange={dateRange}
            onDateRangeChange={(range) => setDateRange(range)}
            onPaginationChange={(updater) => {
              const next =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
              setPageIndex(next.pageIndex);
              setPageSize(next.pageSize);
            }}
          />
        </CardContent>
      </Card>

      {/* Create Group Modal */}
      {createModalOpen && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white">
                Create Group Channel
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
                Are you sure you want to create a group channel for{' '}
                <span className="font-semibold text-white">
                  {dbAssets.find((a) => a.assetId === targetAssetId)?.assetTitle || 'this asset'}
                </span>
                ? This action will set the group channel name to the asset title by default.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-3 tracking-wide">
                  Voting Duration
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="startDate" className="text-xs text-slate-400 font-medium">
                      Start Date
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={getLocalDateString(new Date())}
                      max="9999-12-31"
                      className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 text-xs h-9 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch (err) {}
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="endDate" className="text-xs text-slate-400 font-medium">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || getLocalDateString(new Date())}
                      max="9999-12-31"
                      className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 text-xs h-9 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch (err) {}
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="h-9 border-slate-800 hover:bg-slate-800 text-slate-300 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={isCreating}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                {isCreating ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
