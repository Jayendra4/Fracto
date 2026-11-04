import { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Notification,
  useGetAllNotificationsQuery,
  useUpdateReadStatusMutation,
  useMarkAllNotificationsReadMutation,
} from '@/store/api/notificationApi';
import { BackButton } from '@/components/common/BackButton';

const TAKE = 10;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);

  const { data, isLoading, isFetching, refetch } = useGetAllNotificationsQuery(
    { skip, take: TAKE },
    { pollingInterval: 60_000 }
  );
  const [updateReadStatus, { isLoading: isUpdating }] = useUpdateReadStatusMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const totalCount = data?.count ?? 0;
  const hasMore = items.length < totalCount;

  useEffect(() => {
    if (data?.data?.length) {
      setItems((prev) => {
        const prevMap = new Map(prev.map((n) => [n.id, n]));
        data.data.forEach((n) => prevMap.set(n.id, n));
        return Array.from(prevMap.values());
      });
    }
  }, [data]);

  useEffect(() => {
    if (!hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSkip((prev) => prev + TAKE);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  const handleReadNotif = async (id: number) => {
    if (!id) return;
    await updateReadStatus({ id }).unwrap();
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, viewed: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllRead().unwrap();
    setItems([]);
    if (skip !== 0) {
      setSkip(0);
    } else {
      refetch();
    }
  };

  const hasUnread = items.some((n) => !n.viewed);

  return (
    <div className="p-6 max-w-4xl mx-auto text-foreground animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
              <p className="text-slate-400 text-sm">Stay updated with latest activities</p>
            </div>
          </div>
        </div>

        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500 hover:text-white disabled:opacity-50 transition-all duration-200"
          >
            <CheckCircle className="h-4 w-4" />
            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-xl bg-slate-900/30">
          <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-slate-500" />
          </div>
          <p className="text-lg font-medium text-white">No notifications found</p>
          <p className="text-sm text-slate-500">You're all caught up!</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {items.map((item) => {
          const isViewed = !!item.viewed;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.path && item.path.trim().toLowerCase() !== 'null') {
                  if (!isViewed) {
                    handleReadNotif(Number(item.id));
                  }
                  navigate(item.path);
                }
              }}
              className={`
                relative overflow-hidden
                flex gap-4 p-5 rounded-xl border
                transition-all duration-200
                ${isViewed
                  ? 'bg-slate-950/40 border-slate-800/50 text-slate-400'
                  : 'bg-slate-900/80 border-blue-500/30 text-white shadow-lg shadow-blue-900/5'
                }
                hover:border-blue-500/40 hover:bg-slate-800/50
                ${item.path && item.path.trim().toLowerCase() !== 'null' ? 'cursor-pointer' : ''}
              `}
            >
              {/* Unread Indicator */}
              {!isViewed && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-transparent -mr-8 -mt-8 rounded-full blur-xl pointer-events-none" />
              )}

              {/* Icon */}
              <div
                className={`
                h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center
                ${!isViewed ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-500'}
              `}
              >
                <Bell className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 z-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                  <div>
                    <p
                      className={`text-base font-semibold ${!isViewed ? 'text-white' : 'text-slate-300'}`}
                    >
                      {item.title}
                    </p>
                    <p
                      className={`text-sm mt-1 leading-relaxed ${!isViewed ? 'text-slate-300' : 'text-slate-500'}`}
                    >
                      {item.body}
                    </p>
                  </div>

                  <div className="flex items-center pt-1 self-start sm:self-auto flex-shrink-0">
                    {!isViewed ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReadNotif(Number(item.id));
                        }}
                        disabled={isUpdating}
                        className="
                          group flex items-center gap-1.5
                          rounded-full border border-blue-500/30
                          bg-blue-500/10 px-3 py-1.5
                          text-xs font-medium text-blue-400
                          hover:bg-blue-500 hover:text-white
                          disabled:opacity-50
                          transition-all duration-200
                        "
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          Mark as read
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-slate-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Read
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 font-mono">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-6 text-sm text-muted-foreground">
          {isFetching ? 'Loading more notifications…' : ''}
        </div>
      )}

      {!hasMore && !isLoading && items.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500 uppercase tracking-widest">
          <span className="w-12 h-px bg-slate-800"></span>
          End of Notifications
          <span className="w-12 h-px bg-slate-800"></span>
        </div>
      )}
    </div>
  );
}
