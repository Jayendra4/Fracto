import { useEffect, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { HiOutlineBellSlash } from 'react-icons/hi2';
import NotificationItem from './NotificationItem';
import { useNavigate } from 'react-router-dom';
import { HiArrowLongLeft } from 'react-icons/hi2';
import { AnimatePresence } from 'framer-motion';

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  path?: string | null;
  isRead: boolean;
  createdAt: string;
}
interface Props {
  open: boolean;
  notifications?: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  hasNextPage?: boolean;
  loadMore?: () => void;
  loadingMore?: boolean;
  isLoading?: boolean;
}

export default function NotificationModal({
  open,
  notifications: incomingNotifications,
  onMarkRead,
  onMarkAllRead,
  hasNextPage,
  loadMore,
  loadingMore,
  isLoading,
}: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter(
    (n: AppNotification) => !n.isRead
  ).length;

  const navigate = useNavigate();
  const handleback = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!incomingNotifications) return;

    setNotifications(incomingNotifications);
  }, [incomingNotifications]);

  if (!open) return null;

  return (
    <div className="min-h-screen pb-8 bg-[var(--bg)] px-4 lg:px-10 text-[var(--fg)]">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 mt-2 lg:mt-4 mb-10">
        <div className="flex flex-col w-full mb-6 lg:mb-10 gap-3 md:gap-5">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handleback}
              className="flex items-center gap-2 text-dark-grey hover:text-[var(--fg)] hover:-translate-x-1 transition-all duration-300 font-medium font-18"
            >
              <HiArrowLongLeft size={24} /> Back
            </button>

            {notifications.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="
                  flex items-center gap-2 px-4 py-2 
                  bg-[var(--card)] border border-[var(--fg)]/10 
                  shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:border-[var(--fg)]/20 
                  transition-all duration-300 rounded-xl font-medium text-sm whitespace-nowrap
                "
              >
                <FiCheckCircle size={16} className="text-[#33BD56]" />
                Mark all as Read
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 lg:gap-4 whitespace-nowrap">
              <span className="font-30">Notifications</span>

              {unreadCount > 0 && (
                <span className="bg-red-500/10 border border-red-500/20 text-red-500 font-14 font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {unreadCount} New
                </span>
              )}
            </div>
          </div>
          {/* <div className="flex sm:hidden items-center justify-between w-full bg-gray-600 h-px" /> */}
        </div>

        {isLoading ? (
          <div className="hidden" />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-24 h-24 rounded-full bg-[var(--card)] border border-[var(--fg)]/5 shadow-inner flex items-center justify-center mb-6">
              <HiOutlineBellSlash className="w-10 h-10 text-[var(--fg)]/30" />
            </div>
            <h3 className="font-24 font-medium text-[var(--fg)] mb-2">
              You're all caught up!
            </h3>
            <p className="font-16 text-dark-grey max-w-sm text-center">
              You have no new notifications right now. Check back later for
              updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {notifications.map((item: AppNotification) => (
                <NotificationItem
                  key={item.id}
                  data={item}
                  onMarkRead={() => onMarkRead(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        {hasNextPage && (
          <div className="flex justify-center pt-8 pb-10">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="
                px-8 py-3 font-medium rounded-full text-[var(--fg)] text-sm
                bg-[var(--card)] border border-[var(--fg)]/10 shadow-sm
                hover:border-[var(--fg)]/20 hover:shadow-md hover:-translate-y-0.5
                active:scale-95 transition-all duration-300
                disabled:opacity-50 disabled:active:scale-100 disabled:hover:translate-y-0
              "
            >
              {loadingMore ? 'Loading more...' : 'Load older notifications'}
            </button>
          </div>
        )}

        {/* <button
          onClick={onClose}
          className="absolute top-113 right-3 text-white/60 hover:text-white"
        >
          ✕
        </button> */}
      </div>
    </div>
  );
}
