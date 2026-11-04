import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetOverviewAdminQuery } from '@/store/api/assetsApi';
import { useDebounce } from '@/hooks';

export function GovAssetMgmtTab() {
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetOverviewAdminQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch || undefined,
  });

  const handleEscalate = () => {
    toast.success('Escalation note sent to Trustee');
  };

  const handleNudge = () => {
    toast.success('Nudge sent to Trustee re: pending distribution release');
  };

  const totalAssets = data?.totalAssets ?? 0;
  const availableAssetsCount = data?.availableAssetsCount ?? 0;
  const spvCreatedCount = data?.spvCreatedCount ?? 0;
  const pendingRwaStatusTotal = data?.pendingRwaStatus?.total ?? 0;
  const pendingRwaStatus = data?.pendingRwaStatus;

  const spvList = data?.assets?.data || [];
  const totalCount = data?.assets?.count || 0;

  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-display">
            Governance &amp; Asset Management
          </h2>
          <p className="text-slate-400">
            Admin's oversight view of post-funding governance and operations — Trustee executes,
            Admin monitors and can escalate.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by asset name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(0);
            }}
            className="bg-slate-950 border-slate-800 text-slate-200 text-sm focus-visible:ring-primary h-10"
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
              Total Assets
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                totalAssets
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
              Available Assets Count
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                availableAssetsCount
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
              SPV Created Count
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                spvCreatedCount
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
              Pending RWA Status
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                pendingRwaStatusTotal
              )}
            </div>
            {!isLoading && pendingRwaStatus ? (
              <p className="text-[11px] text-slate-400 mt-1">
                Legal: {pendingRwaStatus.legal} · Valuation: {pendingRwaStatus.valuation} · Due
                Diligence: {pendingRwaStatus.dueDiligence}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : spvList.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800/80 p-8 text-center text-slate-400">
          No assets found.
        </Card>
      ) : (
        <div className="space-y-6">
          {spvList.map((asset: any, index: number) => {
            return (
              <Card key={index} className="bg-slate-900/50 border-slate-800/80 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg text-white font-semibold">
                    {asset.assetTitle} {asset.spvName ? `— ${asset.spvName}` : ''}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Governance &amp; compliance status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto border border-slate-850 rounded-xl">
                    <table className="w-full text-sm text-left text-slate-350">
                      <tbody className="divide-y divide-slate-800/50">
                        <tr className="hover:bg-slate-800/10">
                          <td className="px-4 py-3 font-semibold text-slate-400">
                            Shareholders Count
                          </td>
                          <td className="px-4 py-3 text-right text-slate-200">
                            {asset.shareholdersCount}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/10">
                          <td className="px-4 py-3 font-semibold text-slate-400">
                            Governance Vote Count
                          </td>
                          <td className="px-4 py-3 text-right text-slate-200">
                            {asset.governanceVoteCount}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-800/10">
                          <td className="px-4 py-3 font-semibold text-slate-400">Vote Percentage</td>
                          <td className="px-4 py-3 text-right text-slate-200">
                            {asset.votePercentage}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/club-management')}
                      className="font-semibold text-xs h-9"
                    >
                      View Vote Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {totalCount > 0 ? (
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
                  Page {pageIndex + 1} of {totalPages || 1}
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
          ) : null}
        </div>
      )}
    </div>
  );
}
