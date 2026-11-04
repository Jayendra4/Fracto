import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import {
  useSpvList,
  useMySpvList,
  type SpvItem,
  type MySpvItem,
} from '@/api/spv.api';

const TAKE = 12;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function AssetMarketplaceTab(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.authLogin);
  const accountId = user?.id;

  const [listTab, setListTab] = useState<'joined' | 'mine'>('joined');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, listTab]);

  const { data: joinedData, isLoading: isJoinedLoading } = useSpvList({
    accountId,
    skip: page * TAKE,
    take: TAKE,
    search: debouncedSearch.trim() || undefined,
  });

  const { data: myData, isLoading: isMyLoading } = useMySpvList({
    accountId,
    skip: page * TAKE,
    take: TAKE,
    search: debouncedSearch.trim() || undefined,
  });

  const data = listTab === 'joined' ? joinedData : myData;
  const isLoading = listTab === 'joined' ? isJoinedLoading : isMyLoading;

  const spvs = data?.data ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / TAKE));

  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          SPV List
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          SPVs formed from your clubs — browse and open any SPV's deal room.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              { key: 'joined', label: 'Joined SPV' },
              { key: 'mine', label: 'My SPV' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setListTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-12 font-semibold transition cursor-pointer ${
                listTab === tab.key
                  ? 'bg-[#1F4FE0] text-white'
                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-[#E3E7EE] dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by SPV name…"
          className="w-full sm:w-64 border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[#0B2545] dark:text-white rounded-lg px-3.5 py-2.5 font-12 outline-none focus:border-[#1F4FE0]"
        />
      </div>

      {isLoading ? (
        <p className="font-12 text-gray-400">Loading…</p>
      ) : spvs.length === 0 ? (
        <p className="font-12 text-gray-400">No SPVs found.</p>
      ) : listTab === 'joined' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(spvs as SpvItem[]).map((spv) => (
            <div
              key={spv.id}
              className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col"
            >
              <h4 className="font-semibold font-14 text-[#0B2545] dark:text-white">
                {spv.name}
              </h4>
              <p className="font-11 text-gray-400 mt-1 mb-2">
                {spv.secondaryClub?.title}
              </p>
              <p className="font-11 text-gray-500 dark:text-gray-300 mb-3">
                {spv._count?.members ?? 0} Members ·{' '}
                {new Date(spv.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/my-club/${spv.secondaryClub.assetId}?clubId=${spv.secondaryClubId}`
                    )
                  }
                  className="flex-1 bg-[#1F4FE0] hover:bg-[#1A42BD] text-white rounded-lg py-2 font-12 font-bold transition cursor-pointer"
                >
                  View SPV
                </button>
                <button
                  onClick={() =>
                    navigate(`/property-details/${spv.secondaryClub.assetId}`)
                  }
                  className="flex-1 border border-[#1F4FE0] text-[#1F4FE0] dark:text-[#60a5fa] hover:bg-[#E8EEFC] dark:hover:bg-white/5 rounded-lg py-2 font-12 font-bold transition cursor-pointer"
                >
                  Buy Fraction
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(spvs as MySpvItem[]).map((item) => (
            <div
              key={item.assetId}
              className="bg-white dark:bg-[#132436] p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col"
            >
              <h4 className="font-semibold font-14 text-[#0B2545] dark:text-white">
                {item.assetTitle}
              </h4>
              <p className="font-11 text-gray-400 mt-1 mb-2">{item.spvName}</p>
              <p className="font-11 text-gray-500 dark:text-gray-300 mb-3">
                {item.memberCount} Members
              </p>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/my-club/${item.assetId}?clubId=${item.spvId}`
                    )
                  }
                  className="flex-1 bg-[#1F4FE0] hover:bg-[#1A42BD] text-white rounded-lg py-2 font-12 font-bold transition cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > TAKE && (
        <div className="flex justify-end items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white font-12 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Prev
          </button>
          <span className="font-12 text-gray-500 dark:text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page + 1 >= totalPages}
            className="px-4 py-2 rounded-lg border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white font-12 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
