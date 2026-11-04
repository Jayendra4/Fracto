import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import { useGetUserInvestedAssetsQuery } from '@/store/api/assetsApi';
import Loader from '@/components/common/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, Pencil, ShieldBan, Trash2 } from 'lucide-react';
import { useGetGroupMemberByIdQuery, useRemoveGroupMemberMutation } from '@/store/api/allGroupApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

export type GroupMemberRow = {
  user: any;
  id: number;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
  type: string;
};

function GroupActions({ user, groupId }: { user: GroupMemberRow; groupId: number }) {
  const [removeMember, { isLoading: deleteLoading }] = useRemoveGroupMemberMutation();

  const handleDelete = async () => {
    if (!confirm(`Delete "${user.name}"?`)) return;

    try {
      await removeMember({
        groupId,
        accountId: user.id, // ✅ FIX
      }).unwrap();

      toast.success('Member removed successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0" disabled={deleteLoading}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDelete} className="text-red-500">
          <Trash2 className="w-4 h-4 mr-2" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GroupMembers() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { id } = useParams();
  const groupId = Number(id);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetGroupMemberByIdQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
      groupId,
    },
    {
      skip: !groupId, // ✅ important
    }
  );

  const totalCount = data?.count || 0;

  // const assets: InvestedAssetRow[] = data?.data?.map(mapInvestmentToRow) ?? [];

  // from new 6 update
  const members: GroupMemberRow[] =
    data?.data?.map((item: any) => ({
      id: item.accountId,
      name: `${item.account?.firstname || ''} ${item.account?.lastname || ''}`,
      email: item.account?.email || '-',
      mobile: item.account?.mobile || '-',
      createdAt: item.createdAt,
      type: item.account?.type,
    })) || [];

  // to new 6 update

  const columns: ColumnDef<GroupMemberRow>[] = [
    {
      header: 'Sr No',
      cell: ({ row }) => pageIndex * pageSize + row.index + 1,
    },
    {
      header: 'Member Name',
      accessorKey: 'name',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Mobile',
      accessorKey: 'mobile',
    },
    {
      header: 'Details',
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/users/${row.original.type}/detail/${row.original.id}`)}
          className="flex items-center justify-start w-full cursor-pointer"
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <GroupActions user={row.original} groupId={groupId} />,
    },
  ];
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load assets</div>;
  }

  return (
    <div className="space-y-8">
      <DataTable
        data={members}
        columns={columns}
        pageSize={pageSize}
        pageIndex={pageIndex}
        searchPlaceholder="Search by member name"
        // pageCount={Math.ceil(totalCount / pageSize)}
        pageCount={Math.ceil(totalCount / pageSize)} // new 6 update
        manualPagination
        // enableFilters={false}
        search={search}
        onSearchChange={handleSearchChange}
        onPaginationChange={(updater) => {
          const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

          setPageIndex(next.pageIndex);
          setPageSize(next.pageSize);
        }}
      />
    </div>
  );
}
