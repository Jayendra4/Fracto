/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset/history data, matches the pattern in rwa.api.ts */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssetByIdApi, getAssetPurchaseHistoryApi } from '@/api/rwa.api';
import Loader from '@/components/Loader';

export default function PropertyFractionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const TAKE = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [assetRes, historyRes] = await Promise.all([
          getAssetByIdApi(id),
          getAssetPurchaseHistoryApi(id, { skip: page * TAKE, take: TAKE }),
        ]);

        if (assetRes.success) setAsset(assetRes.data);
        if (historyRes.success) {
          setHistory(historyRes.data.data || []);
          setSummary(historyRes.data.summary);
          setTotal(historyRes.data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching fraction details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, page]);

  if (loading && !asset) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader isFullPage={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="pagehead">
          <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
            {asset?.assetTitle || 'Royal Reef Resort'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
            {asset?.meta?.find((m: any) => m.metaKey === 'city')?.metaValue}{' '}
            {asset?.assetType ? `| ${asset.assetType}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {asset?.isVerified && (
            <span className="px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400">
              Verified
            </span>
          )}
          <span className="px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-blue-400">
            {asset?.status || 'Available'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-16 md:font-18 font-semibold text-[#0B2545] dark:text-white">
              Purchase History
            </h3>
            <span className="font-12 text-gray-400 dark:text-gray-500">
              Total Transactions: {total}
            </span>
          </div>

          <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-12">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 uppercase text-[11px] tracking-wider border-b border-[#E3E7EE] dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">S. No</th>
                    <th className="px-4 py-3 font-medium">Investor Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Units</th>
                    <th className="px-4 py-3 font-medium">Price / Unit</th>
                    <th className="px-4 py-3 font-medium">Total Amount</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EE] dark:divide-white/10">
                  {history.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-16 text-gray-400 dark:text-gray-500 font-12"
                      >
                        No purchase history available for this asset.
                      </td>
                    </tr>
                  ) : (
                    history.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 font-medium">
                          {page * TAKE + idx + 1}
                        </td>
                        <td className="px-4 py-3.5 text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                          {item.investorName}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 font-medium">
                          {item.fractions}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 font-medium">
                          ₹ {item.pricePerUnit?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-[#1F4FE0] dark:text-[#60a5fa] font-medium">
                          ₹ {item.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {total > TAKE && (
              <div className="flex items-center justify-between px-4 py-3.5 border-t border-[#E3E7EE] dark:border-white/10">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 font-12 font-semibold rounded-lg border border-[#E3E7EE] dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="font-12 font-semibold text-gray-400 dark:text-gray-500">
                  Page {page + 1} of {Math.ceil(total / TAKE)}
                </span>
                <button
                  disabled={(page + 1) * TAKE >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 font-12 font-semibold rounded-lg border border-[#E3E7EE] dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif font-16 md:font-18 font-semibold text-[#0B2545] dark:text-white mb-6">
              Structural Co-ownership Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-[#E3E7EE] dark:border-white/10 pb-3">
                <span className="font-12 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Total Structural Co-ownership
                </span>
                <span className="font-16 font-semibold text-[#0B2545] dark:text-white">
                  {summary?.totalFractions?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-[#E3E7EE] dark:border-white/10 pb-3">
                <span className="font-12 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Structural Co-ownership Sold
                </span>
                <span className="font-16 font-semibold text-[#0F9D58] dark:text-green-400">
                  {summary?.soldFractions?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-[#E3E7EE] dark:border-white/10 pb-3">
                <span className="font-12 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Remaining
                </span>
                <span className="font-16 font-semibold text-[#1F4FE0] dark:text-[#60a5fa]">
                  {(
                    summary?.totalFractions - summary?.soldFractions
                  )?.toLocaleString() || '0'}
                </span>
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1">
                  Total Amount Sold
                </p>
                <p className="font-24 font-semibold text-[#1F4FE0] dark:text-[#60a5fa]">
                  ₹ {summary?.totalAmountSold?.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/property-details/${id}`)}
              className="mt-8 w-full rounded-lg py-3 font-12 font-semibold bg-[#1F4FE0] text-white shadow-sm hover:bg-[#153eb2] transition-colors"
            >
              View Property Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
