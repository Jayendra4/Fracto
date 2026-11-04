// import { useOnboarding } from '@/hooks';
import NotificationModal from './NotificationModal';
import { useEffect, useRef, useState } from 'react';
import {
  useMarkNotificationRead,
  useMyNotifications,
  type NotificationItem,
} from '@/api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import Loader from '@/components/Loader';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function NotificationPage() {
  // const { isCorporateInvestor, hasDirectors } = useOnboarding();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useMyNotifications({
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  const { mutateAsync: markRead } = useMarkNotificationRead();

  const pages = data?.pages ?? [];

  const notifications: NotificationItem[] = pages.flatMap((page) => {
    if (!page.success) return [];
    return Array.isArray(page?.data?.data) ? page.data.data : [];
  });

  const unreadCount = notifications.filter(
    (n) => n && n.readAt === null
  ).length;

  const [notificationOpen, setNotificationOpen] = useState(true);

  const handleMarkRead = async (id: string) => {
    await markRead(Number(id));
    await refetch();
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => n.readAt === null);

    await Promise.all(unread.map((n) => markRead(n.id)));
    await refetch();
  };

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const handler = () => {
      setNotificationOpen(true);
    };

    window.addEventListener('fcm-notification', handler);
    return () => window.removeEventListener('fcm-notification', handler);
  }, []);

  return (
    <div
      className={`font-work relative w-full min-h-screen text-[var(--fg)] bg-[var(--bg)] pt-24`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex justify-center items-center bg-[var(--bg)]/50 backdrop-blur-sm pointer-events-none">
          <Loader />
        </div>
      )}

      {unreadCount > 0 && (
        <span className="bg-transparent lg:bg-red-500 text-xs px-2 py-0.5 rounded hidden">
          {unreadCount}
        </span>
      )}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`transition-[padding-top,opacity] `}
      >
        <motion.div variants={itemVariants}>
          <NotificationModal
            open={notificationOpen}
            notifications={notifications.map((n) => ({
              id: String(n.id),
              title: n.title ?? 'Notification',
              description: n.body ?? '',
              path: n.path,
              isRead: Boolean(n.readAt),
              createdAt: n.createdAt,
            }))}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            hasNextPage={hasNextPage}
            loadMore={fetchNextPage}
            loadingMore={isFetchingNextPage}
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>
      <div ref={loadMoreRef} className="h-6" />
    </div>
  );
}
