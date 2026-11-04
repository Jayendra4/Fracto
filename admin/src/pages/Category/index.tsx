import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ShieldBan, Trash2 } from 'lucide-react';
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
import Loader from '@/components/common/Loader';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  useDeleteCategoryMutation,
  useGetCategoryQuery,
  useUpdateCategoryStatusMutation,
} from '@/store/api/groupApi';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { useHasPermission } from '@/hooks/redux';

type Category = {
  id: number;
  name: string;
  categoryStatus: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`px-2 py-1 ${
        status === 'Active'
          ? 'text-green-400 border-green-500/20'
          : 'text-red-400 border-red-500/20'
      }`}
    >
      {status || 'N/A'}
    </Badge>
  );
}

function CategoryActions({ category }: { category: Category }) {
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();
  const [updateStatus] = useUpdateCategoryStatusMutation();
  const [modalOpen, setModalOpen] = useState(false);

  const canActivate = useHasPermission('category.activate');
  const canDeactivate = useHasPermission('category.deactivate');
  const canDelete = useHasPermission('category.delete');
  const canToggleStatus =
    category.categoryStatus === 'Active' ? canDeactivate : canActivate;

  if (!canToggleStatus && !canDelete) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = category.categoryStatus === 'Active' ? 'Inactive' : 'Active';

    try {
      await updateStatus({
        id: category.id,
        status: newStatus,
      }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message);
      console.error('Status update failed', err);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {canToggleStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleStatus}>
                <ShieldBan className="mr-2 h-4 w-4" />
                {category.categoryStatus === 'Active' ? 'Inactive' : 'Active'}
              </DropdownMenuItem>
            </>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setModalOpen(true)} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete Category?"
        description={`Are you sure you want to delete "${category.name}"?`}
        onConfirm={handleDelete}
        isDestructive
      />
    </>
  );
}

export function Category() {
  const navigate = useNavigate();
  const canCreate = useHasPermission('category.create');

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useGetCategoryQuery({
    search,
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  const requests: Category[] = data?.data || [];
  const totalCount = data?.count || 0;

  const columns: ColumnDef<Category>[] = [
    {
      header: 'S.No',
      cell: ({ row }) => (
        <span className="text-slate-400">{pageIndex * pageSize + row.index + 1}</span>
      ),
    },
    {
      header: 'Category Name',
      cell: ({ row }) => (
        <span className="text-slate-300 capitalize">{row.original.name?.trim() || 'N/A'}</span>
      ),
    },
    {
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.categoryStatus} />,
    },
    {
      header: 'Created At',
      cell: ({ row }) => (
        <span className="text-sm text-slate-400">
          {formatDate(new Date(row.original.createdAt))}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <CategoryActions category={row.original} />,
    },
  ];

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load categories</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Category Listing</h2>
          <p className="text-slate-400">Manage your categories</p>
        </div>

        {canCreate && (
          <Button onClick={() => navigate('/create-category')}>Add Category</Button>
        )}
      </div>

      {/* TABLE */}
      <Card className="bg-slate-900/50">
        <CardContent className="p-0">
          <DataTable
            data={requests}
            columns={columns}
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageCount={Math.ceil(totalCount / pageSize)}
            manualPagination
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPageIndex(0);
            }}
            searchPlaceholder="Search by category name..."
            onPaginationChange={(updater) => {
              const next =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

              setPageIndex(next.pageIndex);
              setPageSize(next.pageSize);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
