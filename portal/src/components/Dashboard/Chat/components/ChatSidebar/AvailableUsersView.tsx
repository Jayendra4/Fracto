import { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiSearch, FiSend } from 'react-icons/fi';
import { getAvailableUsersApi, createChatApi } from '@/api/chat.api';
import type { IAvailableUser, IChat } from '@/api/chat.api';
import { getProfilePath } from '../../utils/chatUtils';
import ChatAvatar from '../ChatAvatar';

function AvailableUsersView({
  onBack,
  onCreated,
  currentUserId,
}: {
  onBack: () => void;
  onCreated: (chat: IChat, selectedUser?: any) => void;
  currentUserId: number;
}) {
  const [users, setUsers] = useState<IAvailableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [creatingId, setCreatingId] = useState<number | null>(null);

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement>(null);
  const take = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSkip(0);
    setUsers([]);
    setHasMore(true);
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!hasMore && skip !== 0) return;
      try {
        setLoading(true);
        if (skip === 0) setInitialLoading(true);
        setError(null);

        const response = await getAvailableUsersApi(currentUserId, skip, take, debouncedSearch);

        if (response.success && response.data) {
          const paginatedData = response.data as any;
          const newUsers: IAvailableUser[] = Array.isArray(paginatedData.data) ? paginatedData.data : [];

          setUsers((prev) => {
            const combined = skip === 0 ? newUsers : [...prev, ...newUsers];
            const uniqueMap = new Map(combined.map(u => [u.id, u]));
            return Array.from(uniqueMap.values());
          });
          setHasMore(skip + take < (paginatedData.count || 0));
        } else {
          setError(response.message || 'Failed to load users');
        }
      } catch (err: any) {
        setError('Error connecting to user service');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, skip, debouncedSearch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          hasMore
        ) {
          setSkip((prev) => prev + take);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => observer.disconnect();
  }, [loading, hasMore]);

  const displayedUsers = users;

  const handleStartChat = async (participantId: number) => {
    try {
      setCreatingId(participantId);
      const selectedUser = users.find((u) => u.id === participantId);
      const response = await createChatApi({
        type: 'Direct',
        participantIds: [participantId],
      });
      if (response.success && response.data) {
        onCreated(response.data, selectedUser);
      }
    } catch (err) {
      console.error('❌ Chat Creation Error:', err);
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[700px] bg-[var(--bg)]/10 backdrop-blur-xl">
      <div className="p-6 border-b border-[var(--fg)]/5 space-y-5 bg-gradient-to-b from-[var(--fg)]/5 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all text-[var(--fg)]/60 bg-[var(--fg)]/5"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-20 font-semibold text-[var(--fg)] leading-none">
              Start a Conversation
            </h2>
            <p className="text-[11px] text-[var(--fg)]/40 mt-1 font-semibold italic">
              Find colleagues to message
            </p>
          </div>
        </div>

        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg)]/30 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[var(--fg)]/5 border border-[var(--fg)]/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-[var(--fg)] placeholder-[var(--fg)]/30 outline-none focus:border-blue-500/50 focus:bg-[var(--bg)] focus:shadow-xl focus:shadow-blue-500/5 transition-all font-work"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 scrollbar-ui">
        {initialLoading && users.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto animate-spin"></div>
            <p className="text-sm font-bold text-[var(--fg)]/30 tracking-tight">
              SCANNING DIRECTORY...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500/80 p-6 glass-card border-red-500/20">
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="py-32 text-center text-[var(--fg)]/20">
            <FiSearch size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-bold itali">No matching users found</p>
          </div>
        ) : (
          displayedUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => !creatingId && handleStartChat(user.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border border-transparent bg-[var(--fg)]/2 hover:bg-blue-500/10 hover:border-blue-500/20 group relative overflow-hidden ${creatingId === user.id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="relative shrink-0">
                <ChatAvatar
                  src={getProfilePath(user.profileImage)}
                  name={`${user.firstname} ${user.lastname}`}
                  size="lg"
                  className="border-2 border-[var(--fg)]/10 bg-[var(--fg)]/5 shadow-md group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[var(--bg)] rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--fg)] truncate group-hover:text-blue-500 transition-colors">
                  {user.firstname} {user.lastname}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded shadow-sm">
                    {user.type}
                  </span>
                  <span className="text-[10px] text-[var(--fg)]/40 truncate font-semibold">
                    {user.email}
                  </span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <FiSend className="text-blue-500" size={18} />
              </div>
            </div>
          ))
        )}
        <div
          ref={loaderRef}
          className="h-10 w-full flex items-center justify-center pt-4 pb-4"
        >
          {loading && !initialLoading && (
            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 animate-spin rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AvailableUsersView;
