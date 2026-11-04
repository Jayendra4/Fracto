import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2, ShieldBan, ShieldCheck, Pencil } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import VendorSuggestionTable from './VendorSuggestionTable';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DataTable } from '@/components/common/DataTable';
import { formatDate } from '@/utils';
import { useDebounce } from '@/hooks';
import {
  useGetVendorsQuery,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useCreateVendorMutation,
} from '@/store/api/vendorApi';

import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

/* ===================== TYPES ===================== */

export type VendorStatus = 'Active' | 'Blocked';

export interface Vendor {
  description: string | undefined;
  mobile: string;
  id: number;
  name: string;
  category: 'Legal' | 'Compliance' | 'Valuation' | 'Audit' | 'Trustee';
  email: string;
  phone?: string;
  website?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  status: VendorStatus;
}

/* ===================== STATUS BADGE ===================== */

function VendorStatusBadge({ status }: { status: VendorStatus }) {
  const config: Record<VendorStatus, any> = {
    Active: {
      label: 'Active',
      container: 'bg-green-100 text-green-800',
      dot: 'bg-green-500',
    },
    Blocked: {
      label: 'Disabled',
      container: 'bg-red-100 text-red-800',
      dot: 'bg-red-500',
    },
  };

  const { label, container, dot } = config[status];

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${container}`}>
      <span className={`mr-1 h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* ===================== ACTIONS ===================== */

function VendorActions({ vendor }: { vendor: Vendor }) {
  const [updateVendor] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleUpdate = async (data: { isActive?: boolean; isDeleted?: boolean }) => {
    await updateVendor({
      vendorId: vendor.id,
      ...data,
    });
  };

  const handleDelete = async () => {
    try {
      await deleteVendor(vendor.id).unwrap();
      toast.success(`${vendor.name} deleted successfully`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Delete failed');
      console.error('Delete failed', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate(`/vendors/edit/${vendor?.id}`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          {vendor.status !== 'Active' && (
            <DropdownMenuItem onClick={() => handleUpdate({ isActive: true })}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Activate
            </DropdownMenuItem>
          )}

          {vendor.status === 'Active' && (
            <DropdownMenuItem onClick={() => handleUpdate({ isActive: false })}>
              <ShieldBan className="mr-2 h-4 w-4" />
              Disable
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setModalOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete Vendor?"
        description={`Are you sure you want to delete ${vendor.name}?`}
        onConfirm={handleDelete}
        isDestructive
      />
    </>
  );
}

/* ===================== PAGE ===================== */

export function LegalComplianceVendorsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [createVendor, { isLoading: isAdding }] = useCreateVendorMutation();

  // Form State
  const [formData, setFormData] = useState({
    vendorName: '',
    category: 'Legal',
    description: '',
    website: '',
    email: '',
    mobile: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVendor({
        vendorName: formData.vendorName,
        category: formData.category as 'Legal' | 'Compliance' | 'Valuation' | 'Audit' | 'Trustee',
        description: formData.description,
        website: formData.website,
        email: formData.email,
        phone: formData.mobile,
      }).unwrap();

      setOpen(false);
      setFormData({
        vendorName: '',
        category: 'Legal',
        description: '',
        website: '',
        email: '',
        mobile: '',
      });
    } catch (err) {
      console.error('Failed to add vendor', err);
    }
  };

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const debouncedSearch = useDebounce(search, 300);
  const [activeTab, setActiveTab] = useState<'VENDORS' | 'SUGGESTIONS'>('VENDORS');

  useEffect(() => {
    if (location.state?.openTab === 'SUGGESTIONS') {
      setActiveTab('SUGGESTIONS');
      window.history.replaceState({}, document.title);
    } else {
      setActiveTab('VENDORS');
    }
  }, [location.state]);

  const { data, isLoading, isError } = useGetVendorsQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch,
      status: statusFilter,
      category: categoryFilter,
    },
    {
      pollingInterval: 180000,
      refetchOnFocus: true,
    }
  );

  const vendors: Vendor[] =
    data?.data?.map((v: any) => ({
      ...v,
      status: v.isActive ? 'Active' : 'Blocked',
    })) ?? [];

  const totalCount = data?.count ?? 0;

  const columns: ColumnDef<Vendor>[] = [
    {
      header: 'Vendor Name',
      cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      cell: ({ row }) => <span>{row.original.category}</span>,
      filterFn: (row, id, value) => {
        if (!value || value === 'ALL') return true;
        return String(row.getValue(id)).toLowerCase() === String(value).toLowerCase();
      },
    },
    {
      header: 'Email',
      cell: ({ row }) => (
        <div className="max-w-[150px] break-all">
          <a href={`mailto:${row.original.email}`} className="text-primary underline">
            {row.original.email}
          </a>
        </div>
      ),
    },
    {
      header: 'Mobile',
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.mobile || '—'}</span>,
    },
    {
      header: 'Website',
      cell: ({ row }) => (
        <div className="min-w-[80px]">
          {row.original.website ? (
            <a href={row.original.website} target="_blank" className="text-primary underline">
              Visit
            </a>
          ) : (
            '—'
          )}
        </div>
      ),
    },
    {
      header: 'Description',
      cell: ({ row }) => (
        <div
          className="max-w-[200px] whitespace-normal break-words text-sm line-clamp-2"
          title={row.original.description}
        >
          {row.original.description || '—'}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <VendorStatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        if (!value || value === 'ALL') return true;
        return String(row.getValue(id)) === String(value);
      },
    },
    {
      header: 'Created',
      cell: ({ row }) => <span>{formatDate(new Date(row.original.createdAt))}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <VendorActions vendor={row.original} />,
      enableSorting: false,
    },
  ];

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load vendors</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">Legal & Compliance Vendors</h2>

        <div className="flex bg-slate-900/50 border border-slate-800 rounded-lg p-1 gap-2">
          <Button
            onClick={() => navigate('/vendors/create')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Add Vendor
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-900/50 border border-slate-800 p-1 w-fit">
        <button
          onClick={() => setActiveTab('VENDORS')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition
      ${
        activeTab === 'VENDORS'
          ? 'bg-slate-700 text-white shadow'
          : 'text-slate-400 hover:text-white'
      }
    `}
        >
          Vendor List
        </button>

        <button
          onClick={() => setActiveTab('SUGGESTIONS')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition
      ${
        activeTab === 'SUGGESTIONS'
          ? 'bg-slate-700 text-white shadow'
          : 'text-slate-400 hover:text-white'
      }
    `}
        >
          Suggestion List
        </button>
      </div>

      {activeTab === 'VENDORS' && (
        <div className="rounded-xl bg-slate-900/50 shadow-sm overflow-hidden px-1">
          <DataTable
            data={vendors}
            columns={columns}
            enableCategoryFilter={true}
            onCategoryFilterChange={(value) => {
              setCategoryFilter(value === 'ALL' ? undefined : value);
              setPageIndex(0);
            }}
            onVendorStatusFilterChange={(value) => {
              setStatusFilter(value === 'ALL' ? undefined : value);
              setPageIndex(0);
            }}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={Math.ceil(totalCount / pageSize)}
            manualPagination
            onPaginationChange={(updater) => {
              const next =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
              setPageIndex(next.pageIndex);
              setPageSize(next.pageSize);
            }}
            onSearchChange={(value) => {
              setSearch(value);
              setPageIndex(0);
            }}
          />
        </div>
      )}

      {activeTab === 'SUGGESTIONS' && <VendorSuggestionTable />}
    </div>
  );
}
