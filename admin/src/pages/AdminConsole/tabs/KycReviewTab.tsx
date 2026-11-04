import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DateRangePicker, DateRange } from '@/components/common/DateRangePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks';
import {
  useGetKycAccountsQuery,
  useGetTrusteeKycAccountsQuery,
  useGetCompanyKycAccountsQuery,
} from '@/store/api/kycApi';

interface KycReviewTabProps {
  kycLoading: boolean;
  realKyc: any[];
  handleKycAction: (kycId: number, action: 'Approved' | 'Rejected') => void;
}

export function KycReviewTab({ kycLoading, realKyc, handleKycAction }: KycReviewTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubTab =
    (searchParams.get('subTab') as 'investor' | 'owner' | 'broker' | 'trustee' | 'company') ||
    'investor';

  const setActiveSubTab = (tab: 'investor' | 'owner' | 'broker' | 'trustee' | 'company') => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('subTab', tab);
    setSearchParams(newParams);
  };

  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Reset pageIndex on filter or tab change
  React.useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, statusFilter, dateRange, activeSubTab]);

  const targetUserType = useMemo(() => {
    if (activeSubTab === 'investor') return 'CorporateInvestor';
    if (activeSubTab === 'owner') return 'AssetOwner';
    return 'Broker';
  }, [activeSubTab]);

  const { data: apiResponse, isLoading: apiLoading } = useGetKycAccountsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
      fromDate: dateRange.from?.toISOString(),
      toDate: dateRange.to?.toISOString(),
      userType: targetUserType,
    },
    {
      skip: activeSubTab === 'trustee' || activeSubTab === 'company',
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: trusteeResponse, isLoading: trusteeLoading } = useGetTrusteeKycAccountsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
      fromDate: dateRange.from?.toISOString(),
      toDate: dateRange.to?.toISOString(),
      accountType: 'Trustee',
    },
    {
      skip: activeSubTab !== 'trustee',
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: companyResponse, isLoading: companyLoading } = useGetCompanyKycAccountsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
      fromDate: dateRange.from?.toISOString(),
      toDate: dateRange.to?.toISOString(),
    },
    {
      skip: activeSubTab !== 'company',
      refetchOnMountOrArgChange: true,
    }
  );

  const filteredKyc =
    activeSubTab === 'company'
      ? companyResponse?.data || []
      : activeSubTab === 'trustee'
        ? trusteeResponse?.data || []
        : apiResponse?.data || [];

  const totalCount =
    activeSubTab === 'company'
      ? (companyResponse?.count ?? 0)
      : activeSubTab === 'trustee'
        ? (trusteeResponse?.count ?? 0)
        : (apiResponse?.count ?? 0);

  const pageCount = Math.ceil(totalCount / pageSize) || 1;
  const isKycLoading =
    activeSubTab === 'company'
      ? kycLoading || companyLoading
      : activeSubTab === 'trustee'
        ? kycLoading || trusteeLoading
        : kycLoading || apiLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">KYC Review</h2>
        <p className="text-slate-400">
          Investor KYC, Asset Owner KYC, Partner KYC, Trustee KYC, and Company KYC across the
          platform.
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveSubTab('investor')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${
            activeSubTab === 'investor'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Investor KYC
        </button>
        <button
          onClick={() => setActiveSubTab('owner')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${
            activeSubTab === 'owner'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Asset Owner KYC
        </button>
        <button
          onClick={() => setActiveSubTab('broker')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${
            activeSubTab === 'broker'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Partner KYC
        </button>
        <button
          onClick={() => setActiveSubTab('trustee')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${
            activeSubTab === 'trustee'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Trustee KYC
        </button>
        <button
          onClick={() => setActiveSubTab('company')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${
            activeSubTab === 'company'
              ? 'bg-slate-900 text-white border-t border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Company KYC
        </button>
      </div>

      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            {activeSubTab === 'investor' && 'Investor KYC Requests'}
            {activeSubTab === 'owner' && 'Asset Owner KYC Requests'}
            {activeSubTab === 'broker' && 'Partner KYC Requests'}
            {activeSubTab === 'trustee' && 'Trustee KYC Requests'}
            {activeSubTab === 'company' && 'Company KYC Requests'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Verify user identity parameters and update verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center flex-1 gap-3">
              {/* Search input */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 bg-slate-900/50 border-slate-800 text-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Date Range Picker */}
              <DateRangePicker
                value={dateRange}
                onChange={(range) => setDateRange(range || { from: undefined, to: undefined })}
                placeholder="Filter by Date"
                className="w-[240px] border-slate-800"
              />

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-800 text-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isKycLoading ? (
            <div className="py-8 text-center text-slate-400">
              Loading KYC records from database...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">
                      {activeSubTab === 'investor'
                        ? 'Investor'
                        : activeSubTab === 'owner'
                          ? 'Owner'
                          : activeSubTab === 'broker'
                            ? 'Broker'
                            : activeSubTab === 'trustee'
                              ? 'Trustee'
                              : 'Company'}
                    </th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredKyc.length > 0 ? (
                    filteredKyc.map((kycItem: any) => {
                      const itemStatus =
                        kycItem.status || kycItem.overallStatus || kycItem.kycStatus;
                      return (
                        <tr key={kycItem.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white">
                              {kycItem.account?.firstname} {kycItem.account?.lastname || ''}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {kycItem.account?.email || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                itemStatus === 'Approved'
                                  ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                                  : itemStatus === 'Rejected'
                                    ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                              }`}
                            >
                              {itemStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              onClick={() =>
                                navigate(
                                  activeSubTab === 'company'
                                    ? `/company-kyc-request/details/${kycItem.id}`
                                    : activeSubTab === 'trustee'
                                      ? `/trustee-kyc-request/${kycItem.account?.id || kycItem.id}`
                                      : `/user-kyc-request/${kycItem.account?.id || kycItem.id}`
                                )
                              }
                              className="text-xs font-semibold text-blue-500 hover:text-blue-400 hover:underline cursor-pointer transition-colors"
                            >
                              View
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No KYC records found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-slate-800/50 px-4 py-4 mt-4">
            <div className="flex items-center space-x-2">
              <p className="text-xs font-medium text-slate-400">Rows per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-8 w-[70px] bg-slate-900/50 border-slate-800 text-slate-200">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top" className="bg-slate-950 border-slate-800 text-slate-200">
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                aria-label="Go to first page"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200 disabled:opacity-50"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                aria-label="Go to previous page"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200 disabled:opacity-50"
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex w-[100px] items-center justify-center text-xs font-medium text-slate-300">
                Page {pageIndex + 1} of {pageCount}
              </div>
              <Button
                variant="outline"
                aria-label="Go to next page"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200 disabled:opacity-50"
                onClick={() => setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))}
                disabled={pageIndex >= pageCount - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                aria-label="Go to last page"
                className="w-8 h-8 p-0 bg-slate-900/50 border-slate-800 text-slate-200 disabled:opacity-50"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={pageIndex >= pageCount - 1}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
