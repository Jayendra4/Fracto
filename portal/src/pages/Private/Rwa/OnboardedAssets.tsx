import { useEffect, useState } from 'react';
import { getMeAssetsApi } from '@/api/rwa.api';
import { MdKeyboardArrowRight, MdArrowBack } from 'react-icons/md';
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

export default function OnboardedAssets() {
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

  return (
    <section className="font-work relative pb-20 min-h-screen px-4 lg:px-10 bg-[var(--bg)]">
      <div className="max-w-[1600px] mx-auto pt-45 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-[var(--fg)]/5 transition text-[var(--fg)]"
            >
              <MdArrowBack size={28} />
            </button>
            <div>
              <h2 className="font-medium font-30 text-[var(--fg)]">
                Onboarded Assets
              </h2>
              <p className="text-[var(--fg)]/50 font-medium font-16">
                Manage and view your previously submitted Real World Assets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-1 bg-[var(--fg)]/5 rounded-xl border border-[var(--fg)]/10 backdrop-blur-sm">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  statusFilter === f
                    ? 'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white shadow-md'
                    : 'text-[var(--fg)]/60 hover:text-[var(--fg)]'
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
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-2xl">
            <div className="text-[var(--fg)]/60 text-lg font-medium">
              No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''}{' '}
              assets found
            </div>
            <p className="mt-2 text-sm text-[var(--fg)]/40 max-w-md px-4">
              {statusFilter === 'All'
                ? "You haven't onboarded any assets yet. Complete the RWA form to see your assets here."
                : `No assets currently match the ${statusFilter} status.`}
            </p>
          </div>
        ) : (
          <div className="w-full bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-2xl p-0 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar scrollbar-ui">
              <table className="w-full font-16">
                <thead className="text-[var(--fg)]/40 bg-[var(--fg)]/[0.02] border-b border-[var(--fg)]/10 text-left">
                  <tr>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Asset Name
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Type
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Owner
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">
                      Status
                    </th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-right">
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
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--fg)]">
                            {asset.assetTitle}
                          </span>
                          <span className="text-[10px] text-[var(--fg)]/30 font-bold uppercase tracking-tighter">
                            ID: {asset.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[var(--fg)]/70">
                          {asset.assetType}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[var(--fg)]/70">
                          {asset.currentOwnerName}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/rwa/onboarded-assets/${asset.id}`
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
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-6 border-t border-[var(--fg)]/5 text-sm text-[var(--fg)]">
              <span className="text-[var(--fg)]/40 font-medium">
                Showing {assets.length} of {count} assets
              </span>
              <div className="flex items-center gap-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-lg border border-[var(--fg)]/10 disabled:opacity-30 hover:bg-[var(--fg)]/5 transition font-medium"
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
                  className="px-4 py-2 rounded-lg border border-[var(--fg)]/10 disabled:opacity-30 hover:bg-[var(--fg)]/5 transition font-medium"
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
