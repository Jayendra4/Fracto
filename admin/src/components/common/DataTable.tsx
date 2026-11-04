import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel, // new update
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils';
import { DateRangePicker } from '@/components/common/DateRangePicker';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchPlaceholder?: string;
  onSelectionChange?: (selectedRows: TData[]) => void;
  onExport?: (selectedRows: TData[]) => void;
  onDelete?: (selectedRows: TData[]) => void;
  enableSearch?: boolean;
  enableSelection?: boolean;
  enableExport?: boolean;
  enableColumnVisibility?: boolean;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  kycFilterValue?: string;
  manualPagination?: true;
  onSearchChange?: (value: string) => void;
  onKycFilterChange?: (value: string) => void; // new update
  onCategoryFilterChange?: (value: string) => void; // new update
  onVendorStatusFilterChange?: (value: string) => void; // new update
  hidePagination?: boolean;
  enableKycFilter?: boolean; // new update
  enableCategoryFilter?: boolean; // new update
  enableVendorStatusFilter?: boolean; // new update
  onPaginationChange?: (updater: any) => void;
  statusFilter?: string;
  userFilter?: string;
  onUserFilterChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onAdminStatusFilterChange?: (value: string) => void;
  onAssetOwnerStatusFilterChange?: (value: string) => void;
  onIsAssetOnboardingFilterChange?: (value: string) => void;
  onTransactionFilterChange?: (value: string) => void;
  onAssetStatusFilterChange?: (value: string) => void;
  onCouponStatusFilterChange?: (value: string) => void;
  dateRange?: any;
  onDateRangeChange?: (range: any) => void;
  search?: string;
  enableUserFilter?: boolean;
  enableStatusFilter?: boolean;
  enableStatusFilter2?: boolean;
  enableAdminStatusFilter?: boolean;
  enableAssetOwnerStatusFilter?: boolean;
  enableIsAssetOnboardingStatusFilter?: boolean;
  enableCouponStatusFilter?: boolean;
  enableTransactionStatusFilter?: boolean;
  enableTransactionWithdrawStatusFilter?: boolean;
  enableAssetStatusFilter?: boolean;
  assetStatusFilter?: string;
  renderCustomFilters?: () => React.ReactNode;
  enableGroupAssetStatusFilter?: boolean;
  groupAssetStatusFilter?: string;
  onGroupAssetStatusFilterChange?: (value: string) => void;
  enableGroupRwaStatusFilter?: boolean;
  groupRwaStatusFilter?: string;
  onGroupRwaStatusFilterChange?: (value: string) => void;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Search by name, email or contact',
  onSelectionChange,
  onExport,
  onDelete,
  enableSearch = true,
  enableSelection = false,
  enableExport = false,
  enableColumnVisibility = false,
  enableKycFilter = false, // new update
  enableCategoryFilter = false, // new update
  enableVendorStatusFilter = false, // new update
  pageSize = 10,
  onKycFilterChange, // new update
  onVendorStatusFilterChange, //new update
  onCategoryFilterChange, // new update
  onPaginationChange,
  kycFilterValue,
  pageCount,
  pageIndex = 0,
  onSearchChange,
  hidePagination = false,
  userFilter,
  statusFilter,
  onUserFilterChange,
  onStatusFilterChange,
  onAdminStatusFilterChange,
  onAssetOwnerStatusFilterChange,
  onTransactionFilterChange,
  onIsAssetOnboardingFilterChange,
  onCouponStatusFilterChange,
  dateRange,
  onDateRangeChange,
  search,
  enableUserFilter,
  enableStatusFilter,
  enableStatusFilter2,
  enableAdminStatusFilter,
  enableAssetOwnerStatusFilter,
  enableIsAssetOnboardingStatusFilter,
  enableCouponStatusFilter,
  enableTransactionStatusFilter,
  enableTransactionWithdrawStatusFilter,
  renderCustomFilters,
  onAssetStatusFilterChange,
  assetStatusFilter,
  enableAssetStatusFilter,
  enableGroupAssetStatusFilter,
  groupAssetStatusFilter,
  onGroupAssetStatusFilterChange,
  enableGroupRwaStatusFilter,
  groupRwaStatusFilter,
  onGroupRwaStatusFilterChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Add selection column if enabled
  const tableColumns = useMemo(() => {
    if (!enableSelection) return columns;

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="w-4 h-4 border-gray-300 rounded"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="w-4 h-4 border-gray-300 rounded"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...columns];
  }, [columns, enableSelection]);

  // Handle selection change
  const table = useReactTable({
    data,
    columns: tableColumns,
    pageCount,
    manualPagination: true, // one new update
    manualFiltering: false, // one new 4 update
    state: {
      sorting,
      columnFilters,
      columnVisibility, // controlled
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },

    onPaginationChange,
    onColumnVisibilityChange: setColumnVisibility, // REQUIRED
    onColumnFiltersChange: setColumnFilters, // new update
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // new update
  });

  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 px-4 pt-4 mb-4 md:flex-row md:items-center md:justify-between">
        {/* Left Side: Search, Date, Status, Custom Filters */}
        <div className="flex flex-wrap items-center flex-1 gap-3">
          {enableSearch && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-8 bg-slate-900/50 border-input text-slate-200 focus:border-primary"
              />
            </div>
          )}
          {onDateRangeChange && (
            <DateRangePicker
              value={dateRange}
              onChange={(range) => onDateRangeChange(range)}
              placeholder="Filter by Date"
              className="w-[240px] border-input"
            />
          )}
          {/* Transaction User Type Filter */}
          {enableUserFilter && (
            <Select value={userFilter} onValueChange={(v) => onUserFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">User Type</SelectItem>
                <SelectItem value="AssetOwner">Prospective Co-owner</SelectItem>
                <SelectItem value="Broker">Partner</SelectItem>
                <SelectItem value="CorporateInvestor">Corporate Investor</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Transaction Status Filter */}
          {enableStatusFilter && (
            <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          {enableStatusFilter2 && (
            <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                {/* <SelectItem value="Pending">Pending</SelectItem> */}
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
          {/*Asset-Owner Status Filter */}
          {enableAssetOwnerStatusFilter && (
            <Select value={statusFilter} onValueChange={(v) => onAssetOwnerStatusFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Asset Owner" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="All">Investor Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/*Admin Filter */}
          {enableAdminStatusFilter && (
            <Select value={statusFilter} onValueChange={(v) => onAdminStatusFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Admin Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">Admin Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/*TransactionFilter */}

          {enableTransactionStatusFilter && (
            <Select value={statusFilter} onValueChange={(v) => onTransactionFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Admin Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">Admin Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                {/* <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem> */}
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          )}

          {enableTransactionWithdrawStatusFilter && (
            <Select value={statusFilter} onValueChange={(v) => onTransactionFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Admin Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">Admin Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                {/* <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem> */}
                <SelectItem value="Approved">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                {/* <SelectItem value="Failed">Failed</SelectItem> */}
              </SelectContent>
            </Select>
          )}

          {enableAssetStatusFilter && (
            <Select value={assetStatusFilter} onValueChange={(v) => onAssetStatusFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Admin Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          {enableGroupAssetStatusFilter && (
            <Select
              value={groupAssetStatusFilter}
              onValueChange={(v) => onGroupAssetStatusFilterChange?.(v)}
            >
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Asset Status">
                  {groupAssetStatusFilter !== 'ALL' && groupAssetStatusFilter
                    ? groupAssetStatusFilter
                    : 'Asset Status'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">--</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Funded">Funded</SelectItem>
                <SelectItem value="Exited">Exited</SelectItem>
                <SelectItem value="RequestLive">RequestLive</SelectItem>
              </SelectContent>
            </Select>
          )}

          {enableGroupRwaStatusFilter && (
            <Select
              value={groupRwaStatusFilter}
              onValueChange={(v) => onGroupRwaStatusFilterChange?.(v)}
            >
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="RWA Status">
                  {groupRwaStatusFilter !== 'ALL' && groupRwaStatusFilter
                    ? groupRwaStatusFilter
                    : 'RWA Status'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">--</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="LegalReviewed">LegalReviewed</SelectItem>
                <SelectItem value="ValuationReviewed">ValuationReviewed</SelectItem>
                <SelectItem value="DueDiligence">DueDiligence</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under_Review">Under_Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="LegalRejected">LegalRejected</SelectItem>
                <SelectItem value="ValuationRejected">ValuationRejected</SelectItem>
                <SelectItem value="DueDiligenceRejected">DueDiligenceRejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* IsAsset-Onbaording Status Filter */}
          {enableIsAssetOnboardingStatusFilter && (
            <Select
              value={statusFilter}
              onValueChange={(v) => onIsAssetOnboardingFilterChange?.(v)}
            >
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="AssetOnboarding" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="All">AssetOnboarding </SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/*Coupon Filter */}
          {enableCouponStatusFilter && (
            <Select value={statusFilter} onValueChange={(v) => onCouponStatusFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Coupon Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="InActive">InActive</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* KYC Filter */}
          {enableKycFilter && (
            <Select value={kycFilterValue} onValueChange={(v) => onKycFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="KYC Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">All KYC Status</SelectItem>
                <SelectItem value="Draft">Pending</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Category Filter */}
          {enableCategoryFilter && (
            <Select onValueChange={(v) => onCategoryFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Valuation">Valuation</SelectItem>
                <SelectItem value="Audit">Audit</SelectItem>
                <SelectItem value="Trustee">Trustee</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Vendor Status Filter */}
          {enableVendorStatusFilter && (
            <Select onValueChange={(v) => onVendorStatusFilterChange?.(v)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Custom Filters Injection */}
          {renderCustomFilters && renderCustomFilters()}
        </div>

        {/* Right Side: View Options */}
        <div className="flex items-center">
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Go to View"
                  variant="outline"
                  className="bg-slate-900/50 border-input text-slate-200"
                >
                  <Eye className="w-4 h-4 mr-2" /> View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-950 border-slate-800 text-slate-200"
              >
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-slate-200 focus:bg-slate-800"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="w-full mx-auto overflow-x-auto border shadow-sm rounded-xl border-slate-800">
        <table className="w-full text-base text-left text-slate-300">
          <thead className="text-xs tracking-wider uppercase border-b bg-slate-900/50 text-slate-400 border-slate-800 whitespace-nowrap">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-5 font-semibold">
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center space-x-2',
                          header.column.getCanSort() && 'cursor-pointer select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <div className="w-4 h-4 ml-2">
                            {header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors hover:bg-slate-800/50 group',
                    row.getIsSelected() && 'bg-primary/10'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-middle 2xl:px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!hidePagination && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2 ">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] bg-slate-900/50 border-input text-slate-200">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
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
              aria-label="Go back"
              className="w-8 h-8 p-0 bg-slate-900/50 border-input text-slate-200"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              aria-label="Go back"
              className="w-8 h-8 p-0 bg-slate-900/50 border-input text-slate-200"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-slate-300">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              aria-label="Go Right "
              className="w-8 h-8 p-0 bg-slate-900/50 border-input text-slate-200"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              aria-label="Go Right"
              className="w-8 h-8 p-0 bg-slate-900/50 border-input text-slate-200"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
