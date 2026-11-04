import { useEffect, useState, type JSX } from 'react';
import { getMeAssetsApi } from '@/api/rwa.api';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/Loader';

interface AssetMeta {
  id: number;
  metaKey: string;
  metaValue: string;
}

interface AssetDocument {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
}

interface Asset {
  id: number;
  assetTitle: string;
  assetType: string;
  currentOwnerName: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  meta: AssetMeta[];
  documents: AssetDocument[];
}

export default function BrokerMyAssets(): JSX.Element {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  const TAKE = 10;
  const [page, setPage] = useState(0);

  const filters = ['All', 'Draft', 'Available', 'Funded', 'Exited'];

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await getMeAssetsApi({
        skip: page * TAKE,
        take: TAKE,
        assetStatus: statusFilter === 'All' ? undefined : statusFilter,
      });
      if (response.success && response.data) {
        setAssets(response.data.data || []);
        setCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, statusFilter]);

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setPage(0);
  };

  const formatDocType = (type: string) => {
    if (!type) return '';
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <section className="font-work relative pb-20 bg-transparent min-h-0">
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-medium font-24 text-[var(--fg)]">My Assets</h2>
            <p className="text-[var(--fg)]/50 font-medium font-14">
              Manage and view your previously submitted Real World Assets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-1 bg-[var(--fg)]/5 rounded-xl border border-[var(--fg)]/10 backdrop-blur-sm">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  statusFilter === f
                    ? 'bg-[#1F4FE0] text-white shadow-md'
                    : 'text-[var(--fg)]/60 hover:text-[var(--fg)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <Loader />
          </div>
        ) : assets.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-2xl">
            <div className="text-[var(--fg)]/60 text-base font-semibold">
              No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''}{' '}
              assets found
            </div>
            <p className="mt-2 text-xs text-[var(--fg)]/40 max-w-sm px-4">
              {statusFilter === 'All'
                ? "You haven't onboarded any assets yet. Complete the List an Asset form to see your assets here."
                : `No assets currently match the ${statusFilter} status.`}
            </p>
          </div>
        ) : (
          <div className="w-full bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-2xl p-0 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar scrollbar-ui">
              <table className="w-full font-14">
                <thead className="text-[var(--fg)]/40 bg-[var(--fg)]/[0.02] border-b border-[var(--fg)]/10 text-left">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">
                      Asset Name
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">
                      Type
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">
                      Owner
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">
                      Status
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--fg)]/5">
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="text-[var(--fg)] hover:bg-[var(--fg)]/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--fg)]">
                            {asset.assetTitle}
                          </span>
                          <span className="text-[10px] text-[var(--fg)]/30 font-bold uppercase tracking-tighter">
                            ID: {asset.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[var(--fg)]/70">
                          {formatDocType(asset.assetType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[var(--fg)]/70">
                          {asset.currentOwnerName || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            asset.status === 'Draft'
                              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                              : asset.status === 'Verified' ||
                                  asset.status === 'Available'
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/my-assets/${asset.id}`)
                          }
                          className="group inline-flex gap-1 items-center text-[#1F4FE0] dark:text-[#60a5fa] font-semibold hover:underline transition-all"
                        >
                          Details
                          <MdKeyboardArrowRight
                            size={16}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-[var(--fg)]/5 text-xs text-[var(--fg)]">
              <span className="text-[var(--fg)]/40 font-medium">
                Showing {assets.length} of {count} assets
              </span>
              <div className="flex items-center gap-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--fg)]/10 disabled:opacity-30 hover:bg-[var(--fg)]/5 transition font-medium"
                >
                  Previous
                </button>

                <span className="font-bold text-[var(--fg)]">
                  {page + 1}{' '}
                  <span className="text-[var(--fg)]/30 font-normal mx-1">
                    /
                  </span>{' '}
                  {Math.ceil(count / TAKE) || 1}
                </span>

                <button
                  disabled={(page + 1) * TAKE >= count}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--fg)]/10 disabled:opacity-30 hover:bg-[var(--fg)]/5 transition font-medium"
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
