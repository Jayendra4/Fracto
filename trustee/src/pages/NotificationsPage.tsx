import { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Notification,
  useGetAllNotificationsQuery,
  useUpdateReadStatusMutation,
  useMarkAllAsReadMutation,
} from '@/store/api/notificationApi';
import { BackButton } from '@/components/common/BackButton';
import { useAppDispatch } from '@/hooks/redux';
import { setHasUnread } from '@/store/slices/notificationSlice';

const TAKE = 10;
const POLL_MS = 30_000;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  // When true: next data response should replace items instead of append
  const [isResetting, setIsResetting] = useState(false);

  // Refs so stable interval can always read latest values without recreating
  const skipRef = useRef(0);
  skipRef.current = skip;
  const refetchRef = useRef<() => void>(() => {});
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(setHasUnread(false));
  }, [dispatch]);

  const { data, isLoading, isFetching, refetch } = useGetAllNotificationsQuery({
    skip,
    take: TAKE,
  });
  refetchRef.current = refetch;

  const [updateReadStatus, { isLoading: isUpdating }] = useUpdateReadStatusMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const totalCount = data?.count ?? 0;
  // Block hasMore while resetting to prevent IntersectionObserver from firing during reload
  const hasMore = !isResetting && items.length < totalCount;

  /* Append pages — or replace on reset */
  useEffect(() => {
    if (!data?.data?.length) return;

    if (isResetting) {
      setItems(data.data);
      setIsResetting(false);
    } else {
      setItems((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newItems = data.data.filter((n) => !existingIds.has(n.id));
        if (!newItems.length) return prev;
        return [...prev, ...newItems];
      });
    }
    // isResetting intentionally omitted — we read it at the time data fires, not as a trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* Infinite scroll observer */
  useEffect(() => {
    if (!hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSkip((prev) => prev + TAKE);
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  /* Stable 30-second poll — [] deps so interval never resets when skip changes */
  useEffect(() => {
    const interval = setInterval(() => {
      setIsResetting(true);
      if (skipRef.current !== 0) {
        setSkip(0); // triggers fresh fetch for skip=0
      } else {
        refetchRef.current(); // skip already 0, just force refetch
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const triggerReset = () => {
    setIsResetting(true);
    setItems([]);
    if (skipRef.current !== 0) {
      setSkip(0);
    } else {
      refetchRef.current();
    }
  };

  const handleReadNotif = async (id: number) => {
    if (!id) return;
    await updateReadStatus({ id }).unwrap();
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, viewed: true, readAt: new Date().toISOString() } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead().unwrap();
    triggerReset();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
        </div>
        {items.some((n) => !n.viewed) && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50 transition"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {isMarkingAll ? 'Marking…' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {!isLoading && !isResetting && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="h-10 w-10 mb-3 opacity-50" />
          <p className="text-sm font-medium">No notifications found</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
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
        flex gap-4 p-4 rounded-xl border
        bg-card text-card-foreground
        border-border
        transition hover:bg-accent
        ${!isViewed ? 'ring-1 ring-primary/30' : ''}
        ${item.path && item.path.trim().toLowerCase() !== 'null' ? 'cursor-pointer' : ''}
      `}
            >
              {/* Icon */}
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.body}</p>
                  </div>

                  <div className="flex items-center pt-1">
                    {!isViewed ? (
                      <button
                        onClick={() => handleReadNotif(Number(item.id))}
                        disabled={isUpdating}
                        className="
        flex items-center gap-1.5
        rounded-full border border-primary/30
        bg-primary/10 px-3 py-1.5
        text-xs font-medium text-primary
        hover:bg-primary/20
        disabled:opacity-50
        transition
      "
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark as read
                      </button>
                    ) : (
                      <div
                        className="
        flex items-center gap-1.5
        rounded-full border border-green-500/30
        bg-green-500/10 px-3 py-1.5
        text-xs font-medium text-green-600
      "
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Read
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
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

      {!hasMore && !isLoading && !isResetting && (
        <p className="text-center text-xs text-muted-foreground mt-6">You've reached the end</p>
      )}
    </div>
  );
}
