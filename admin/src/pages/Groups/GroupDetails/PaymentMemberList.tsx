import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import Loader from '@/components/common/Loader';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useGetAssetInvoiceListQuery } from '@/store/api/assetsApi';

export type PaymentMemberRow = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  tokenAmount: number;
  orderId: string;
  rozarpayPaymentId: string;
  paidAt: string;
  invoiceUrl: string;
};

export function PaymentMemberList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { propertyId } = useParams();

  const assetId = Number(propertyId);

  const { data, isLoading, isError } = useGetAssetInvoiceListQuery(
    {
      assetId,
      skip: pageIndex * pageSize,
      take: pageSize,
      search: debouncedSearch || undefined,
    },
    { skip: !assetId }
  );

  const totalCount = data?.count || 0;

  const members: PaymentMemberRow[] =
    data?.data?.map((item) => ({
      id: item.id,
      name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
      email: item.email || '-',
      mobile: item.mobile || '-',
      tokenAmount: item.tokenAmount,
      orderId: item.orderId || '-',
      rozarpayPaymentId: item.rozarpayPaymentId || '-',
      paidAt: item.paidAt ? new Date(item.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      invoiceUrl: item.invoiceUrl || '',
    })) || [];

  const columns: ColumnDef<PaymentMemberRow>[] = [
    {
      header: 'Sr No',
      cell: ({ row }) => pageIndex * pageSize + row.index + 1,
    },
    {
      header: 'Name',
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
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-slate-300">₹{row.original.tokenAmount?.toLocaleString('en-IN') ?? '—'}</span>
      ),
    },
    {
      header: 'Order ID',
      accessorKey: 'orderId',
    },
    {
      header: 'Payment ID',
      accessorKey: 'rozarpayPaymentId',
    },
    {
      header: 'Paid At',
      accessorKey: 'paidAt',
    },
    {
      header: 'Invoice',
      cell: ({ row }) =>
        row.original.invoiceUrl ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
            onClick={() => window.open(row.original.invoiceUrl, '_blank')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View
          </Button>
        ) : (
          <span className="text-slate-600">—</span>
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
    return <div className="p-6 text-red-500">Failed to load payments</div>;
  }

  return (
    <div className="space-y-8">
      <DataTable
        data={members}
        columns={columns}
        pageSize={pageSize}
        pageIndex={pageIndex}
        searchPlaceholder="Search by name"
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
