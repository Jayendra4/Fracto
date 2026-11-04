import { type JSX } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useOverviewBusiness } from '@/api/overview.api';

interface OverviewTabProps {
  navigate: (path: string) => void;
}

function formatValue(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// Buckets the free-text `status`/`stage` strings from the API into the
// badge colors this table already used for its old hardcoded rows.
function statusBadgeClasses(status: string): string {
  const s = status.toLowerCase();
  if (
    s.includes('live') ||
    s.includes('open for investment') ||
    s.includes('funded')
  ) {
    return 'bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400';
  }
  if (
    s.includes('review') ||
    s.includes('pending') ||
    s.includes('diligence') ||
    s.includes('query')
  ) {
    return 'bg-[#FFF4E0] text-[#B7791F] dark:bg-yellow-900/20 dark:text-yellow-400';
  }
  if (s.includes('requested') || s.includes('submission')) {
    return 'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-blue-400';
  }
  return 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400';
}

const PIPELINE_STATUS_CLASSES: Record<string, string> = {
  completed:
    'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-blue-400 font-semibold',
  current: 'bg-[#0B2545] text-white dark:bg-[#1F4FE0] font-semibold',
  pending: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
};

export default function OverviewTab({
  navigate,
}: OverviewTabProps): JSX.Element {
  const { data: business, isLoading } = useOverviewBusiness();
  const stats = business?.stats;
  const listedAssets = business?.listedAssets ?? [];
  const latestAsset = business?.latestAsset;
  const actionCenter = business?.actionCenter ?? [];

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
            Asset Owner Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
            Operational command center for your listed assets.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/add-asset')}
          className="w-full sm:w-auto bg-[#1F4FE0] text-white px-5 py-2.5 rounded-lg font-12 md:font-14 font-semibold hover:bg-[#153eb2] transition cursor-pointer self-start sm:self-auto shadow-md text-center"
        >
          + Add Asset
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => navigate('/dashboard/my-assets')}
          className="bg-white dark:bg-[#132436] cursor-pointer p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Assets Submitted
          </div>
          <div className="font-serif font-24 font-semibold text-[#0B2545] dark:text-white">
            {isLoading ? '—' : (stats?.totalAssets ?? 0)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 break-words">
            {stats?.liveCount ?? 0} live · {stats?.closedCount ?? 0} closed
          </div>
        </div>
        <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Total Asset Value
          </div>
          <div className="font-serif font-24 font-semibold text-[#0B2545] dark:text-white">
            {isLoading ? '—' : formatValue(stats?.totalValue ?? 0)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 break-words">
            {formatValue(stats?.openForInvestmentValue ?? 0)} open ·{' '}
            {formatValue(stats?.fullyLiquidatedValue ?? 0)} liquidated
          </div>
        </div>
        <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Capital Raised
          </div>
          <div className="font-serif font-24 font-semibold text-[#0B2545] dark:text-white">
            {isLoading ? '—' : formatValue(stats?.capitalRaised ?? 0)}
          </div>
          <div className="text-[11px] text-gray-400 mt-2 break-words">
            {stats?.capitalRaisedPercent ?? 0}% of listed value
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/my-assets')}
          className="text-left bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm hover:border-[#1F4FE0]/40 transition cursor-pointer"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Pending Actions
          </div>
          <div className="font-serif font-24 font-semibold text-[#0B2545] dark:text-white">
            {isLoading ? '—' : (stats?.pendingActions ?? 0)}
          </div>
          <div className="text-[11px] text-[#B7791F] dark:text-yellow-500 mt-2 break-words">
            {(stats?.pendingActions ?? 0) > 0 ? 'Needs attention' : 'All clear'}
          </div>
        </button>
        <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Compliance Queries
          </div>
          <div className="font-serif font-24 font-semibold text-[#0B2545] dark:text-white">
            {isLoading ? '—' : (stats?.complianceQueries ?? 0)}
          </div>
          <div className="text-[11px] text-[#B7791F] dark:text-yellow-500 mt-2 break-words">
            {(stats?.complianceQueries ?? 0) > 0
              ? 'Legal team query open'
              : 'No open queries'}
          </div>
        </div>
      </div>

      {/* Asset Pipeline & RM info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="lg:col-span-2 bg-white dark:bg-[#132436] p-4 sm:p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px] mb-4 break-words">
            {latestAsset
              ? `Asset Pipeline — ${latestAsset.assetTitle}`
              : 'Asset Pipeline'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              <span className="text-gray-400 text-[12.5px]">Loading…</span>
            ) : !latestAsset ? (
              <span className="text-gray-400 text-[12.5px]">
                No assets in the pipeline yet.
              </span>
            ) : (
              latestAsset.trackingPipeline.map((step, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] whitespace-nowrap ${
                    PIPELINE_STATUS_CLASSES[step.status] ??
                    PIPELINE_STATUS_CLASSES.pending
                  }`}
                >
                  {step.stage}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Relationship manager */}
        <div className="bg-white dark:bg-[#132436] p-4 sm:p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px] mb-2">
              Relationship Manager
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-12 md:font-14">
              Assigned: Riya Sharma
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/support')}
            className="w-full mt-4 bg-white dark:bg-white/5 text-[#0B2545] dark:text-white border border-[#E3E7EE] dark:border-white/10 px-4 py-2 rounded-lg font-12 md:font-14 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition cursor-pointer"
          >
            Message RM
          </button>
        </div>
      </div>

      {/* Table & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#132436] p-4 sm:p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-center mb-4 gap-2">
            <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px] truncate">
              My Listed Assets
            </h3>
            <button
              onClick={() => navigate('/dashboard/my-assets')}
              className="font-12 font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline shrink-0"
            >
              <span className="flex items-center gap-1">
                View all <FiArrowRight size={13} />
              </span>
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left font-12 md:font-14 border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[#E3E7EE] dark:border-white/10">
                  <th className="py-2 text-[11px] font-bold text-gray-500 uppercase">
                    Asset
                  </th>
                  <th className="py-2 text-[11px] font-bold text-gray-500 uppercase w-1/4">
                    Stage
                  </th>
                  <th className="py-2 text-[11px] font-bold text-gray-500 uppercase w-40">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EE] dark:divide-white/10 text-gray-700 dark:text-gray-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-400">
                      Loading…
                    </td>
                  </tr>
                ) : listedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-400">
                      No listed assets yet.
                    </td>
                  </tr>
                ) : (
                  listedAssets.map((asset) => (
                    <tr
                      key={asset.assetId}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                      // onClick={() =>
                      //   navigate(`/dashboard/my-assets?asset=${asset.assetId}`)
                      // }
                    >
                      <td className="py-3 font-medium text-[#1F4FE0] dark:text-[#60a5fa] ">
                        {asset.assetTitle}
                      </td>
                      <td className="py-3 font-12">{asset.stage}</td>
                      <td className="py-3 w-40">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadgeClasses(asset.status)}`}
                        >
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white dark:bg-[#132436] p-4 sm:p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-semibold text-[#0B2545] dark:text-white text-[14.5px]">
            Action Center
          </h3>

          {isLoading ? (
            <p className="text-[12.5px] text-gray-400 p-2">Loading…</p>
          ) : actionCenter.length === 0 ? (
            <p className="text-[12.5px] text-gray-400 p-2">
              No recent activity.
            </p>
          ) : (
            actionCenter.map((item) => (
              <div key={item.id} className="flex gap-3 text-[12.5px] p-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                    item.viewed ? 'bg-gray-400' : 'bg-[#1F4FE0]'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      }
                    }}
                    className={`font-semibold text-gray-800 ${item.path ? 'hover:underline cursor-pointer' : ''} dark:text-white break-words`}
                  >
                    {item.title}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5 break-words">
                    {item.body}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
