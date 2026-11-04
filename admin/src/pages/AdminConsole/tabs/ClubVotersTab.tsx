import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useGetVoteAssetSummaryDetailQuery } from '@/store/api/voteApi';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ClubVotersTab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const assetId = Number(searchParams.get('assetId'));
  const urlAssetTitle = searchParams.get('assetTitle') || '';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [voteStatusFilter, setVoteStatusFilter] = useState('ALL');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch detailed vote summary including voters list
  const { data: detailResponse, isLoading } = useGetVoteAssetSummaryDetailQuery(
    {
      assetId,
      search: debouncedSearch.trim() || undefined,
    },
    {
      skip: !assetId,
      refetchOnMountOrArgChange: true,
    }
  );

  // Helper to convert slug back to Title Case for fallback display
  const getReadableTitle = (slug: string) => {
    if (!slug) return '';
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const assetTitle = detailResponse?.assetTitle || getReadableTitle(urlAssetTitle) || `Asset #${assetId}`;

  // Process and flatten voter members list
  const yesVoters = detailResponse?.members?.yes || [];
  const noVoters = detailResponse?.members?.no || [];
  const abstainVoters = detailResponse?.members?.abstain || [];

  const allVoters = [
    ...yesVoters.map((m: any) => ({ ...m, voteStatus: 'Yes' })),
    ...noVoters.map((m: any) => ({ ...m, voteStatus: 'No' })),
    ...abstainVoters.map((m: any) => ({ ...m, voteStatus: 'Abstain' })),
  ];

  // Filter based on search query and selected vote status
  const filteredVoters = allVoters.filter((voter) => {
    // 1. Search Query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSearch =
        voter.name?.toLowerCase().includes(q) || voter.email?.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    // 2. Vote Status filter
    if (voteStatusFilter !== 'ALL') {
      if (voter.voteStatus !== voteStatusFilter) return false;
    }
    return true;
  });

  const totalVotersCount = filteredVoters.length;
  const paginatedVoters = filteredVoters.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-semibold text-white">{row.original.name || '—'}</span>
      ),
    },
    {
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-slate-200 text-xs">{row.original.email || '—'}</span>
      ),
    },
    {
      header: 'Vote Status',
      cell: ({ row }) => {
        const status = row.original.voteStatus || '';
        const isYes = status.toLowerCase() === 'yes';
        const isNo = status.toLowerCase() === 'no';
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
              isYes
                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                : isNo
                  ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="pb-10 space-y-6 animate-fade-in">
      {/* Back Navigation & Header */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => navigate('/club-management')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Club Management
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{assetTitle}</h2>
          <p className="text-slate-400">
            View the list of members and their voting decisions for this asset.
          </p>
        </div>
      </div>

      {/* Table Card */}
      <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Voter List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={paginatedVoters}
              columns={columns}
              pageSize={pageSize}
              pageIndex={pageIndex}
              pageCount={Math.ceil(totalVotersCount / pageSize)}
              manualPagination
              search={search}
              onSearchChange={handleSearchChange}
              enableStatusFilter={false}
              renderCustomFilters={() => (
                <Select
                  value={voteStatusFilter}
                  onValueChange={(val) => {
                    setVoteStatusFilter(val);
                    setPageIndex(0);
                  }}
                >
                  <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-800 text-slate-200">
                    <SelectValue placeholder="Vote Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                    <SelectItem value="ALL">All Votes</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Abstain">Abstain</SelectItem>
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
    </div>
  );
}
