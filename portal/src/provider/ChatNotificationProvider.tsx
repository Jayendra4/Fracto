/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed socket payloads, matches the pattern in rwa.api.ts */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { socketService } from '@/services/socket.service';
import { getMyChatsApi } from '@/api/chat.api';

interface Toast {
  id: string;
  senderName: string;
  senderImage: string | null;
  message: string;
  chatId: number;
}

interface ChatNotificationContextType {
  unreadCount: number;
  clearUnread: () => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://fracto-api-lugr.onrender.com';

const getProfilePath = (path: string | null) => {
  if (!path) return '/images/f-avatar.svg';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/storage/user/profile/${path}`;
};

const ChatNotificationContext = createContext<
  ChatNotificationContextType | undefined
>(undefined);

// eslint-disable-next-line react-refresh/only-export-components -- this hook and its provider are tightly coupled and always used together; splitting into a separate file isn't warranted here
export const useChatNotifications = () => {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    return { unreadCount: 0, clearUnread: () => {} };
  }
  return context;
};

export const ChatNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.authLogin);
  const currentUserId = user?.id;

  const fetchInitialUnread = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const response = await getMyChatsApi(Number(currentUserId));
      if (response.success && response.data) {
        const chatListData = response.data.data || response.data;
        const chats = Array.isArray(chatListData)
          ? chatListData
          : [chatListData];
        const totalUnread = chats.reduce(
          (acc: number, chat: any) => acc + (Number(chat.unreadCount) || 0),
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('❌ Failed to fetch initial chat unread count:', error);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      socketService.connect(Number(currentUserId));
      fetchInitialUnread();
    }

    const handleNewMessage = (message: any) => {
      const isChatPage = location.pathname.includes('/dashboard/chat');

      if (!isChatPage) {
        setUnreadCount((prev) => prev + 1);

        const toastId = Math.random().toString(36).substr(2, 9);
        const sender = message.sender || {};
        const messagePreview =
          message.content ||
          message.text ||
          (message.mediaUrl ? '📷 Image' : 'New Message');
        const newToast: Toast = {
          id: toastId,
          senderName: sender.firstname
            ? `${sender.firstname} ${sender.lastname}`
            : 'New Message',
          senderImage: sender.profileImage || null,
          message: messagePreview,
          chatId: Number(message.chatroomId) || Number(message.chatId),
        };

        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 5000);
      }
    };

    socketService.on('new-message', handleNewMessage);
    return () => {
      socketService.off('new-message', handleNewMessage);
    };
  }, [currentUserId, location.pathname, fetchInitialUnread]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const handleToastClick = (_chatId: number, toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
    navigate('/dashboard/messages');
  };

  return (
    <ChatNotificationContext.Provider value={{ unreadCount, clearUnread }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
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
              onClick={() => handleToastClick(toast.chatId, toast.id)}
              className="bg-[var(--bg)] border border-[var(--fg)]/10 shadow-2xl rounded-2xl p-4 w-80 pointer-events-auto cursor-pointer backdrop-blur-xl group relative overflow-hidden"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex gap-4">
                <div className="shrink-0">
                  <img
                    src={getProfilePath(toast.senderImage)}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[var(--fg)]/10 bg-[var(--fg)]/5 shadow-md"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-[var(--fg)] truncate">
                      {toast.senderName}
                    </p>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">
                      New
                    </span>
                  </div>
                  <p className="text-xs text-[var(--fg)]/60 line-clamp-2 leading-relaxed font-medium">
                    {toast.message}
                  </p>
                </div>
              </div>
              <div className="mt-3 overflow-hidden h-1 bg-[var(--fg)]/5 rounded-full">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ChatNotificationContext.Provider>
  );
};
