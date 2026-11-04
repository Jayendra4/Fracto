import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreHorizontal, Pencil, ShieldBan, Trash2 } from 'lucide-react';
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
  useGetGroupsQuery,
  useDeleteGroupMutation,
  useUpdateGroupStatusMutation,
} from '@/store/api/allGroupApi';
import { useDebounce } from '@/hooks';
import toast from 'react-hot-toast';
import { useHasPermission } from '@/hooks/redux';

/* =========================
   TYPE
========================= */
type Group = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  groupStatus: 'Active' | 'Inactive';
  createdAt: string;
  category?: {
    name: string;
  };
  _count: {
    groupMember: number;
  };
};

/* =========================
   STATUS BADGE
========================= */
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
      {status}
    </Badge>
  );
}

/* =========================
   ACTIONS
========================= */
function GroupActions({ group }: { group: Group }) {
  const [deleteGroup] = useDeleteGroupMutation();
  const [updateStatus, { isLoading }] = useUpdateGroupStatusMutation();
  const navigate = useNavigate();

  const canEdit = useHasPermission('group.edit');
  const canActivate = useHasPermission('group.activate');
  const canDeactivate = useHasPermission('group.deactivate');
  const canDelete = useHasPermission('group.delete');
  const canToggleStatus = group.groupStatus === 'Active' ? canDeactivate : canActivate;

  const handleDelete = async () => {
    if (!confirm(`Delete "${group.title}"?`)) return;

    try {
      await deleteGroup(group.id).unwrap();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = group.groupStatus === 'Active' ? 'Inactive' : 'Active';

    try {
      await updateStatus({
        id: group.id,
        status: newStatus,
      }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message);
      console.error(err);
    }
  };

  if (!canEdit && !canToggleStatus && !canDelete) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0" disabled={isLoading}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {canEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/edit-group/${group.id}`)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
          </>
        )}

        {canToggleStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleStatus}>
              <ShieldBan className="mr-2 h-4 w-4" />
              {group.groupStatus === 'Active' ? 'Inactive' : 'Active'}
            </DropdownMenuItem>
          </>
        )}

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-500">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export function Groups() {
  const navigate = useNavigate();
  const canCreate = useHasPermission('group.create');
  const canViewDetails = useHasPermission('primary_group.view');

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError } = useGetGroupsQuery({
    search: debouncedSearch,
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  const requests: Group[] = data?.data || [];
  const totalCount = data?.count || 0;

  /* =========================
     COLUMNS
  ========================= */
  const columns: ColumnDef<Group>[] = [
    {
      header: 'S.No',
      cell: ({ row }) => <span>{pageIndex * pageSize + row.index + 1}</span>,
    },
    {
      header: 'Image',
      cell: ({ row }) => (
        <div className="w-10 h-10 overflow-hidden rounded-md bg-slate-800">
          {row.original.image ? (
            <img src={row.original.image} alt="group" className="object-cover w-full h-full" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-xs text-slate-400">
              N/A
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Group Name',
      cell: ({ row }) => <span className="text-white">{row.original.title}</span>,
    },
    {
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-slate-300">{row.original.category?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Members',
      cell: ({ row }) => (
        <span className="text-slate-300">{row.original._count?.groupMember ?? 0}</span>
      ),
    },
    {
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.groupStatus} />,
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
      header: 'Details',
      cell: ({ row }) => (
        <div className="flex items-center justify-start w-full">
          <Button
            variant="ghost"
            aria-label="eye "
            size="sm"
            disabled={!canViewDetails}
            title={!canViewDetails ? "You don't have permission to view group details" : undefined}
            onClick={() => navigate(`/group/detail/${row?.original?.id}`)}
            className="w-8 h-8 p-0 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <GroupActions group={row.original} />,
    },
  ];

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load groups</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Group Listing</h2>
          <p className="text-slate-400">Manage your groups</p>
        </div>

        {canCreate && <Button onClick={() => navigate('/create-group')}>Add Group</Button>}
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
            searchPlaceholder="Search by group name..."
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
