import { useRef, useEffect } from 'react';
import ChatUser from './ChatUser';
import AvailableUsersView from './AvailableUsersView';
import { getOtherUserRole } from '../../utils/chatUtils';
import type { IChat } from '@/api/chat.api';
import type { SidebarView } from '../../hooks/useChatData';

interface ChatSidebarProps {
  chats: IChat[];
  activeChatId: number | null;
  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;
  mobileSidebarOpen: boolean;
  onSelectChat: (chat: IChat) => void;
  onCreatedChat: (chat: IChat, selectedUser?: any) => void;
  currentUserId: number;
  chatsSearch: string;
  setChatsSearch: (s: string) => void;
  fetchNextChats: () => void;
  hasMoreChats: boolean;
  isFetchingMoreChats: boolean;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  sidebarView,
  setSidebarView,
  mobileSidebarOpen,
  onSelectChat,
  onCreatedChat,
  currentUserId,
  chatsSearch,
  setChatsSearch,
  fetchNextChats,
  hasMoreChats,
  isFetchingMoreChats,
}: ChatSidebarProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreChats && !isFetchingMoreChats) {
          fetchNextChats();
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMoreChats, isFetchingMoreChats, fetchNextChats]);

  return (
    <div
      className={`fixed lg:relative top-0 left-0 h-full z-50 w-[85%] max-w-[400px] lg:w-[400px] border-r border-[var(--fg)]/10 flex flex-col shrink-0 bg-[var(--bg)] backdrop-blur-sm transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {sidebarView === 'recent' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[var(--fg)]/5 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl text-[var(--fg)]">Messages</h2>
              {/* <button
                onClick={() => setSidebarView('available')}
                className="p-2 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500/20 transition-colors"
                title="New Chat"
              >
                <FiUserPlus size={20} />
              </button> */}
            </div>
            <input
              type="text"
              placeholder="Search chats..."
              value={chatsSearch}
              onChange={(e) => setChatsSearch(e.target.value)}
              className="w-full bg-[var(--bg)]/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {chats.map((chat) => (
              <ChatUser
                key={chat.id}
                name={
                  chat.otherUser
                    ? `${chat?.asset?.assetTitle}`
                    : `User ${chat.id}`
                }
                image={chat.otherUser?.profileImage || null}
                role={getOtherUserRole(chat) || 'User'}
                active={Number(chat.id) === activeChatId}
                lastMessage={
                  chat.lastMessage?.content ||
                  chat.lastMessage?.text ||
                  (chat.lastMessage?.mediaUrl ? 'Attachment' : '')
                }
                unreadCount={chat.unreadCount}
                onClick={() => onSelectChat(chat)}
              />
            ))}
            <div
              ref={loaderRef}
              className="h-10 w-full flex items-center justify-center py-2"
            >
              {isFetchingMoreChats && (
                <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 animate-spin rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AvailableUsersView
          onBack={() => setSidebarView('recent')}
          onCreated={onCreatedChat}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
