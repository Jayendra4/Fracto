import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import {
  getMyChatsApi,
  getChatMessagesApi,
  markAsReadApi,
} from '@/api/chat.api';
import type { IChat } from '@/api/chat.api';
import { socketService } from '@/services/socket.service';

export type SidebarView = 'recent' | 'available';

export const useChatData = () => {
  const [chats, setChats] = useState<IChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [sidebarView, setSidebarView] = useState<SidebarView>('recent');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

  // Search states
  const [chatsSearch, setChatsSearch] = useState('');
  const [debouncedChatsSearch, setDebouncedChatsSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedChatsSearch(chatsSearch), 500);
    return () => clearTimeout(timer);
  }, [chatsSearch]);

  const [messagesSearch, setMessagesSearch] = useState('');
  const [debouncedMessagesSearch, setDebouncedMessagesSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedMessagesSearch(messagesSearch),
      500
    );
    return () => clearTimeout(timer);
  }, [messagesSearch]);

  const initialChatSelected = useRef(false);
  const location = useLocation();
  const targetNewChatId: number | null = (location.state as any)?.newChatId ?? null;
  const currentUser = useSelector((state: any) => state.authLogin.user);
  const currentUserId = currentUser?.id;
  const queryClient = useQueryClient();

  // Infinite query for chats
  const {
    data: chatsInfiniteData,
    isLoading: isChatsLoading,
    fetchNextPage: fetchNextChats,
    hasNextPage: hasMoreChats,
    isFetchingNextPage: isFetchingMoreChats,
  } = useInfiniteQuery({
    queryKey: ['my-chats', currentUserId, debouncedChatsSearch],
    queryFn: async ({ pageParam = 0 }) => {
      if (!currentUserId) return { data: [], nextSkip: undefined };
      const take = 10;
      const res = await getMyChatsApi(
        Number(currentUserId),
        pageParam as number,
        take,
        debouncedChatsSearch
      );
      if (res.success && res.data) {
        const d = res.data;
        const items = Array.isArray(d.data) ? d.data : [d.data];
        const nextSkip =
          pageParam + take < d.count ? pageParam + take : undefined;
        return { data: items as IChat[], nextSkip };
      }
      return { data: [], nextSkip: undefined };
    },
    getNextPageParam: (lastPage: any) => lastPage.nextSkip,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    staleTime: 0,
    enabled: !!currentUserId,
  } as any); // using any for retro compatibility with different react-query v4/v5 versions

  useEffect(() => {
    if (chatsInfiniteData) {
      const allChats = chatsInfiniteData.pages.flatMap((p: any) => p.data);
      const unique = Array.from(
        new Map(
          allChats.filter((c: any) => c && c.id).map((c: any) => [c.id, c])
        ).values()
      );
      setChats(unique as IChat[]);

      if (unique.length > 0 && !initialChatSelected.current && !debouncedChatsSearch) {
        // If navigated here after creating a new chat, select it specifically
        if (targetNewChatId) {
          const target = unique.find((c: any) => Number(c.id) === Number(targetNewChatId));
          if (target) {
            initialChatSelected.current = true;
            handleSelectChat(target as IChat);
            return;
          }
          // target not yet in list (still loading fresh data) — don't fall through
          return;
        }
        // Default: select first chat on initial load
        if (!activeChatId) {
          initialChatSelected.current = true;
          handleSelectChat(unique[0] as IChat);
        }
      }
    }
  }, [chatsInfiniteData, activeChatId, debouncedChatsSearch, targetNewChatId]);

  // Infinite query for messages
  const {
    data: messagesInfiniteData,
    isLoading: isMessagesLoading,
    fetchNextPage: fetchNextMessages,
    hasNextPage: hasMoreMessages,
    isFetchingNextPage: isFetchingMoreMessages,
  } = useInfiniteQuery({
    queryKey: ['chat-messages', activeChatId, debouncedMessagesSearch],
    queryFn: async ({ pageParam = 0 }) => {
      if (!activeChatId) return { data: [], nextSkip: undefined };
      const take = 10;
      const res = await getChatMessagesApi(
        Number(currentUserId),
        activeChatId,
        pageParam as number,
        take,
        debouncedMessagesSearch
      );
      if (res.success && res.data) {
        const d = res.data;
        const items = Array.isArray(d.data) ? d.data : [];
        const nextSkip =
          pageParam + take < d.count ? pageParam + take : undefined;
        return { data: items as any[], nextSkip };
      }
      return { data: [], nextSkip: undefined };
    },
    getNextPageParam: (lastPage: any) => lastPage.nextSkip,
    initialPageParam: 0,
    RefetchOnWindowFocus: false,
    enabled: !!activeChatId && !!currentUserId,
    staleTime: 1000 * 60,
  } as any);

  const messagesData = useMemo(() => {
    if (!messagesInfiniteData) return [];
    const allMessages = messagesInfiniteData.pages.flatMap((p: any) => p.data);
    return Array.from(
      new Map(
        allMessages.filter((m: any) => m && m.id).map((m: any) => [m.id, m])
      ).values()
    );
  }, [messagesInfiniteData]);

  const handleSelectChat = useCallback(
    (chat: IChat) => {
      const chatId = Number(chat.id);
      if (!chatId) return;

      setActiveChatId(chatId);
      setMobileSidebarOpen(false);
      setMessagesSearch('');

      socketService.emit('join-room', {
        chatroomId: chatId,
        chatRoomId: chatId,
        chatId,
      });

      socketService.emit('mark-read', {
        chatroomId: chatId,
        chatRoomId: chatId,
        chatId,
        accountId: currentUserId,
      });
      markAsReadApi(chatId).catch(console.error);

      setChats((prev) =>
        prev.map((c) => {
          if (Number(c.id) === chatId) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        })
      );

      // Optimistically clear unread on react-query cache as well
      queryClient.setQueryData(
        ['my-chats', currentUserId, debouncedChatsSearch],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((p: any) => ({
              ...p,
              data: p.data.map((c: any) =>
                Number(c.id) === chatId ? { ...c, unreadCount: 0 } : c
              ),
            })),
          };
        }
      );
    },
    [currentUserId, debouncedChatsSearch, queryClient]
  );

  const handleSendMessage = useCallback(
    (text: string, mediaUrl?: string, type: string = 'Text') => {
      if (!activeChatId || !currentUserId) return;

      const tempId = Date.now();
      const newMessage: any = {
        id: tempId,
        chatId: activeChatId,
        content: text,
        text: text,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        status: 'Sending',
        mediaUrl: mediaUrl || null,
        type: type,
      };

      // Append to the first page (since we are probably showing newest at bottom but data might be appended)
      queryClient.setQueryData(
        ['chat-messages', activeChatId, debouncedMessagesSearch],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((p: any, i: number) => {
              if (i === 0) {
                return { ...p, data: [...p.data, newMessage] };
              }
              return p;
            }),
          };
        }
      );

      setChats((prev) => {
        const idx = prev.findIndex((c) => Number(c.id) === activeChatId);
        if (idx === -1) return prev;

        const updatedChat = {
          ...prev[idx],
          lastMessage: { ...newMessage, type, mediaUrl: mediaUrl || null },
        };

        const newChats = [...prev];
        newChats.splice(idx, 1);
        newChats.unshift(updatedChat);
        return newChats;
      });

      queryClient.invalidateQueries({ queryKey: ['my-chats'] });

      socketService.emit('send-message', {
        chatroomId: activeChatId,
        chatRoomId: activeChatId,
        chatId: activeChatId,
        content: text ? text : mediaUrl,
        // content: mediaUrl ? mediaUrl : text,
        mediaUrl: mediaUrl,
        type: type,
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['chat-messages', activeChatId],
        });
      }, 500);
    },
    [activeChatId, currentUserId, debouncedMessagesSearch, queryClient]
  );

  const handleCreatedChat = useCallback(
    (newChat: IChat, selectedUser?: any) => {
      setChats((prev) => {
        const exists = prev.find((c) => Number(c.id) === Number(newChat.id));
        if (exists) return prev;

        if (!newChat.otherUser && selectedUser) {
          newChat.otherUser = {
            id: selectedUser.id,
            firstname: selectedUser.firstname,
            lastname: selectedUser.lastname,
            profileImage: selectedUser.profileImage,
            userType: selectedUser.type,
          };
          if (!newChat.name) {
            newChat.name = `${selectedUser.firstname} ${selectedUser.lastname}`;
          }
        }

        return [newChat, ...prev];
      });

      handleSelectChat(newChat);
      setSidebarView('recent');
      queryClient.invalidateQueries({ queryKey: ['my-chats'] });

      socketService.emit('new-chat', {
        chatId: newChat.id,
        chatroomId: newChat.id,
        participantIds: selectedUser ? [selectedUser.id, currentUserId] : [],
      });
    },
    [handleSelectChat, queryClient, currentUserId]
  );

  return {
    chats,
    setChats,
    isChatsLoading,
    activeChatId,
    setActiveChatId,
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
    isMessagesLoading,
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
  };
};
