import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssetByBrokerApi } from '@/api/rwa.api';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Loader from '@/components/Loader';

interface ReferredAssetItem {
  id: number;
  assetId: number;
  brokerEmail: string;
  assetOwnerStatus: string;
  adminStatus: string;
  proposedCommissionPct: string;
  finalCommissionPct: string | null;
  brokerNote: string | null;
  createdAt: string;
  propertyDetails: {
    city: string;
    state: string;
    country: string;
    assetType: string;
    assetTitle: string;
    marketValue: string;
    landArea: string;
    builtupArea: string;
  };
  asset: {
    id: number;
    assetTitle: string;
    assetType: string;
    currentOwnerName: string;
    status: string;
    ownerStatus: string;
    isBrokerReferred: boolean;
    createdAt: string;
  } | null;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Approved: 'bg-green-500/10 text-green-500 border border-green-500/20',
    Rejected: 'bg-red-500/10 text-red-500 border border-red-500/20',
    Pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    Draft: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  };
  return (
    map[status] ?? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
  );
};

export default function ReferredAssets() {
  const [assets, setAssets] = useState<ReferredAssetItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const navigate = useNavigate();
  const TAKE = 10;

  const filters = ['Pending', 'Approved', 'Rejected'];

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await getAssetByBrokerApi({
        skip: page * TAKE,
        take: TAKE,
        ownerStatus: statusFilter,
      });
      if (res.success && res.data) {
        setAssets(res.data.data || []);
        setCount(res.data.count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, statusFilter]);

  return (
    <section className="font-work relative pb-20 min-h-screen px-4 lg:px-4 bg-[#F4F6F9] dark:bg-[#0B0B0B]">
      <div className="max-w-[1600px] mx-auto  space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-50 dark:bg-white/5 transition text-[#0B2545] dark:text-white"
            >
              <MdArrowBack size={28} />
            </button> */}
            <div className="pagehead">
              <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
                Broker Referred Assets
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
                Assets referred to you by brokers — review and take action.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-xl border border-[#E3E7EE] dark:border-white/10 backdrop-blur-sm">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setStatusFilter(f);
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  statusFilter === f
                    ? 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#0B2545] dark:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader />
          </div>
        ) : assets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-xl">
            <div className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No {statusFilter.toLowerCase()} assets found
            </div>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 max-w-md px-4">
              {statusFilter === 'Pending'
                ? 'No assets are currently awaiting your review.'
                : `No assets with ${statusFilter.toLowerCase()} status found.`}
            </p>
          </div>
        ) : (
          <div className="w-full bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-xl p-0 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar scrollbar-ui">
              <table className="w-full text-left font-12">
                <thead className="text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 border-b border-[#E3E7EE] dark:border-white/10 text-left">
                  <tr>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Asset Name
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Type
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Location
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Broker
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Commission
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Your Status
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {assets.map((item) => {
                    const title =
                      item.asset?.assetTitle ??
                      item.propertyDetails?.assetTitle ??
                      '—';
                    const type =
                      item.asset?.assetType ??
                      item.propertyDetails?.assetType ??
                      '—';
                    const city = item.propertyDetails?.city;
                    const state = item.propertyDetails?.state;
                    const location =
                      [city, state].filter(Boolean).join(', ') || '—';

                    return (
                      <tr
                        key={item.id}
                        className="text-[#0B2545] dark:text-white hover:bg-gray-50 hover:dark:bg-gray-700 dark:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#0B2545] dark:text-white">
                              {title}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter">
                              ID: {item.assetId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-gray-600 dark:text-gray-300">
                            {type}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-gray-600 dark:text-gray-300">
                            {location}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {item.brokerEmail}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-gray-600 dark:text-gray-300">
                            {item.finalCommissionPct
                              ? `${item.finalCommissionPct}%`
                              : item.proposedCommissionPct
                                ? `${item.proposedCommissionPct}% (proposed)`
                                : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusBadge(item.assetOwnerStatus)}`}
                          >
                            {item.assetOwnerStatus}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/rwa/referred-assets/${item.assetId}`
                              )
                            }
                            className="group inline-flex gap-1.5 items-center text-[#3A76C0] font-semibold hover:text-[#60A5FA] transition-all"
                          >
                            Details
                            <MdKeyboardArrowRight
                              size={18}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-6 border-t border-[#E3E7EE] dark:border-white/10 text-sm text-[#0B2545] dark:text-white">
              <span className="text-gray-400 dark:text-gray-500 font-medium">
                Showing {assets.length} of {count} assets
              </span>
              <div className="flex items-center gap-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-lg border border-[#E3E7EE] dark:border-white/10 disabled:opacity-30 hover:bg-gray-50 dark:bg-white/5 transition font-medium"
                >
                  Previous
                </button>
                <span className="font-bold text-[#0B2545] dark:text-white">
                  {page + 1}{' '}
                  <span className="text-gray-400 dark:text-gray-500 font-normal mx-1">
                    /
                  </span>{' '}
                  {Math.ceil(count / TAKE) || 1}
                </span>
                <button
                  disabled={(page + 1) * TAKE >= count}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg border border-[#E3E7EE] dark:border-white/10 disabled:opacity-30 hover:bg-gray-50 dark:bg-white/5 transition font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
