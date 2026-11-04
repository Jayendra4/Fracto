import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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
  Filter,
  Download,
  Trash2,
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

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchPlaceholder?: string;
  onSelectionChange?: (selectedRows: TData[]) => void;
  onExport?: (selectedRows: TData[]) => void;
  onDelete?: (selectedRows: TData[]) => void;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSelection?: boolean;
  enableExport?: boolean;
  enableColumnVisibility?: boolean;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  manualPagination?: true;
  onSearchChange?: (value: string) => void;
  hidePagination?: boolean;
  toolbarContent?: React.ReactNode;
  filterContent?: React.ReactNode;
  search?: string;

  onPaginationChange?: (updater: any) => void;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onSelectionChange,
  onExport,
  onDelete,
  enableSearch = true,
  enableFilters = false,
  enableSelection = false,
  enableExport = false,
  enableColumnVisibility = true,
  pageSize = 10,
  onPaginationChange,
  pageCount,
  pageIndex = 0,
  onSearchChange,
  hidePagination = false,
  toolbarContent,
  filterContent,
  manualPagination,
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

  

  const table = useReactTable({
    data,
    columns: tableColumns,

    manualPagination: !!manualPagination,
    pageCount,

    state: {
      sorting,
      columnFilters,
      columnVisibility, 
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },

    onPaginationChange,
    onColumnVisibilityChange: setColumnVisibility, 

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  return (
    <div className="w-full overflow-x-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {filterContent}
          {toolbarContent ? (
            <div className="flex items-center space-x-2">{toolbarContent}</div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Global Search */}
              {enableSearch && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="max-w-sm pl-8"
                  />
                </div>
              )}

              {/* Column Filters */}
              {enableFilters && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanFilter())
                      .map((column) => {
                        return (
                          <div key={column.id} className="p-2">
                            <Input
                              placeholder={`Filter ${column.id}...`}
                              value={(column.getFilterValue() as string) ?? ''}
                              onChange={(event) => column.setFilterValue(event.target.value)}
                              className="max-w-sm"
                            />
                          </div>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <EyeOff className="w-4 h-4 mr-2" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
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

          {/* Export */}
          {enableExport && selectedRows.length > 0 && onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport(selectedRows)}>
              <Download className="w-4 h-4 mr-2" />
              Export ({selectedRows.length})
            </Button>
          )}

          {/* Delete */}
          {enableSelection && selectedRows.length > 0 && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(selectedRows)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedRows.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md ">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 font-medium text-left align-middle text-muted-foreground"
                  >
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
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    row.getIsSelected() && 'bg-muted'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 align-middle lg:p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllColumns().length} className="text-center h-36">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!hidePagination && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {enableSelection && <span>{table.getFilteredSelectedRowModel().rows.length} of </span>}
          </div>

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="w-8 h-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                className="w-8 h-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
