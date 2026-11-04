import { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { useGetLeadsQuery } from '@/store/api/brokerApi';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from '@/components/common/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@/utils';
import Loader from '@/components/common/Loader';

interface BrokerLeadsProps {
  brokerId: number;
}

export function BrokerLeads({ brokerId }: BrokerLeadsProps) {
  const [leadType, setLeadType] = useState<'investor' | 'assetOwner'>('investor');
  const FILTER_OPTIONS = [
    { label: 'Investor', value: 'InvestorSignup' },
    { label: 'Asset Owner', value: 'AssetOwnerSignup' },
  ] as const;
  const [type, setType] = useState<'InvestorSignup' | 'AssetOwnerSignup'>(FILTER_OPTIONS[0].value);
  const [searchQuery, setSearchQuery] = useState('');
  const { userType } = useParams();
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isError,
  } = useGetLeadsQuery({
    brokerId: brokerId,
    take: 50,
    skip: 0,
    type: leadType === 'investor' ? 'InvestorSignup' : 'AssetOwnerSignup',
    search: searchQuery,
  });

  const leadsList = response?.data || [];

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: leadType === 'investor' ? 'Investor Name' : 'Investor Name',
        accessorFn: (row) => row.user?.name,
        cell: ({ row }) => (
          <div>
            <div className="text-base font-bold text-white truncate">{row.original.user?.name}</div>
            <div className="text-xs truncate text-slate-500">{row.original.user?.email}</div>
          </div>
        ),
      },
    ];

    const investorColumns: ColumnDef<any>[] = [
      {
        header: 'Usage Count',
        accessorKey: 'usageCount',
        cell: ({ getValue }) => (
          <div className="font-medium text-center">{getValue() as number}</div>
        ),
      },
      {
        header: 'Reward Limit',
        accessorKey: 'rewardLimit',
        cell: ({ getValue }) => (
          <div className="font-medium text-center">{getValue() as number}</div>
        ),
      },
    ];

    const assetOwnerColumns: ColumnDef<any>[] = [
      {
        header: 'Referred Property',
        accessorFn: (row) => row?.referredPropertyInvited?.propertyDetails?.assetTitle,
        cell: ({ row }) => (
          <div className="font-medium text-left">
            {row.original?.referredPropertyInvited?.propertyDetails?.assetTitle ?? '-'}
          </div>
        ),
      },
    ];

    const statusColumns: ColumnDef<any>[] = [
      {
        header: 'Lead Status',
        cell: ({ row }) => {
          const kycStatus = row.original.user?.kycStatus;

          let status =
            kycStatus === 'Approved'
              ? 'Ready'
              : kycStatus === 'Rejected'
                ? 'Blocked'
                : 'KYC In Progress';

          if (row.original.isCompleted) {
            status = 'Completed';
          }

          const statusStyles: Record<string, string> = {
            'KYC In Progress': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
            Ready: 'bg-green-500/10 text-green-400 border-green-500/30',
            Blocked: 'bg-red-500/10 text-red-400 border-red-500/30',
            Completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          };

          return (
            <div className="text-center">
              <Badge className={statusStyles[status]}>● {status}</Badge>
            </div>
          );
        },
      },
      {
        header: 'Documents',
        cell: ({ row }) => {
          const kycStatus = row.original.user?.kycStatus;

          const documents =
            kycStatus === 'Approved'
              ? 'Completed'
              : kycStatus === 'Rejected'
                ? 'Rejected'
                : 'Partial';

          const color =
            documents === 'Completed'
              ? 'text-green-400'
              : documents === 'Rejected'
                ? 'text-red-400'
                : 'text-orange-400';

          return <div className={`text-center font-medium ${color}`}>{documents}</div>;
        },
      },
      {
        header: 'Last Action',
        accessorKey: 'updatedAt',
        cell: ({ getValue }) => (
          <div className="text-center text-slate-400">
            {getValue() ? formatDate(new Date(getValue() as string)) : '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Action</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <button
              onClick={() =>
                navigate(`/users/${userType}/detail/${brokerId}/leads/${row.original.id}`)
              }
              className="flex items-center justify-end gap-1 font-semibold transition-colors text-primary hover:text-primary/80"
            >
              View Details <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ),
      },
    ];

    return [
      ...baseColumns,
      ...(leadType === 'investor' ? investorColumns : assetOwnerColumns),
      ...statusColumns,
    ];
  }, [leadType, navigate, userType, brokerId]);

  return (
    <div className="p-4 space-y-6">
      <>
        <div className="flex inline-flex self-start w-full gap-1 p-1 border rounded-lg bg-slate-700/50 md:w-auto border-slate-700">
          <button
            onClick={() => setLeadType('investor')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200
            ${leadType === 'investor' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Investor
          </button>
          <button
            onClick={() => setLeadType('assetOwner')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200
            ${leadType === 'assetOwner' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Asset owner
          </button>
        </div>

        {/* Header */}
        <div className="px-6 py-2">
          <h3 className="text-2xl font-bold tracking-tight text-white">Lead Management</h3>
          <p className="text-sm text-slate-400 ">
            Managing {leadsList.length} {leadType === 'investor' ? 'Investor' : 'Asset owner'} leads
          </p>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <div className="p-20 font-medium text-center text-red-400">
            Failed to load leads from server.
          </div>
        ) : (
          <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800">
            <CardContent className="p-0">
              <DataTable
                data={leadsList}
                columns={columns}
                search={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name or email..."
                enableSearch={true}
                // Disable other filters for now as they weren't in original
                enableStatusFilter={false}
                pageSize={10}
              />
            </CardContent>
          </Card>
        )}
      </>
    </div>
  );
}
