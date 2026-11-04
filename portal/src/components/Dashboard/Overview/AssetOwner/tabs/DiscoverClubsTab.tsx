/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useGroups, useJoinedGroups, useJoinGroup } from '@/api/group.api';
import StatusModal from '@/components/Modals/Status';
import { FiSearch } from 'react-icons/fi';

export default function DiscoverClubsTab(): JSX.Element {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.authLogin
  );
  const accountId = user?.id;

  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'error' as 'success' | 'error',
    title: '',
    message: '',
  });
  const [groupID, setGroupId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const finalSearch =
    debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined;

  const { data, isLoading } = useGroups({ search: finalSearch });
  const groups = data?.data ?? [];

  const { data: joinedGroups } = useJoinedGroups(accountId, isAuthenticated);
  const { mutate: joinGroup, isPending: isJoining } = useJoinGroup();

  const handleJoin = (groupId: number) => {
    setGroupId(groupId);
    if (!isAuthenticated) {
      navigate('/login', { state: { groupId } });
      return;
    }
    joinGroup(groupId, {
      onSuccess: () => {
        setStatusModal({
          open: true,
          status: 'success',
          title: 'Success',
          message: 'Joined primary club successfully',
        });
      },
      onError: (err: any) => {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: err?.message || 'Failed to join primary club',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Discover Club
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Join Primary Clubs to review and vote on upcoming assets.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white">
            Recommended Primary Clubs
          </h3>
          <div className="relative w-full sm:w-64 shrink-0">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Primary Club..."
              className="w-full bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 rounded-lg py-2 pl-9 pr-3 font-12 text-[#0B2545] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#1F4FE0] transition-colors"
            />
          </div>
        </div>
        <div>
          {isLoading ? (
            <p className="py-6 text-center text-gray-400 font-12 md:font-14">
              Loading…
            </p>
          ) : groups.length === 0 ? (
            <p className="py-6 text-center text-gray-400 font-12 md:font-14">
              {finalSearch
                ? `No Primary Clubs found for "${finalSearch}".`
                : 'No Primary Clubs available.'}
            </p>
          ) : (
            groups.map((group) => {
              const isJoined =
                joinedGroups?.find((g) => g.id === group.id)?.isJoined ?? false;

              return (
                <div
                  key={group.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5 border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0">
                      {group.image ? (
                        <img
                          src={group.image}
                          alt={group.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold font-13 md:font-14 text-[#0B2545] dark:text-white line-clamp-1">
                        {group.title}
                      </div>
                      <p className="font-11 md:font-12 text-gray-500 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 mt-0.5 max-w-[900px]">
                        {group.description}
                      </p>
                      <div className="font-11 text-gray-400 mt-0.5">
                        {group._count?.groupMember ?? 0} members
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                    <button
                      onClick={() =>
                        navigate(`/primary-club-details/${group.id}`)
                      }
                      className="bg-white dark:bg-white/5 text-[#0B2545] dark:text-white border border-[#E3E7EE] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 px-3.5 py-2 rounded-lg font-12 font-bold transition cursor-pointer"
                    >
                      View Details
                    </button>
                    {isJoined ? (
                      <button
                        disabled
                        className="bg-green-500/10 text-green-600 dark:text-green-400 border-none px-3.5 py-2 rounded-lg font-12 font-bold cursor-default"
                      >
                        Joined
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(group.id)}
                        disabled={isJoining}
                        className="bg-[#1F4FE0] hover:bg-[#1A42BD] text-white border-none px-3.5 py-2 rounded-lg font-12 font-bold transition cursor-pointer disabled:opacity-60"
                      >
                        {isJoining && groupID == group.id
                          ? 'Joining...'
                          : 'Join Club'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
        <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-3">
          How Clubs Work
        </h3>
        <p className="font-12 text-gray-500 dark:text-gray-300 leading-relaxed">
          Join a Primary Club for a city or asset class to review introduced
          assets, ask questions, and vote Yes / No / Abstain. If enough members
          vote Yes, a Secondary Club is formed for that specific asset — its
          members sign a Deal-Specific Commitment Declaration and proceed toward
          SPV subscription.
        </p>
      </div>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        onContinue={() => setStatusModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
