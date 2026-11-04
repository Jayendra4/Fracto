import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/constants/routes.constant';

// Simple "pop" sound as base64 to ensure it works without external assets
// const NOTIFICATION_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA//oeBAAAAAAAAASwAAAAABAAALuAAAAsAAAAAAAAAAAA';

// Note: The above is a placeholder empty sound for structure.
// I will use a short reliable "ding" sound instead.
const POP_SOUND =
  'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

interface NotificationToast {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

interface GlobalToastContextType {
  addToast: (
    toast: Omit<NotificationToast, 'id' | 'createdAt' | 'isRead'>
  ) => void;
  removeToast: (id: string) => void;
}

const GlobalToastContext = createContext<GlobalToastContextType | undefined>(
  undefined
);

export const useGlobalToast = () => {
  const context = useContext(GlobalToastContext);
  if (!context) {
    throw new Error('useGlobalToast must be used within a GlobalToastProvider');
  }
  return context;
};

export const GlobalToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(POP_SOUND);
    audioRef.current.volume = 0.5;
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) =>
          console.log('Audio play failed (user interaction needed first):', e)
        );
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<NotificationToast, 'id' | 'createdAt' | 'isRead'>) => {
      const id = crypto.randomUUID();
      const newToast: NotificationToast = {
        ...toast,
        id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      playSound();
      setToasts((prev) => [newToast, ...prev]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast, playSound]
  );

  useEffect(() => {
    const handleFcmNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.notification) {
        const notification = customEvent.detail.notification;

        playSound();
        setToasts((prev) => {
          if (prev.some((t) => t.id === notification.id)) return prev;
          return [notification, ...prev];
        });

        setTimeout(() => {
          removeToast(notification.id);
        }, 5000);
      }
    };

    window.addEventListener('fcm-notification', handleFcmNotification);

    return () => {
      window.removeEventListener('fcm-notification', handleFcmNotification);
    };
  }, [removeToast, playSound]);

  const handleToastClick = (toastId: string) => {
    removeToast(toastId);
    navigate(ROUTES.NOTIFICATION);
  };

  return (
    <GlobalToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-0 sm:top-24 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full sm:w-auto items-center sm:items-end p-4 sm:p-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ x: 100, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: 'spring',
                mass: 1,
                damping: 20,
                stiffness: 300,
              }}
              onClick={() => handleToastClick(toast.id)}
              className="bg-[var(--bg)] border border-[var(--fg)]/10 shadow-2xl rounded-2xl p-4 w-full sm:w-80 pointer-events-auto cursor-pointer backdrop-blur-xl group relative overflow-hidden"
              style={{
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div className="flex gap-4 relative z-10">
                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-[var(--fg)] truncate">
                      {toast.title}
                    </p>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">
                      New
                    </span>
                  </div>
                  <p className="text-xs text-[var(--fg)]/60 line-clamp-2 leading-relaxed font-medium">
                    {toast.description}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--fg)]/5">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full bg-blue-500"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 pointer-events-none" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlobalToastContext.Provider>
  );
};
