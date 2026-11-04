import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/services/socket.service';
import type { IChat } from '@/api/chat.api';

export const useChatSockets = (
  currentUserId: number | undefined,
  activeChatId: number | null,
  setChats: React.Dispatch<React.SetStateAction<IChat[]>>
) => {
  const queryClient = useQueryClient();
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    if (currentUserId && !socketService.isConnected) {
      socketService.connect(Number(currentUserId));
    }

    const handleNewMessage = (message: any) => {
      const chatId = Number(message.chatroomId) || Number(message.chatId);

      queryClient.setQueryData(
        ['chat-messages', chatId],
        (oldMessages: any[]) => {
          if (!oldMessages) return [message];
          if (oldMessages.find((m) => m.id === message.id)) return oldMessages;
          return [...oldMessages, message];
        }
      );

      queryClient.invalidateQueries({
        queryKey: ['chat-messages'],
        exact: false,
      });

      setChats((prev) => {
        const idx = prev.findIndex((c) => Number(c.id) === chatId);
        if (idx === -1) {
          queryClient.invalidateQueries({ queryKey: ['my-chats'] });
          return prev;
        }
        const updated = { ...prev[idx] };
        updated.lastMessage = { ...message, type: message.type || 'Text' };

        if (chatId !== activeChatIdRef.current) {
          updated.unreadCount = (updated.unreadCount || 0) + 1;
        } else {
          import('@/api/chat.api').then(({ markAsReadApi }) => {
            markAsReadApi(chatId).catch(console.error);
          });
          socketService.emit('mark-read', {
            chatroomId: chatId,
            chatRoomId: chatId,
            chatId,
          });
          updated.unreadCount = 0;
        }

        const rest = prev.filter((_, i) => i !== idx);
        return [updated, ...rest];
      });
    };

    const handleStatusUpdate = ({}: { chatId?: number }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    };

    const handleNewChat = () => {
      queryClient.invalidateQueries({ queryKey: ['my-chats'] });
    };

    socketService.on('new-message', handleNewMessage);
    socketService.on('new-chat', handleNewChat);
    socketService.on('message-status', () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    });
    socketService.on('messages-read', (data) => {
      if (data.chatId) handleStatusUpdate({ chatId: Number(data.chatId) });
    });

    return () => {
      socketService.off('new-message');
      socketService.off('message-status');
      socketService.off('messages-read');
    };
  }, [currentUserId, setChats, queryClient]);
};
