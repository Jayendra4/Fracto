import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { formatDate } from '@/utils';
import { useDebounce } from '@/hooks';
import { useGetVendorSuggestionsQuery, useReviewVendorMutation } from '@/store/api/vendorApi';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

interface VendorSuggestion {
  id: number;
  vendorName: string;
  category: string;
  email: string;
  mobile?: string; // ✅ new update
  website?: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export default function VendorSuggestionTable() {
  /* ===================== FILTER STATE ===================== */
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const debouncedSearch = useDebounce(search, 300);

  /* ===================== API ===================== */
  const { data, isLoading } = useGetVendorSuggestionsQuery({
    skip: 0,
    take: 10,
    search: debouncedSearch,
    category: categoryFilter,
    status: statusFilter,
  });

  const [reviewVendor] = useReviewVendorMutation();

  const suggestions: VendorSuggestion[] = data?.data ?? [];

  /* ===================== COLUMNS ===================== */
  const columns: ColumnDef<VendorSuggestion>[] = [
    {
      header: 'Vendor Name',
      cell: ({ row }) => <b>{row.original.vendorName}</b>,
    },
    {
      header: 'Category',
      cell: ({ row }) => row.original.category,
    },
    {
      header: 'Email',
      cell: ({ row }) => row.original.email,
    },
    {
      header: 'Mobile', // ✅ new update
      cell: ({ row }) => row.original.mobile || '—',
    },
    {
      header: 'Website',
      cell: ({ row }) =>
        row.original.website ? (
          <a href={row.original.website} target="_blank" className="text-primary underline">
            Visit
          </a>
        ) : (
          '—'
        ),
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;

        const statusStyle =
          status === 'Pending'
            ? 'bg-yellow-100 text-yellow-800'
            : status === 'Approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800';

        return (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}>
            {status}
          </span>
        );
      },
    },
    {
      header: 'Created',
      cell: ({ row }) => formatDate(new Date(row.original.createdAt)),
    },
    {
      header: 'Action',
      cell: ({ row }) => {
        const isPending = row.original.status === 'Pending';

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!isPending}
              onClick={() => {
                reviewVendor({
                  vendorId: row.original.id,
                  status: 'Approved',
                });
                toast.error('Approved Successfully!');
              }}
            >
              Approve
            </Button>

            <Button
              size="sm"
              variant="destructive"
              disabled={!isPending}
              onClick={() => {
                reviewVendor({
                  vendorId: row.original.id,
                  status: 'Rejected',
                });
                toast.error('Rejected Successfully!');
              }}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  /* ===================== TABLE ===================== */
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-sm overflow-hidden">
      <DataTable
        data={suggestions}
        columns={columns}
        enableCategoryFilter={true}
        enableVendorStatusFilter={true}
        onCategoryFilterChange={(value) => {
          setCategoryFilter(value === 'ALL' ? undefined : value);
        }}
        onVendorStatusFilterChange={(value) => {
          setStatusFilter(value === 'ALL' ? undefined : value);
        }}
        onSearchChange={(value) => {
          setSearch(value);
        }}
      />
    </div>
  );
}
