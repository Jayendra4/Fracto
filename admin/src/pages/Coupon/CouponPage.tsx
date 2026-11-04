import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2, ShieldBan, ShieldCheck, Eye, Badge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
import { useGetCouponsQuery, useUpdateCouponStatusMutation } from '@/store/api/couponApi';
import Loader from '@/components/common/Loader';
import { CouponStatus } from '@/types';
import { useDebounce } from '@/hooks';
import CouponModal from './CouponModal';

/* ===================== TYPES ===================== */

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'Percentage' | 'Fixed' | 'FractionBonus';
  discountValue: string;
  bonusFractions: number | null;
  maxDiscountAmount: string;
  minPurchaseAmount: string;
  totalUsageLimit: number;
  perUserLimit: number;
  validFrom: string;
  validTill: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  couponStatus: CouponStatus;
}
interface ValidityRow {
  validFrom: string;
  validTill: string;
}
type Status = 'All'|'Scheduled' | 'Active' | 'InActive' | 'Expired';

// function CouponStatusBadge({ status }: { status: CouponStatus }) {
//   const config: any = {
//     Active: {
//       label: 'Active',
//       container: 'bg-green-100 text-green-800',
//       dot: 'bg-green-500',
//     },
//     Blocked: {
//       label: 'Disabled',
//       container: 'bg-red-100 text-red-800',
//       dot: 'bg-red-500',
//     },
//   };

//   const { label, container, dot } = config[status];

//   return (
//     <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${container}`}>
//       <span className={`mr-1 h-2 w-2 rounded-full ${dot}`} />
//       {label}
//     </span>
//   );
// }

/* ===================== ACTIONS ===================== */

function CouponActions({ coupon }: { coupon: Coupon }) {
  const [updateCouponStatus] = useUpdateCouponStatusMutation();

  // 1. Setup Date Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validFromDate = new Date(coupon.validFrom);
  validFromDate.setHours(0, 0, 0, 0);

  const validTillDate = new Date(coupon.validTill);
  validTillDate.setHours(0, 0, 0, 0);

  // 2. Define Condition Helpers
  const isExpired = coupon.couponStatus === 'Expired' || validTillDate < today;
  const isScheduled = coupon.couponStatus === 'Scheduled';
  const isInRange = today >= validFromDate && today <= validTillDate;

  const handleStatusChange = async (data: { isActive?: boolean; isDeleted?: boolean }) => {
    await updateCouponStatus({
      couponId: coupon.id,
      ...data,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isExpired ? (
          <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
            <ShieldBan className="w-4 h-4 mr-2" />
            Expired
          </DropdownMenuItem>
        ) : isScheduled ? (
          <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
            <MoreHorizontal className="w-4 h-4 mr-2" />
            Scheduled
          </DropdownMenuItem>
        ) : (
          <>
            {coupon.couponStatus === 'InActive' && (
              <DropdownMenuItem
                disabled={!isInRange}
                onClick={() => isInRange && handleStatusChange({ isActive: true })}
                className={!isInRange ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Activate
              </DropdownMenuItem>
            )}

            {coupon.couponStatus === 'Active' && (
              <DropdownMenuItem
                disabled={!isInRange}
                onClick={() => isInRange && handleStatusChange({ isActive: false })}
                className={!isInRange ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <ShieldBan className="w-4 h-4 mr-2" />
                Inactivate
              </DropdownMenuItem>
            )}
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive"
          onClick={() => handleStatusChange({ isDeleted: true })}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ===================== PAGE ===================== */

export function CouponsPage() {
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponStatus, setCouponStatus] = useState<Status>('All');;
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useGetCouponsQuery({
    skip: pageIndex * pageSize,
    take: pageSize,
    search: debouncedSearch,
    couponStatus: couponStatus === 'All' ? undefined : couponStatus,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0); 
  };

const coupons: Coupon[] =
  data?.data?.map((c: any) => {
    // Normalize the status string
    const rawStatus = c.couponStatus || (c.isActive ? 'Active' : 'InActive');

    return {
      ...c,
      couponStatus: rawStatus,
    };
  }) ?? [];

  const totalCount = data?.count ?? 0;

  const columns: ColumnDef<Coupon>[] = [
    {
      header: 'Code',
      cell: ({ row }) => <span className="font-mono font-semibold">{row.original.code}</span>,
    },
    {
      header: 'Discount',
      cell: ({ row }) => {
        const c = row.original;
        return c.discountType === 'Percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`;
      },
    },
    {
      header: 'Total Usage Limit',
      cell: ({ row }) => <span className="text-center">{row.original.totalUsageLimit}</span>,
    },
    {
      header: 'Per User Limit',
      cell: ({ row }) => <span className="text-center">{row.original.perUserLimit}</span>,
    },
    {
      header: 'Validity',
      cell: ({ row }) => {
        const formatToIST = (dateString: string) => {
          return new Date(dateString).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        };

        return (
          <div className="text-sm">
            <div>{formatToIST(row.original.validFrom)}</div>
            <div className="text-muted-foreground">to {formatToIST(row.original.validTill)}</div>
          </div>
        );
      },
    },
    {
      header: () => <div className="text-left">Coupon Status</div>,
      accessorKey: 'couponStatus',
      cell: ({ row }) => {
        const status = row.original.couponStatus;

        const statusStyles: Record<string, string> = {
          Active: 'bg-green-500/10 text-green-500 border-green-500/20',
          Expired: 'bg-red-500/10 text-red-500 border-red-500/20',
          Scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          InActive: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        };

        return (
          <div className="text-left">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                statusStyles[status as string] ||
                'bg-slate-500/10 text-slate-500 border-slate-500/20'
              }`}
            >
              <span className="mr-1.5 text-[10px]">●</span>
              {status}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Created',
      cell: ({ row }) => <span>{formatDate(new Date(row.original.createdAt))}</span>,
    },
    {
      id: 'view',
      header: () => <div className="text-center">View</div>,
      cell: ({ row }) => (
        <div className="flex justify-start">
          <button
            onClick={() => {
              setSelectedRow(row.original);
              setIsModalOpen(true);
            }}
            className="p-2 transition rounded-full hover:bg-slate-700"
          >
            <Eye className="w-4 h-4 " />
          </button>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <CouponActions coupon={row.original} />,
      enableSorting: false,
    },
  ];

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-6 text-red-500">Failed to load coupons</div>;

  return (
    <div className="pb-10 space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Coupons</h2>
          <p className="text-slate-400">Manage discount coupons and validation.</p>
        </div>
        <div className="flex gap-2 p-1 border rounded-lg bg-slate-900/50 border-slate-800">
          <Button
            onClick={() => navigate('/create-coupon')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Create Coupon
          </Button>
        </div>
      </div>

      <div className="px-1 overflow-hidden shadow-xl rounded-xl bg-slate-900/50">
        <DataTable
          data={coupons}
          columns={columns}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={Math.ceil(totalCount / pageSize)}
          manualPagination
          onPaginationChange={(updater) => {
            const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
            setPageIndex(next.pageIndex);
            setPageSize(next.pageSize);
          }}
          statusFilter={couponStatus === 'All' ? 'ALL' : couponStatus} // Pass the state back down
          onCouponStatusFilterChange={(value) => {
            const mappedValue = value === 'ALL' ? 'All' : value;
            setCouponStatus(mappedValue as Status);
            setPageIndex(0);
          }}
          enableSearch={true}
          enableCouponStatusFilter={true}
          search={search}
          searchPlaceholder="Search coupons..."
          onSearchChange={handleSearchChange}
        />
      </div>
      {isModalOpen && selectedRow && (
        <CouponModal data={selectedRow} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
