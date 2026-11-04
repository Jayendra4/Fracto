/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ChatroomType,
  MessageStatus,
  MessageType,
} from '../generated/prisma/enums';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'charts',
})
export class ChartsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly prisma: PrismaService) {}

  @WebSocketServer()
  server: Server;

  // accountId → socketId
  private onlineUsers = new Map<number, string>();

  // socket connect
  async handleConnection(socket: Socket) {
    const accountId =
      Number(socket.handshake.auth.accountId) ||
      Number(socket.handshake.query.accountId);

    if (!accountId) {
      socket.disconnect();
      return;
    }

    this.onlineUsers.set(accountId, socket.id);
    console.log(`User connected: ${accountId}`);
  }

  //  socket disconnect
  async handleDisconnect(socket: Socket) {
    const accountId = [...this.onlineUsers.entries()].find(
      ([_, sId]) => sId === socket.id,
    )?.[0];

    if (accountId) {
      this.onlineUsers.delete(accountId);
      console.log(`User disconnected: ${accountId}`);
    }
  }

  //  join chartroom
  @SubscribeMessage('join-room')
  async joinRoom(socket: Socket, payload: { chatroomId: number }) {
    const accountId =
      Number(socket.handshake.auth.accountId) ||
      Number(socket.handshake.query.accountId);

    // Verify membership
    const member = await this.prisma.chatRoomUser.findUnique({
      where: {
        chatRoomId_accountId: {
          chatRoomId: payload.chatroomId,
          accountId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this chatroom');
    }

    socket.join(`room-${payload.chatroomId}`);
    console.log(`User ${accountId} joined room-${payload.chatroomId}`);
  }

  //  send message
  @SubscribeMessage('send-message')
  async sendMessage(
    socket: Socket,
    payload: { chatroomId: number; content?: string; mediaUrl?: string },
  ) {
    const senderId =
      Number(socket.handshake.auth.accountId) ||
      Number(socket.handshake.query.accountId);

    if (!senderId) {
      throw new ForbiddenException('Invalid sender');
    }

    if (!payload.chatroomId) {
      throw new BadRequestException('Chatroom ID is required');
    }

    if (!payload.content && !payload.mediaUrl) {
      throw new BadRequestException('Message content required');
    }

    const chatroom = await this.prisma.chatRoom.findUnique({
      where: { id: payload.chatroomId },
      include: {
        members: true,
      },
    });

    if (!chatroom) {
      throw new NotFoundException('Chatroom not found');
    }

    const member = chatroom.members.find((m) => m.accountId === senderId);

    if (!member) {
      throw new ForbiddenException('Cannot send message to this chatroom');
    }

    if (chatroom.type === ChatroomType.Direct) {
      const otherMember = chatroom.members.find(
        (m) => m.accountId !== senderId,
      );

      if (otherMember) {
        const isBlocked = await this.prisma.blockedUser.findFirst({
          where: {
            OR: [
              {
                blockerId: senderId,
                blockedId: otherMember.accountId,
              },
              {
                blockerId: otherMember.accountId,
                blockedId: senderId,
              },
            ],
          },
        });

        if (isBlocked) {
          throw new ForbiddenException(
            'Message cannot be sent. User is blocked.',
          );
        }
      }
    }

    const messageType = payload.mediaUrl ? MessageType.Image : MessageType.Text;

    const message = await this.prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          chatRoomId: payload.chatroomId,
          senderId,
          content: payload.content ?? null,
          mediaUrl: payload.mediaUrl ?? null,
          type: messageType,
          status: MessageStatus.Sent,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              profileImage: true,
            },
          },
        },
      });

      await tx.chatRoom.update({
        where: { id: payload.chatroomId },
        data: {
          lastMessageId: createdMessage.id,
        },
      });

      await tx.chatRoomUser.update({
        where: {
          chatRoomId_accountId: {
            chatRoomId: payload.chatroomId,
            accountId: senderId,
          },
        },
        data: {
          lastReadAt: new Date(),
          unreadCount: 0,
        },
      });

      await tx.chatRoomUser.updateMany({
        where: {
          chatRoomId: payload.chatroomId,
          accountId: {
            not: senderId,
          },
        },
        data: {
          unreadCount: {
            increment: 1,
          },
        },
      });
      return createdMessage;
    });

    this.server
      .to(`room-${payload.chatroomId}`)
      .emit('new-message', { ...message, assetId: chatroom.assetId ?? null });

    return message;
  }
}
