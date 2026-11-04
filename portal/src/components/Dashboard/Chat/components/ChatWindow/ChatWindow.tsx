import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiArrowLeft, FiMoreVertical, FiSearch, FiX } from 'react-icons/fi';
import { clearChatApi, deleteChatApi, blockUserApi } from '@/api/chat.api';
import type { IChat, IChatMessage } from '@/api/chat.api';
import CommonModal from '@/components/CommonModal';
import { getProfilePath } from '../../utils/chatUtils';
import IncomingMessage from './IncomingMessage';
import OutgoingMessage from './OutgoingMessage';
import ChatInput from './ChatInput';
import ChatAvatar from '../ChatAvatar';

interface ChatWindowProps {
  chat: IChat;
  messages: IChatMessage[];
  currentUserId: number;
  setChats: React.Dispatch<React.SetStateAction<IChat[]>>;
  onSend: (text: string, mediaUrl?: string, type?: string) => void;
  openSidebar: () => void;
  queryClient: any;
  messagesSearch: string;
  setMessagesSearch: (s: string) => void;
  fetchNextMessages: () => void;
  hasMoreMessages: boolean;
  isFetchingMoreMessages: boolean;
}

export default function ChatWindow({
  chat,
  messages,
  currentUserId,
  setChats,
  onSend,
  openSidebar,
  queryClient,
  messagesSearch,
  setMessagesSearch,
  fetchNextMessages,
  hasMoreMessages,
  isFetchingMoreMessages,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreMessages &&
          !isFetchingMoreMessages
        ) {
          fetchNextMessages();
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMoreMessages, isFetchingMoreMessages, fetchNextMessages]);

  const sortedMessages = useMemo(() => {
    let finalMessages = [...messages];
    return finalMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const lastMessageId =
    sortedMessages.length > 0
      ? sortedMessages[sortedMessages.length - 1].id
      : null;

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    scrollToBottom();
    requestAnimationFrame(scrollToBottom);

    const timeout = setTimeout(scrollToBottom, 100);
    const timeout2 = setTimeout(scrollToBottom, 300);

    return () => {
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [lastMessageId, chat.id]);

  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    type: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    type: 'warning',
  });

  const handleClearChat = async () => {
    setConfirmationModal({
      isOpen: true,
      title: 'Clear Chat History',
      message:
        'Are you sure you want to clear all messages? This cannot be undone.',
      type: 'danger',
      action: async () => {
        try {
          await clearChatApi(chat.id);

          queryClient.setQueryData(['chat-messages', chat.id], []);
          queryClient.invalidateQueries({ queryKey: ['my-chats'] });

          setChats((prev) =>
            prev.map((c) =>
              Number(c.id) === Number(chat.id)
                ? { ...c, lastMessage: null, unreadCount: 0 }
                : c
            )
          );
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
          setOptionsOpen(false);
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const handleDeleteChat = async () => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Conversation',
      message: 'Are you sure you want to delete this chat?',
      type: 'danger',
      action: async () => {
        try {
          await deleteChatApi(chat.id);
          setChats((prev) =>
            prev.filter((c) => Number(c.id) !== Number(chat.id))
          );
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
          setOptionsOpen(false);
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const handleBlockUser = async () => {
    setConfirmationModal({
      isOpen: true,
      title: 'Block User',
      message: 'Are you sure you want to block this user?',
      type: 'warning',
      action: async () => {
        try {
          await blockUserApi(chat.id);
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
          setOptionsOpen(false);
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--fg)]/10 flex items-center justify-between bg-[var(--card-bg)]/50 backdrop-blur-md z-10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button onClick={openSidebar} className="lg:hidden p-2 -ml-2">
            <FiArrowLeft size={20} />
          </button>
          <ChatAvatar
            src={getProfilePath(chat.otherUser?.profileImage || null)}
            name={`${chat.otherUser?.firstname || ''} ${chat.otherUser?.lastname || ''}`}
            size="md"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-[var(--fg)] leading-tight truncate">
              {chat.otherUser?.firstname} {chat.otherUser?.lastname}
            </h3>
            <span className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
            </span>
          </div>
        </div>

        <div className="flex items-center">
          {isSearching ? (
            <div className="flex items-center bg-[var(--fg)]/5 rounded-full px-3 py-1 mr-2 w-32 sm:w-48 transition-all">
              <FiSearch size={14} className="text-[var(--fg)]/50 mr-2" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={messagesSearch}
                onChange={(e) => setMessagesSearch(e.target.value)}
                className="bg-transparent text-sm w-full outline-none"
              />
              <button
                onClick={() => {
                  setIsSearching(false);
                  setMessagesSearch('');
                }}
                className="text-[var(--fg)]/50 hover:text-[var(--fg)]"
              >
                <FiX size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearching(true)}
              className="p-2 hover:bg-[var(--fg)]/10 rounded-full transition-colors mr-1"
              title="Search in chat"
            >
              <FiSearch size={20} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setOptionsOpen(!optionsOpen)}
              className="p-2 hover:bg-[var(--fg)]/10 hidden rounded-full transition-colors"
            >
              <FiMoreVertical size={20} />
            </button>
            {optionsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOptionsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card-bg)] border border-[var(--fg)]/10 shadow-xl rounded-xl z-50 overflow-hidden backdrop-blur-xl">
                  <button
                    onClick={handleClearChat}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--fg)]/5 text-sm"
                  >
                    Clear Chat
                  </button>
                  <button
                    onClick={handleDeleteChat}
                    className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 text-sm border-t border-[var(--fg)]/5"
                  >
                    Delete Chat
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--fg)]/5 text-sm border-t border-[var(--fg)]/5"
                  >
                    Block User
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1"
        ref={scrollRef}
      >
        <div
          ref={loaderRef}
          className="h-4 w-full flex items-center justify-center shrink-0 mb-2"
        >
          {isFetchingMoreMessages && (
            <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 animate-spin rounded-full"></div>
          )}
        </div>
        {sortedMessages.length === 0 && messagesSearch && (
          <div className="flex h-full items-center justify-center text-[var(--fg)]/40 text-sm">
            No messages found for "{messagesSearch}"
          </div>
        )}
        {sortedMessages.map((msg, i) => {
          const isMe = Number(msg.senderId) === Number(currentUserId);
          return isMe ? (
            <OutgoingMessage
              key={i}
              text={msg.content || msg.text || ''}
              time={new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              status={msg.status}
              mediaUrl={msg.mediaUrl}
              type={msg.type}
              onImageClick={setViewingImage}
            />
          ) : (
            <IncomingMessage
              key={i}
              text={msg.content || msg.text || ''}
              time={new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              sender={{
                ...chat.otherUser,
                ...msg,
                profileImage: chat.otherUser?.profileImage,
              }}
              onImageClick={setViewingImage}
            />
          );
        })}
      </div>

      <ChatInput onSend={onSend} />

      {viewingImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <img
            src={viewingImage}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-5 right-5 text-white bg-white/10 p-2 rounded-full"
          >
            ✕
          </button>
        </div>
      )}

      <CommonModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        title={confirmationModal.title}
        className="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm opacity-80">{confirmationModal.message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() =>
                setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
              }
              className="px-4 py-2 rounded-lg text-sm font-medium opacity-60 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmationModal.action}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg ${
                confirmationModal.type === 'danger'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-yellow-500'
              }`}
            >
              {confirmationModal.type === 'danger' ? 'Confirm' : 'Yes'}
            </button>
          </div>
        </div>
      </CommonModal>
    </div>
  );
}
