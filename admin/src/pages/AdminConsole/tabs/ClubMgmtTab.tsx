import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useGetVoteAssetSummaryQuery } from '@/store/api/voteApi';
import { useDebounce } from '@/hooks';
import { useHasPermission } from '@/hooks/redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ClubMgmtTab() {
  const navigate = useNavigate();
  const canViewMemberList = useHasPermission('vote.asset_voting_view');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Query vote asset summary from backend API
  const { data: apiResponse, isLoading } = useGetVoteAssetSummaryQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch.trim() || undefined,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const totalCount = apiResponse?.total ?? apiResponse?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + (apiResponse?.data?.length ?? 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPageIndex(0);
  };

  const handleOpenMemberList = (assetId: number, assetTitle: string) => {
    const formattedTitle = assetTitle.toLowerCase().replace(/\s+/g, '-');
    navigate(
      `/club-management/voters?assetId=${assetId}&assetTitle=${encodeURIComponent(formattedTitle)}`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Club &amp; Vote Management
        </h2>
        <p className="text-slate-400">
          Primary/Secondary club oversight, vote thresholds, and Secondary Club formation.
        </p>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search assets..."
        value={search}
        onChange={handleSearchChange}
        className="bg-slate-900/50 border-slate-800 text-slate-200 text-sm focus-visible:ring-primary w-full sm:max-w-md"
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : !apiResponse || !apiResponse.data || apiResponse.data.length === 0 ? (
        <div className="py-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
          No asset vote summaries found matching search query.
        </div>
      ) : (
        <>
          {/* Active Vote Summaries Grid */}
          <div className="grid grid-cols-1 gap-6">
            {apiResponse.data.map((asset) => (
              <Card key={asset.assetId} className="bg-slate-900/50 border-slate-800/80">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-base text-white font-semibold">
                        {asset.assetTitle}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-8">
                      <button
                        onClick={() => handleOpenMemberList(asset.assetId, asset.assetTitle)}
                        disabled={!canViewMemberList}
                        title={
                          !canViewMemberList
                            ? "You don't have permission to view the member list"
                            : undefined
                        }
                        className="text-blue-500 hover:text-blue-400 hover:underline text-sm font-semibold cursor-pointer disabled:text-slate-500 disabled:no-underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Member List
                      </button>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          asset.voteStatus.toLowerCase() === 'active'
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {asset.voteStatus}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto border border-slate-850 rounded-xl">
                    <table className="w-full text-sm text-left text-slate-300">
                      <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Outcome</th>
                          <th className="px-4 py-3">Members</th>
                          <th className="px-4 py-3 text-right">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        <tr className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                              Yes
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{asset.yesCount}</td>
                          <td className="px-4 py-3 text-right font-bold text-white">
                            {asset.yesPercentage}%
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
                              No
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{asset.noCount}</td>
                          <td className="px-4 py-3 text-right font-bold text-white">
                            {asset.noPercentage}%
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
                              Abstain
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{asset.abstainCount}</td>
                          <td className="px-4 py-3 text-right font-bold text-white">
                            {asset.abstainPercentage}%
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3 text-slate-400">Not Yet Voted</td>
                          <td className="px-4 py-3 text-slate-300">{asset.notVotedCount}</td>
                          <td className="px-4 py-3 text-right text-slate-500 font-semibold">
                            &mdash;
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/10 bg-slate-850/20 transition-colors border-t border-slate-800">
                          <td className="px-4 py-3 font-semibold text-slate-200">Total Members</td>
                          <td className="px-4 py-3 font-bold text-slate-200">
                            {asset.totalMembers}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400 text-xs font-medium">
                            ({asset.totalVotes} Voted)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-6">
              <div className="text-xs text-slate-400 flex items-center gap-4">
                <span>
                  Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-white">{Math.min(endIndex, totalCount)}</span>{' '}
                  of <span className="font-semibold text-white">{totalCount}</span> entries
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Rows per page:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setPageIndex(0);
                    }}
                  >
                    <SelectTrigger className="h-7 w-[60px] bg-slate-900 border-slate-800 text-slate-200 text-xs">
                      <SelectValue placeholder={String(pageSize)} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                  disabled={pageIndex === 0}
                  className="h-8 border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-50"
                >
                  Previous
                </Button>
                <div className="text-xs text-slate-300 px-2 font-medium">
                  Page {pageIndex + 1} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={pageIndex >= totalPages - 1}
                  className="h-8 border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
