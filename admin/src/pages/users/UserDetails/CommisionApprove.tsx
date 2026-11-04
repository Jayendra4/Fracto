import { useMemo, useState } from 'react';
import { IndianRupee, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';
import { DataTable } from '@/components/common/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';

import { Eye } from 'lucide-react';
import CommissionModal from './CommissionModal';
import { useGetCommissionsPctQuery } from '@/store/api/commissionPctApi';

interface BrokerCommissionsProps {
  brokerId: number;
}
type InviteOwnerRow = {
  campaignId: number;
  proposedCommissionPct: string;
  assetOwnerStatus: string;
  adminStatus: string;
  status?: string;
  propertyDetails?: {
    assetTitle?: string;
  };
};

type Status = 'All' | 'Approved' | 'Rejected' | 'Pending';
type OnBoardingFilter = 'All' | 'Onboarded' | 'NotOnboarded';

export function BrokerCommissionsPct({ brokerId }: BrokerCommissionsProps) {
  const [assetOwnerStatus, setAssetOwnerStatus] = useState<Status>('All');
  const [adminStatus, setAdminStatus] = useState<Status>('All');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssetOnboarding, setIsAssetOnBBording] = useState<boolean | null>(null);

  const queryParams = useMemo(() => {
    const params: any = {
      brokerId,
      take: pageSize,
      skip: pageIndex * pageSize,
    };

    if (assetOwnerStatus !== 'All') {
      params.assetOwnerStatus = assetOwnerStatus;
    }

    if (adminStatus !== 'All') {
      params.adminStatus = adminStatus;
    }

    if (isAssetOnboarding !== null) {
      params.isAssetOnboarding = isAssetOnboarding;
    }
    return params;
  }, [brokerId, pageSize, pageIndex, assetOwnerStatus, adminStatus, isAssetOnboarding]);

  const { data: response, isLoading } = useGetCommissionsPctQuery(queryParams);

  const rawData = response?.data ?? [];
  const totalCount = response?.count ?? 0;
  const tableData = useMemo(
    () =>
      rawData.map((r: any) => ({
        ...r,
        status: r.adminStatus,
      })),
    [rawData]
  );
  function AdminStatusBadge({ status }: { status: string }) {
    if (status === 'Approved')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      );

    if (status === 'Rejected')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  }

  const columns = useMemo<ColumnDef<InviteOwnerRow>[]>(
    () => [
      {
        id: 'assetTitle',
        header: () => (
          <span className="flex items-center">
            <ClipboardList className="w-3 h-3 mr-1" /> Asset Details
          </span>
        ),
        accessorFn: (row) => row.propertyDetails?.assetTitle,
        cell: ({ row }) => (
          <div>
            <div className="text-base font-bold text-white truncate">
              {row.original.propertyDetails?.assetTitle ?? 'N/A'}
            </div>
            <div className="text-xs text-slate-500">Campaign: {row.original.campaignId}</div>
          </div>
        ),
      },

      {
        header: () => (
          <div className="text-left">
            <IndianRupee className="inline w-3 h-3 mr-1" /> Commission %
          </div>
        ),
        accessorKey: 'proposedCommissionPct',
        cell: ({ getValue }) => (
          <div className="font-bold text-left text-blue-400">{getValue() as string}%</div>
        ),
      },
      {
        header: () => <div className="text-left">Investor Status</div>,
        accessorKey: 'assetOwnerStatus',
        cell: ({ getValue }) => {
          const status = getValue() as string;

          return (
            <div className="text-left">
              <Badge
                className={`px-3 py-1 rounded-full text-[12px] border ${
                  status === 'Approved'
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : status === 'Rejected'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}
              >
                ● {status}
              </Badge>
            </div>
          );
        },
      },
      {
        header: () => <div className="text-left">Admin Status</div>,
        accessorKey: 'status',
        cell: ({ row }) => (
          <div className="text-left">
            <AdminStatusBadge status={row.original.adminStatus} />
          </div>
        ),
      },
      {
        id: 'view',
        header: () => <div className="text-center">View</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setSelectedRow(row.original);
                setIsModalOpen(true);
              }}
              className="p-2 transition rounded-full hover:bg-slate-700"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="pt-2">
          <h3 className="text-2xl font-bold text-white">Commission Approval</h3>
        </div>

        {/* <div className="flex gap-4 mb-4">
          <select
            value={assetOwnerStatus}
            onChange={(e) => {
              setAssetOwnerStatus(e.target.value as Status);
              setPageIndex(0);
            }}
            className="px-3 py-2 text-white border rounded-md bg-slate-800 border-slate-700"
          >
            <option value="All">InvestorStatus</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={adminStatus}
            onChange={(e) => {
              setAdminStatus(e.target.value as Status);
              setPageIndex(0);
            }}
            className="px-3 py-2 text-white border rounded-md bg-slate-800 border-slate-700"
          >
            <option value="All">Admin Status</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </div> */}
      </div>

      <Card className="px-1 bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          <DataTable
            data={tableData}
            columns={columns}
            enableSearch={false}
            pageCount={Math.ceil(totalCount / pageSize)}
            pageIndex={pageIndex}
            pageSize={pageSize}
            manualPagination={true}
            enableAdminStatusFilter={true}
            enableAssetOwnerStatusFilter={true}
            enableIsAssetOnboardingStatusFilter={true}
            onAssetOwnerStatusFilterChange={(value) => {
              const mappedValue = value === 'ALL' ? 'All' : value;
              setAssetOwnerStatus(mappedValue as Status);
              setPageIndex(0);
            }}
            onAdminStatusFilterChange={(value) => {
              const mappedValue = value === 'ALL' ? 'All' : value;
              setAdminStatus(mappedValue as Status);
              setPageIndex(0);
            }}
            onIsAssetOnboardingFilterChange={(value) => {
              if (value === 'true') setIsAssetOnBBording(true);
              else if (value === 'false') setIsAssetOnBBording(false);
              else setIsAssetOnBBording(null); // 'All'
              setPageIndex(0);
            }}
            onPaginationChange={(updater) => {
              const next =
                typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;

              setPageIndex(next.pageIndex);
              setPageSize(next.pageSize);
            }}
          />
        </CardContent>
      </Card>
      {isModalOpen && selectedRow && (
        <CommissionModal data={selectedRow} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
