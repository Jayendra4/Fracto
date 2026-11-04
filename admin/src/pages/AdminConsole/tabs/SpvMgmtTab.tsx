import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable';
import { useDebounce } from '@/hooks';
import { useGetSpvsQuery, useUpdateSpvStatusMutation } from '@/store/api/allGroupApi';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { useHasPermission } from '@/hooks/redux';

interface SpvMgmtTabProps {
  spvs: any[];
  setSpvModalOpen: (val: boolean) => void;
}

export function SpvMgmtTab({ spvs: _spvs, setSpvModalOpen }: SpvMgmtTabProps) {
  const canEnable = useHasPermission('spv.enable');
  const canDisable = useHasPermission('spv.disable');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useGetSpvsQuery({
    search: debouncedSearch || undefined,
    skip: pageIndex * pageSize,
    take: pageSize,
  });

  const [updateSpvStatus] = useUpdateSpvStatusMutation();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [toggleSpvData, setToggleSpvData] = useState<{
    id: number;
    name: string;
    checked: boolean;
  } | null>(null);

  const spvList = data?.data || [];
  const totalCount = data?.count || 0;

  const handleConfirmToggle = async () => {
    if (!toggleSpvData) return;
    const { id, checked } = toggleSpvData;
    const newStatus = checked ? 'Active' : 'Disabled';
    try {
      await updateSpvStatus({ id, status: newStatus }).unwrap();
      toast.success(`SPV status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update status');
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'SPV Name',
      accessorKey: 'name',
    },
    {
      header: 'Secondary Club',
      cell: ({ row }) => row.original.secondaryClub?.title || '—',
    },
    {
      header: 'Members',
      cell: ({ row }) => row.original._count?.members ?? 0,
    },
    {
      header: 'SPV Status',
      cell: ({ row }) => {
        const id = row.original.id;
        const name = row.original.name;
        const status = row.original.status || 'Active';
        const isActive = status === 'Active';

        const handleToggle = (checked: boolean) => {
          setToggleSpvData({ id, name, checked });
          setConfirmModalOpen(true);
        };

        const switchDisabled = isActive ? !canDisable : !canEnable;

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={switchDisabled}
              aria-label="Toggle SPV Status"
              title={
                switchDisabled
                  ? `You don't have permission to ${isActive ? 'disable' : 'enable'} an SPV`
                  : undefined
              }
            />
          </div>
        );
      },
    },
  ];

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-display">
            SPV Management
          </h2>
          <p className="text-slate-400">
            Initiate and track SPV setup once a Secondary Club is formed — from incorporation
            through management to exit.
          </p>
        </div>
      </div>

      <Card className="px-1 shadow-sm bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={spvList}
              columns={columns}
              pageSize={pageSize}
              pageIndex={pageIndex}
              pageCount={Math.ceil(totalCount / pageSize)}
              manualPagination
              search={search}
              searchPlaceholder={'Search by SPV name'}
              onSearchChange={handleSearchChange}
              enableStatusFilter={false}
              onPaginationChange={(updater) => {
                const next =
                  typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
                setPageIndex(next.pageIndex);
                setPageSize(next.pageSize);
              }}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setToggleSpvData(null);
        }}
        onConfirm={handleConfirmToggle}
        title={`${toggleSpvData?.checked ? 'Activate' : 'Disable'} SPV?`}
        description={
          toggleSpvData
            ? `Are you sure you want to ${toggleSpvData.checked ? 'activate' : 'disable'} the SPV "${toggleSpvData.name}"?`
            : ''
        }
        isDestructive={toggleSpvData ? !toggleSpvData.checked : false}
      />
    </div>
  );
}
