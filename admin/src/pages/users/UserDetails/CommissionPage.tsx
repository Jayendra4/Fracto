import { useState, useEffect, useMemo } from 'react';
import { Search, IndianRupee, Calendar, ClipboardList } from 'lucide-react';
import { useGetCommissionsQuery } from '@/store/api/commissionApi';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils';
import Loader from '@/components/common/Loader';
import { DataTable } from '@/components/common/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';

interface BrokerCommissionsProps {
  brokerId: number;
}

export function BrokerCommissions({ brokerId }: BrokerCommissionsProps) {
  const [leadType, setLeadType] = useState<'investor' | 'assetOwner'>('investor');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetCommissionsQuery({
    brokerId: brokerId,
    take: pageSize,
    skip: pageIndex * pageSize,
    type: leadType === 'investor' ? 'InvestorSignup' : 'AssetOwnerSignup',
    search: searchQuery,
  });

  useEffect(() => {
    refetch();
  }, [refetch, leadType, pageIndex, pageSize, searchQuery]);

  const rawData = response?.data || [];
  const totalCount = response?.count || 0;

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: () => (
          <span className="flex items-center">
            <ClipboardList className="w-3 h-3 mr-1" /> Asset Details
          </span>
        ),
        accessorKey: 'asset',
        cell: ({ row }) => (
          <div>
            <div className="text-base font-bold text-white truncate">
              {row.original.asset?.title || 'N/A'}
            </div>
            <div className="text-xs italic text-slate-500">
              Campaign: {row.original.campaignCode}
            </div>
          </div>
        ),
      },
      {
        header: 'Investor',
        accessorFn: (row) => row.investor?.name,
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-200">{row.original.investor?.name}</div>
            <div className="text-xs text-slate-500">{row.original.investor?.email}</div>
          </div>
        ),
      },
      {
        header: () => (
          <div className="text-center">
            <IndianRupee className="inline w-3 h-3 mr-1" /> Amount
          </div>
        ),
        accessorKey: 'commissionAmount',
        cell: ({ getValue }) => (
          <div className="text-base font-bold text-center text-blue-400">
            ₹{getValue() as number}
          </div>
        ),
      },
      {
        header: () => <div className="text-center">Status</div>,
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <div className="text-center">
              <Badge
                className={`px-3 py-1 rounded-full text-[12px] border hover:bg-white/10 ${
                  status === 'Confirmed'
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}
              >
                ● {status === 'Confirmed' ? 'Released' : status}
              </Badge>
            </div>
          );
        },
      },
      {
        header: 'Release Date',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => (
          <div className="text-xs text-slate-500">
            <Calendar className="inline w-3 h-3 mr-1 opacity-50" />
            {formatDate(new Date(getValue() as string))}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 space-y-6">
      <>
        <div className="flex inline-flex self-start w-full gap-1 p-1 border rounded-lg bg-slate-700/50 md:w-auto border-slate-700 ">
          <button
            onClick={() => {
              setLeadType('investor');
              setPageIndex(0);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200
                    ${leadType === 'investor' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Investor
          </button>
          <button
            onClick={() => {
              setLeadType('assetOwner');
              setPageIndex(0);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200
                    ${leadType === 'assetOwner' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Asset owner
          </button>
        </div>

        {/* Header */}
        <div className="pt-2">
          <h3 className="text-2xl font-bold tracking-tight text-white">Commission Management</h3>
          <p className="mt-1 text-sm text-slate-400">
            Managing {totalCount} {leadType === 'investor' ? 'Investor' : 'Asset owner'} records
          </p>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800">
            <CardContent className="p-0">
              <DataTable
                data={rawData}
                columns={columns}
                search={searchQuery}
                onSearchChange={(s) => {
                  setSearchQuery(s);
                  setPageIndex(0);
                }}
                enableSearch={true}
                pageCount={Math.ceil(totalCount / pageSize)}
                pageIndex={pageIndex}
                pageSize={pageSize}
                manualPagination={true}
                onPaginationChange={(updater) => {
                  const next =
                    typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
                  setPageIndex(next.pageIndex);
                  setPageSize(next.pageSize);
                }}
                enableStatusFilter={false} // Custom status badges used in cell
              />
            </CardContent>
          </Card>
        )}
      </>
    </div>
  );
}
