import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import Loader from '@/components/common/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useGetInterestedMemberQuery } from '@/store/api/allGroupApi';
export type GroupMemberRow = {
  user: any;
  id: number;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
  type: string;
};

export function InterestedMemberList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { groupId, propertyId } = useParams();

  const propertyIds = Number(propertyId);

  const groupIds = Number(groupId);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetInterestedMemberQuery(
    {
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
      groupId: groupIds,
      assetId: propertyIds,
    },
    {
      skip: !propertyIds && !groupIds,
    }
  );

  const totalCount = data?.count || 0;
  const members: GroupMemberRow[] =
    data?.data?.map((item: any) => ({
      id: item.accountId,
      name: `${item.account?.firstname || ''} ${item.account?.lastname || ''}`,
      email: item.account?.email || '-',
      mobile: item.account?.mobile || '-',
      createdAt: item.createdAt,
      type: item.account?.type,
    })) || [];

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
      header: 'Type',
      accessorKey: 'type',
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
        pageCount={Math.ceil(totalCount / pageSize)}
        manualPagination
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
