import { StorageService, UtilsService } from '@Common';
import { userConfigFactory } from '@Config';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client';
import {
  AccountStatus,
  AccountType,
  ChatroomType,
  MessageStatus,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma';

@Injectable()
export class ChartsService {
  constructor(
    @Inject(userConfigFactory.KEY)
    private readonly config: ConfigType<typeof userConfigFactory>,
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly storageService: StorageService,
  ) {}

  private getProfileImageUrl(profileImage: string): string {
    return this.storageService.getFileUrl(
      profileImage,
      this.config.profileImagePath,
    );
  }

  async createChatroom(
    creatorId: number,
    type: ChatroomType,
    participantIds: number[],
  ) {
    const uniqueParticipants = Array.from(
      new Set(participantIds.filter((id) => id !== creatorId)),
    );

    console.log('data', participantIds, uniqueParticipants);
    // direct charts
    if (type === ChatroomType.Direct) {
      if (uniqueParticipants.length !== 1) {
        throw new Error('Direct chat must have exactly one participant');
      }

      const otherUserId = uniqueParticipants[0];

      // Check if direct chat already exists
      const existingChat = await this.prisma.chatRoom.findFirst({
        where: {
          type: ChatroomType.Direct,
          AND: [
            {
              members: {
                some: { accountId: creatorId },
              },
            },
            {
              members: {
                some: { accountId: otherUserId },
              },
            },
          ],
        },
        include: {
          members: true,
        },
      });

      if (existingChat) {
        return existingChat;
      }
    }

    // create chartroom
    const chatroom = await this.prisma.$transaction(async (tx) => {
      return tx.chatRoom.create({
        data: {
          type,
          createdById: creatorId,
          members: {
            create: [
              {
                accountId: creatorId,
              },
              ...uniqueParticipants.map((id) => ({
                accountId: id,
              })),
            ],
          },
        },
        include: {
          members: {
            select: {
              accountId: true,
              account: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  type: true,
                  email: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });
    });

    return chatroom;
  }

  async getChatrooms(options: {
    accountId: number;
    search?: string;
    skip?: number;
    take?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const { accountId } = options;

    const search = options.search?.trim();

    const skip = options.skip ?? 0;
    const take = options.take ?? 10;

    const where: Prisma.ChatRoomWhereInput = {
      isActive: true,
      members: {
        some: {
          accountId, // current user should be present
        },
      },
    };

    if (options.fromDate || options.toDate) {
      where.createdAt = {};

      if (options.fromDate) {
        where.createdAt.gte = new Date(options.fromDate);
      }

      if (options.toDate) {
        where.createdAt.lte = new Date(options.toDate);
      }
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          asset: {
            assetTitle: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          members: {
            some: {
              account: {
                OR: [
                  {
                    firstname: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    lastname: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        },
      ];
    }

    const totalChatrooms = await this.prisma.chatRoom.count({
      where,
    });

    const chatrooms = await this.prisma.chatRoom.findMany({
      where,
      skip,
      take,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        lastMessage: {
          select: {
            id: true,
            content: true,
            mediaUrl: true,
            type: true,
            createdAt: true,
            senderId: true,
          },
        },
        members: {
          include: {
            account: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                profileImage: true,
                type: true,
                email: true,
              },
            },
          },
        },
        asset: {
          select: { id: true, assetTitle: true },
        },
      },
    });

    if (!chatrooms.length) {
      return {
        count: totalChatrooms,
        skip,
        take,
        data: [],
      };
    }

    const data = chatrooms.map((chatroom) => {
      const currentMembership = chatroom.members.find(
        (m) => m.accountId === accountId,
      );

      const unreadCount = currentMembership?.unreadCount ?? 0;
      let otherUser: any = null;

      if (chatroom.type === ChatroomType.Direct) {
        const otherMember = chatroom.members.find(
          (m) => m.accountId !== accountId,
        );

        if (otherMember) {
          otherUser = {
            id: otherMember.account.id,
            firstname: otherMember.account.firstname,
            lastname: otherMember.account.lastname,
            profileImage: otherMember.account.profileImage
              ? this.getProfileImageUrl(otherMember.account.profileImage)
              : null,
            userType: otherMember.account.type,
            email: otherMember.account.email,
          };
        }
      }

      return {
        id: chatroom.id,
        type: chatroom.type,

        name:
          chatroom.type === ChatroomType.Group
            ? chatroom.name
            : otherUser
              ? `${otherUser.firstname} ${otherUser.lastname}`
              : null,
        asset: chatroom.asset
          ? { id: chatroom.asset.id, assetTitle: chatroom.asset.assetTitle }
          : null,
        lastMessage: chatroom.lastMessage,

        unreadCount,

        otherUser,

        participants:
          chatroom.type === ChatroomType.Group
            ? chatroom.members.map((m) => ({
                id: m.account.id,
                firstname: m.account.firstname,
                lastname: m.account.lastname,
                profileImage: m.account.profileImage,
                userType: m.account.type,
              }))
            : undefined,

        updatedAt: chatroom.updatedAt,
      };
    });

    return {
      count: totalChatrooms,
      skip,
      take,
      data,
    };
  }

  async getMessages(options: {
    chatRoomId: number;
    accountId: number;
    search?: string;
    skip?: number;
    take?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const {
      chatRoomId,
      accountId,
      search,
      skip = 0,
      take = 20,
      fromDate,
      toDate,
    } = options;

    const member = await this.prisma.chatRoomUser.findUnique({
      where: {
        chatRoomId_accountId: {
          chatRoomId: chatRoomId,
          accountId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this chatroom');
    }

    const where: Prisma.MessageWhereInput = {
      chatRoomId: chatRoomId,
      deletedAt: null,
      createdAt: {
        gt: member.clearedAt ?? new Date(0), // (0) means we return starting time
      },
    };

    // Date filter
    if (fromDate || toDate) {
      where.createdAt = {};

      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }

      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Search filter (content only)
    if (search?.trim()) {
      where.content = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const totalMessages = await this.prisma.message.count({
      where,
    });

    const messages = await this.prisma.message.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        mediaUrl: true,
        type: true,
        status: true,
        createdAt: true,
        senderId: true,
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

    return {
      count: totalMessages,
      skip,
      take,
      data: messages,
    };
  }

  async getUsersAvailableForChat(options: {
    search?: string;
    accountId: number;
    accountType?: AccountType;
    skip?: number;
    take?: number;
  }) {
    const search = options?.search?.trim();
    const pagination = {
      skip: options?.skip || 0,
      take: options?.take || 10,
    };

    const existingChatUsers = await this.prisma.chatRoomUser.findMany({
      where: {
        chatRoom: {
          type: ChatroomType.Direct,
          members: {
            some: { accountId: options?.accountId },
          },
        },
        NOT: { accountId: options?.accountId },
      },
      select: {
        accountId: true,
      },
    });

    const excludedUserIds = existingChatUsers.map((u) => u.accountId);

    const where: Prisma.AccountWhereInput = {
      id: {
        notIn: [options.accountId, ...excludedUserIds],
      },
      isDeleted: false,
      status: AccountStatus.Active,
      type: options?.accountType,
    };

    if (search) {
      const buildSearchFilter = (value: string): Prisma.AccountWhereInput[] => [
        {
          firstname: {
            contains: value,
            mode: 'insensitive',
          },
        },
        {
          lastname: {
            contains: value,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: value,
            mode: 'insensitive',
          },
        },
        {
          mobile: {
            contains: value,
            mode: 'insensitive',
          },
        },
      ];

      const parts = search.split(' ');

      if (parts.length) {
        where.AND = [];

        for (const part of parts) {
          if (part.trim()) {
            where.AND.push({
              OR: buildSearchFilter(part.trim()),
            });
          }
        }
      }
    }

    const totalUsers = await this.prisma.account.count({
      where,
    });

    const users = await this.prisma.account.findMany({
      where,
      orderBy: { createdAt: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        mobile: true,
        profileImage: true,
        type: true,
        createdAt: true,
      },
    });

    const response = await this.utilsService.batchable(users, async (user) => {
      return {
        ...user,
        profileImage: user.profileImage
          ? this.getProfileImageUrl(user.profileImage)
          : null,
      };
    });

    return {
      count: totalUsers,
      skip: pagination.skip,
      take: pagination.take,
      data: response,
    };
  }

  async markChatroomAsRead(chatRoomId: number, accountId: number) {
    const membership = await this.prisma.chatRoomUser.findFirst({
      where: {
        chatRoomId,
        accountId,
      },
    });

    if (!membership) {
      throw new Error('User is not member of this chatroom');
    }

    const now = new Date();

    await this.prisma.message.updateMany({
      where: {
        chatRoomId,
        senderId: { not: accountId },
        status: { not: MessageStatus.Read },
      },
      data: {
        status: MessageStatus.Read,
      },
    });
    await this.prisma.chatRoomUser.update({
      where: {
        id: membership.id,
      },
      data: {
        lastReadAt: now,
        unreadCount: 0,
      },
    });

    return { success: true };
  }

  async clearChat(chatRoomId: number, accountId: number) {
    const membership = await this.prisma.chatRoomUser.findFirst({
      where: {
        chatRoomId,
        accountId,
      },
    });

    if (!membership) {
      throw new Error('User is not member of this chatroom');
    }
    await this.prisma.chatRoomUser.updateMany({
      where: {
        chatRoomId,
        accountId,
      },
      data: {
        clearedAt: new Date(),
      },
    });

    return { success: true };
  }

  async deleteChat(chatRoomId: number, accountId: number) {
    const membership = await this.prisma.chatRoomUser.findFirst({
      where: {
        chatRoomId,
        accountId,
      },
    });

    if (!membership) {
      throw new Error('User is not member of this chatroom');
    }
    await this.prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: {
        isActive: false,
      },
    });

    return { success: true };
  }

  async blockUser(blockerId: number, blockedId: number) {
    if (blockerId === blockedId) {
      throw new Error('You cannot block yourself');
    }

    const existing = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (existing) {
      return {
        message: 'User already blocked',
        success: true,
      };
    }

    await this.prisma.blockedUser.create({
      data: {
        blockerId,
        blockedId,
      },
    });

    return {
      message: 'User blocked successfully',
      success: true,
    };
  }

  async unblockUser(blockerId: number, blockedId: number) {
    const existing = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (!existing) {
      return {
        message: 'User already unblocked',
        success: true,
      };
    }

    await this.prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    return {
      message: 'User unblocked successfully',
      success: true,
    };
  }

  async createAssetChatroom(accountId: number, assetId: number) {
    const existing = await this.prisma.chatRoom.findFirst({
      where: {
        assetId,
        type: ChatroomType.Direct,
        members: {
          some: { accountId },
        },
      },
      include: { members: true },
    });
    if (existing) return existing;

    const asset = await this.prisma.asset.findUnique({
      where: {
        id: assetId,
      },
      select: { accountId: true },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      return tx.chatRoom.create({
        data: {
          type: ChatroomType.Direct,
          createdById: accountId,
          assetId,
          members: {
            create: [{ accountId }, { accountId: asset.accountId! }],
          },
        },
        include: {
          members: {
            include: {
              account: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  profileImage: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async getAssetChatRoom(
    assetId: number,
    options?: { skip?: number; take?: number },
  ) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const [count, chatrooms] = await Promise.all([
      this.prisma.chatRoom.count({ where: { assetId } }),
      this.prisma.chatRoom.findMany({
        where: { assetId },
        include: {
          lastMessage: {
            select: {
              id: true,
              content: true,
              type: true,
              createdAt: true,
              senderId: true,
            },
          },
          members: {
            include: {
              account: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  profileImage: true,
                  type: true,
                },
              },
            },
          },
          asset: {
            select: { id: true, assetTitle: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return { count, ...pagination, data: chatrooms };
  }
}
