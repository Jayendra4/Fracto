import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { DataTable } from '@/components/common/DataTable';
import Loader from '@/components/common/Loader';
import {
  useGetTrusteeVerifierTrackerQuery,
  SPVVerifierCheckpoint,
  SPVVerifierRecord,
} from '@/store/api/spvApi';
import { useDebounce } from '@/hooks';

type TabKey = 'signOff' | 'assetVerification' | 'legalCheck' | 'distribution';

interface Tab {
  key: TabKey;
  label: string;
}

const tabs: Tab[] = [
  // { key: 'signOff', label: 'Sign-Off Log' },
  { key: 'assetVerification', label: 'Asset Verification Flow' },
  // { key: 'legalCheck', label: 'Legal Check Flow' },
  // { key: 'distribution', label: 'Distribution Flow' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const isPositive =
    status.startsWith('Approved') ||
    status.startsWith('Confirmed') ||
    status.startsWith('Countersigned');

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
        isPositive ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
      }`}
    >
      {status}
    </span>
  );
};

interface SignOffEntry {
  id: number;
  action: string;
  spv: string;
  verifiedBy: string;
  dateTime: string;
}

const signOffLog: SignOffEntry[] = [
  {
    id: 1,
    action: 'Distribution Released — Q1 FY26-27 Rental',
    spv: 'FRACTO-SPV-014',
    verifiedBy: 'Trustee & Governance Officer',
    dateTime: '12 Jun 2026, 10:14',
  },
  {
    id: 2,
    action: 'Distribution Released — Q3 FY25-26 Rental',
    spv: 'FRACTO-SPV-014',
    verifiedBy: 'Trustee & Governance Officer',
    dateTime: '10 Dec 2025, 15:02',
  },
  {
    id: 3,
    action: 'Distribution Released — Q4 FY25-26 Timeshare',
    spv: 'FRACTO-SPV-014',
    verifiedBy: 'Trustee & Governance Officer',
    dateTime: '28 Mar 2026, 09:47',
  },
  {
    id: 4,
    action: 'Lease Renewal Approval (Governance Vote)',
    spv: 'FRACTO-SPV-021',
    verifiedBy: 'Trustee & Governance Officer',
    dateTime: '14 Jan 2026, 11:30',
  },
  {
    id: 5,
    action: 'Annual Capex Reserve Approval (Governance Vote)',
    spv: 'FRACTO-SPV-014',
    verifiedBy: 'Trustee & Governance Officer',
    dateTime: '02 Mar 2026, 14:20',
  },
];

const signOffColumns: ColumnDef<SignOffEntry>[] = [
  { header: 'Action', accessorKey: 'action' },
  { header: 'SPV', accessorKey: 'spv' },
  { header: 'Verified By', accessorKey: 'verifiedBy' },
  { header: 'Date/Time', accessorKey: 'dateTime' },
];

const verificationColumns: ColumnDef<SPVVerifierCheckpoint>[] = [
  { header: 'Checkpoint', accessorKey: 'checkpoint' },
  { header: 'Verified By', accessorKey: 'verifiedBy' },
  { header: 'Date', accessorKey: 'date' },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

interface LegalCheckEntry {
  id: number;
  item: string;
  spv: string;
  legalReviewer: string;
  trusteeCountersign: string;
}

const legalCheckFlow: LegalCheckEntry[] = [
  {
    id: 1,
    item: 'SHA Execution',
    spv: 'FRACTO-SPV-014',
    legalReviewer: 'Legal/Valuation/DD Team',
    trusteeCountersign: 'Countersigned 10 Mar 2026',
  },
  {
    id: 2,
    item: 'SHA Execution',
    spv: 'FRACTO-SPV-021',
    legalReviewer: 'Legal/Valuation/DD Team',
    trusteeCountersign: 'Countersigned 20 Dec 2024',
  },
  {
    id: 3,
    item: 'SHA Execution',
    spv: 'FRACTO-SPV-027',
    legalReviewer: 'Legal/Valuation/DD Team',
    trusteeCountersign: 'Awaiting Countersign — Subscription still open',
  },
  {
    id: 4,
    item: 'Secondary Transfer — SHA Restriction Check (500 units)',
    spv: 'FRACTO-SPV-014',
    legalReviewer: 'Trustee (self-reviewed)',
    trusteeCountersign: 'Pending',
  },
];

const legalCheckColumns: ColumnDef<LegalCheckEntry>[] = [
  { header: 'Item', accessorKey: 'item' },
  { header: 'SPV', accessorKey: 'spv' },
  { header: 'Legal Reviewer', accessorKey: 'legalReviewer' },
  {
    header: 'Trustee Countersign',
    accessorKey: 'trusteeCountersign',
    cell: ({ row }) => <StatusBadge status={row.original.trusteeCountersign} />,
  },
];

interface DistributionEntry {
  id: number;
  spv: string;
  type: string;
  period: string;
  amount: string;
  releasedBy: string;
  dateTime: string;
}

const distributionFlow: DistributionEntry[] = [
  {
    id: 1,
    spv: 'FRACTO-SPV-014',
    type: 'Rental',
    period: 'Q1 FY26-27',
    amount: '₹5,33,500',
    releasedBy: 'Trustee & Governance Officer',
    dateTime: '12 Jun 2026, 10:14',
  },
  {
    id: 2,
    spv: 'FRACTO-SPV-014',
    type: 'Rental',
    period: 'Q3 FY25-26',
    amount: '₹5,58,800',
    releasedBy: 'Trustee & Governance Officer',
    dateTime: '10 Dec 2025, 15:02',
  },
  {
    id: 3,
    spv: 'FRACTO-SPV-014',
    type: 'Timeshare',
    period: 'Q4 FY25-26',
    amount: '₹2,09,440',
    releasedBy: 'Trustee & Governance Officer',
    dateTime: '28 Mar 2026, 09:47',
  },
];

const distributionColumns: ColumnDef<DistributionEntry>[] = [
  { header: 'SPV', accessorKey: 'spv' },
  { header: 'Type', accessorKey: 'type' },
  { header: 'Period', accessorKey: 'period' },
  { header: 'Amount', accessorKey: 'amount' },
  { header: 'Released By', accessorKey: 'releasedBy' },
  { header: 'Date/Time', accessorKey: 'dateTime' },
];

const VerifierTracker = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('assetVerification');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // SPV List pagination
  const [spvSkip, setSpvSkip] = useState(0);
  const [spvTake, setSpvTake] = useState(10);

  // Reset pagination when search changes
  useEffect(() => {
    setSpvSkip(0);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useGetTrusteeVerifierTrackerQuery({
    skip: spvSkip,
    take: spvTake,
    search: debouncedSearch || undefined,
  }, {
    skip: activeTab !== 'assetVerification',
  });

  const assetVerificationFlowList = data?.data || [];

  if (activeTab === 'assetVerification' && isLoading) {
    return <Loader />;
  }

  if (activeTab === 'assetVerification' && isError) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center text-sm text-destructive">
        Failed to load verifier tracker data. Please try again.
      </div>
    );
  }

  const currentPage = Math.floor(spvSkip / spvTake) + 1;
  const totalPages = data ? Math.ceil(data.count / spvTake) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verifier Tracker</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Sign-off/countersignature log across every asset verification, legal check, and
          distribution release you action.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* {activeTab === 'signOff' && (
        <div className="rounded-xl border bg-background p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-foreground">Master Sign-Off Log</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every release, transfer approval, and DD confirmation you make is recorded here
              automatically, with timestamp.
            </p>
          </div>

          <DataTable
            data={signOffLog}
            columns={signOffColumns}
            enableSearch={false}
            enableColumnVisibility={false}
            hidePagination
          />
        </div>
      )} */}

      {activeTab === 'assetVerification' && (
        <div className="space-y-4">
          <div className="mb-4 flex w-full items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SPV or asset..."
              className="h-9 flex-1 rounded-md border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
          </div>

          {assetVerificationFlowList.length > 0 ? (
            assetVerificationFlowList.map((group: SPVVerifierRecord) => (
              <div key={group.spvId} className="rounded-xl border bg-background p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-sm font-bold text-foreground">
                    {group.spvName} — {group.assetTitle}
                  </h2>
                  <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    RWA: {group.rwaStatus}
                  </span>
                </div>

                <DataTable
                  data={group.checkpoints}
                  columns={verificationColumns}
                  enableSearch={false}
                  enableColumnVisibility={false}
                  hidePagination
                />
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-background px-5 py-10 text-center text-sm text-muted-foreground">
              No verifier records found.
            </div>
          )}

          {/* SPV List Pagination */}
          {data && data.count > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{spvSkip + 1}</span> to{' '}
                <span className="font-medium text-foreground">
                  {Math.min(spvSkip + spvTake, data.count)}
                </span>{' '}
                of <span className="font-medium text-foreground">{data.count}</span> SPVs
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">SPVs per page</p>
                  <select
                    value={spvTake}
                    onChange={(e) => {
                      setSpvTake(Number(e.target.value));
                      setSpvSkip(0);
                    }}
                    className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSpvSkip((prev) => Math.max(0, prev - spvTake))}
                    disabled={spvSkip === 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setSpvSkip((prev) => prev + spvTake)}
                    disabled={spvSkip + spvTake >= data.count}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* {activeTab === 'legalCheck' && (
        <div className="rounded-xl border bg-background p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-foreground">
              Legal Checkpoints Requiring Trustee Countersignature
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Legal/Valuation/DD completes the underlying review; Trustee countersigns before it
              becomes binding at the SPV level.
            </p>
          </div>

          <DataTable
            data={legalCheckFlow}
            columns={legalCheckColumns}
            enableSearch={false}
            enableColumnVisibility={false}
            hidePagination
          />
        </div>
      )} */}

      {/* {activeTab === 'distribution' && (
        <div className="rounded-xl border bg-background p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-foreground">Distribution Release Flow</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every distribution — Rental, Timeshare, or eventual Sale Profit — recorded at the
              moment of release.
            </p>
          </div>

          <DataTable
            data={distributionFlow}
            columns={distributionColumns}
            enableSearch={false}
            enableColumnVisibility={false}
            hidePagination
          />
        </div>
      )} */}
    </div>
  );
};

export default VerifierTracker;
