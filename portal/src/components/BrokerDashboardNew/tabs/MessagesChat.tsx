import { FiArrowLeft, FiSend } from 'react-icons/fi';
import ChatSidebar from '@/components/Dashboard/Chat/components/ChatSidebar/ChatSidebar';
import ChatWindow from '@/components/Dashboard/Chat/components/ChatWindow/ChatWindow';
import { useChatData } from '@/components/Dashboard/Chat/hooks/useChatData';
import { useChatSockets } from '@/components/Dashboard/Chat/hooks/useChatSockets';

export default function MessagesChat() {
  const {
    chats,
    setChats,
    isChatsLoading,
    activeChatId,
    sidebarView,
    setSidebarView,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    chatsSearch,
    setChatsSearch,
    fetchNextChats,
    hasMoreChats,
    isFetchingMoreChats,
    messagesData,
    messagesSearch,
    setMessagesSearch,
    fetchNextMessages,
    hasMoreMessages,
    isFetchingMoreMessages,
    currentUserId,
    handleSelectChat,
    handleSendMessage,
    handleCreatedChat,
    queryClient,
  } = useChatData();

  useChatSockets(currentUserId, activeChatId, setChats);

  const activeChat = chats.find((c) => Number(c.id) === activeChatId) || null;

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #3b82f6, #8b5cf6); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
      `}</style>

      <div className="w-full text-[var(--fg)] font-work h-[calc(100vh-220px)] md:h-[calc(100vh-260px)] overflow-hidden flex flex-col mt-4">
        <div className="flex-1 flex flex-col min-h-0 pb-4">
          <div className="w-full flex flex-col flex-1 min-h-0">
            <div className="glass-card flex flex-1 min-h-0 mb-8 overflow-hidden border border-[var(--fg)]/10 rounded-3xl shadow-2xl relative bg-[var(--card)]">
              <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                sidebarView={sidebarView}
                setSidebarView={setSidebarView}
                mobileSidebarOpen={mobileSidebarOpen}
                onSelectChat={handleSelectChat}
                onCreatedChat={handleCreatedChat}
                currentUserId={currentUserId || 0}
                chatsSearch={chatsSearch}
                setChatsSearch={setChatsSearch}
                fetchNextChats={fetchNextChats}
                hasMoreChats={hasMoreChats}
                isFetchingMoreChats={isFetchingMoreChats}
              />

              <div className="flex-1 flex flex-col bg-[var(--bg)] relative min-w-0">
                {isChatsLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto animate-spin mb-4"></div>
                    <h3 className="text-lg font-bold text-[var(--fg)]/60">
                      Loading your chats...
                    </h3>
                  </div>
                ) : activeChat ? (
                  <ChatWindow
                    chat={activeChat}
                    messages={messagesData || []}
                    currentUserId={currentUserId || 0}
                    setChats={setChats}
                    onSend={handleSendMessage}
                    openSidebar={() => setMobileSidebarOpen(true)}
                    queryClient={queryClient}
                    messagesSearch={messagesSearch}
                    setMessagesSearch={setMessagesSearch}
                    fetchNextMessages={fetchNextMessages}
                    hasMoreMessages={hasMoreMessages}
                    isFetchingMoreMessages={isFetchingMoreMessages}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--fg)]/40 p-10 text-center relative">
                    <button
                      onClick={() => setMobileSidebarOpen(true)}
                      className="lg:hidden absolute top-4 left-4 p-2 bg-[var(--fg)]/5 rounded-lg"
                    >
                      <FiArrowLeft size={20} />
                    </button>
                    <div className="w-24 h-24 bg-[var(--fg)]/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <FiSend size={40} className="opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your Messages</h3>
                    <p className="max-w-xs">
                      Select a conversation to start chatting or find a new
                      connection.
                    </p>
                    <button
                      onClick={() => setMobileSidebarOpen(true)}
                      className="mt-6 lg:hidden px-6 py-2 bg-blue-600 text-white rounded-full font-bold"
                    >
                      View Chats
                    </button>
                  </div>
                )}
              </div>

              {mobileSidebarOpen && (
                <div
                  className="fixed inset-0 bg-var(--bg/60) z-40 lg:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
