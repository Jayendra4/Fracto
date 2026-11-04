import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Eye, X, Loader2, ArrowLeft } from 'lucide-react';
import { useGetAllPaidAssetsQuery, useCreateInterestGroupMutation } from '@/store/api/allGroupApi';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';

export function GroupInterestDetailsTab() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [accountDetailOpen, setAccountDetailOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const [screenshotZoomOpen, setScreenshotZoomOpen] = useState(false);
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState('');

  const targetAssetId = Number(assetId);

  // API Queries & Mutations
  const { data: apiPaidAssetsResponse, isLoading: isPaidMembersLoading } = useGetAllPaidAssetsQuery(
    {
      assetId: targetAssetId,
      memberSkip: pageIndex * pageSize,
      memberTake: pageSize,
      search: debouncedSearch.trim() || undefined,
    },
    { skip: !targetAssetId }
  );

  const matchingAsset =
    apiPaidAssetsResponse?.data?.find((item: any) => item.assetId === targetAssetId) ||
    apiPaidAssetsResponse?.data?.[0];

  const assetTitle = matchingAsset?.assetDetails?.asset?.assetTitle || `Asset #${targetAssetId}`;

  const [createInterestGroup, { isLoading: isCreating }] = useCreateInterestGroupMutation();

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCreateGroupClick = () => {
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

    try {
      await createInterestGroup({
        assetId: targetAssetId,
        title: assetTitle,
        startDate: startDate,
        endDate: endDate,
        description: `${assetTitle} are created`,
      }).unwrap();
      toast.success('Group created successfully!');
      setCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create group');
      console.error(err);
    }
  };

  // Get raw response
  const rawMembers = matchingAsset?.members || [];
  const dbMembers = Array.isArray(rawMembers) ? rawMembers : [];

  const totalCount = matchingAsset?.totalMembers || dbMembers.length;
  const isServerSide = dbMembers.length < totalCount;

  // Filter local members based on search / date
  const filteredMembers = isServerSide
    ? dbMembers
    : dbMembers.filter((item: any) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchPayer =
            item.payerName?.toLowerCase().includes(q) ||
            item.payerEmail?.toLowerCase().includes(q) ||
            item.payerMobile?.includes(q) ||
            item.utrNumber?.toLowerCase().includes(q) ||
            item.account?.firstname?.toLowerCase().includes(q) ||
            item.account?.lastname?.toLowerCase().includes(q) ||
            item.account?.email?.toLowerCase().includes(q) ||
            item.account?.mobile?.includes(q);
          if (!matchPayer) return false;
        }
        if (dateRange.from || dateRange.to) {
          const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : 0;
          if (dateRange.from && itemTime < dateRange.from.getTime()) return false;
          if (dateRange.to && itemTime > dateRange.to.getTime()) return false;
        }
        return true;
      });

  const displayTotalCount = isServerSide ? totalCount : filteredMembers.length;

  const paginatedMembers = isServerSide
    ? filteredMembers
    : filteredMembers.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `https://staging-api.houseoffrac.com${cleanPath}`;
    }
    if (url.includes('localhost')) {
      return url.replace(/^https?:\/\/[^\/]+/, 'https://staging-api.houseoffrac.com');
    }
    return url;
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Member Name',
      cell: ({ row }) => {
        const name = row.original.account
          ? `${row.original.account.firstname} ${row.original.account.lastname}`
          : '—';
        return <span className="font-semibold text-white">{name}</span>;
      },
    },
    {
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-slate-200 text-xs">{row.original.account?.email || '—'}</span>
      ),
    },
    {
      header: 'Mobile',
      cell: ({ row }) => (
        <span className="text-slate-350 text-xs">{row.original.account?.mobile || '—'}</span>
      ),
    },

    {
      header: 'Payment Detail',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedAccount({
              firstname: row.original.payerName,
              lastname: '',
              email: row.original.payerEmail,
              mobile: row.original.payerMobile,
              utr: row.original.utrNumber,
            });
            setAccountDetailOpen(true);
          }}
          className="text-blue-500 hover:text-blue-400 hover:bg-slate-800 h-8 w-8 p-0 flex justify-center items-center"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="pb-10 space-y-6 animate-fade-in">
      {/* Back navigation & Header */}
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
            <h2 className="text-3xl font-bold tracking-tight text-white">Interested Members</h2>
            <p className="text-slate-400">
              Detailed list of members who have showed interest in {assetTitle}.
            </p>
          </div>
          {/* <Button
            onClick={handleCreateGroupClick}
            className="bg-blue-600 hover:bg-blue-750 text-white font-semibold text-xs h-9 px-4 transition-colors"
          >
            Create Group
          </Button> */}
        </div>
      </div>

      {/* Table of Members */}
      <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Paid Interest Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isPaidMembersLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={paginatedMembers}
              columns={columns}
              pageSize={pageSize}
              pageIndex={pageIndex}
              pageCount={Math.ceil(displayTotalCount / pageSize)}
              manualPagination
              search={search}
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
          )}
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
                <span className="font-semibold text-white">{assetTitle}</span>? This action will set
                the group channel name to the asset title by default.
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

      {/* Account / Payment Details Modal */}
      {accountDetailOpen && (
        <Dialog open={accountDetailOpen} onOpenChange={setAccountDetailOpen}>
          <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md p-6 relative">
            <button
              onClick={() => setAccountDetailOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold">
                Account / Payment Details
              </DialogTitle>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4 mt-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Name
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {selectedAccount.firstname} {selectedAccount.lastname}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {selectedAccount.email}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mobile
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {selectedAccount.mobile}
                  </span>
                </div>
                {selectedAccount.utr && (
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      UTR Number
                    </span>
                    <span className="text-sm font-medium text-slate-200 font-mono">
                      {selectedAccount.utr}
                    </span>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Zoom Dialog */}
      {screenshotZoomOpen && (
        <Dialog open={screenshotZoomOpen} onOpenChange={(open) => setScreenshotZoomOpen(open)}>
          <DialogContent className="max-w-4xl bg-slate-900 border border-slate-800 text-white p-4 relative">
            <button
              onClick={() => setScreenshotZoomOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogHeader>
              <DialogTitle className="text-white">Payment Screenshot Preview</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center mt-2 max-h-[80vh] overflow-auto">
              <img
                src={selectedScreenshotUrl}
                alt="Full Payment Screenshot"
                className="max-h-[70vh] max-w-full object-contain rounded"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
