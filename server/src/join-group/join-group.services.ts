import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { NotificationType, Prisma } from '../generated/prisma/client';
import { GroupMember } from '../generated/prisma/browser';
import { AccountsService } from '../accounts';
import { NotificationService } from '../notification';
import { AdminNotificationCode, NotificationAudience } from '@Common';

@Injectable()
export class JoinGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountService: AccountsService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(data: { accountId: number; groupIds: number[] }): Promise<{
    joined: GroupMember[];
    alreadyJoined: number[];
  }> {
    const groupIds = [...new Set(data.groupIds)];
    const existingMembers = await this.prisma.groupMember.findMany({
      where: {
        accountId: data.accountId,
        groupId: {
          in: groupIds,
        },
      },
    });

    const alreadyJoined = existingMembers.map((member) => member.groupId!);
    const alreadyJoinedSet = new Set(alreadyJoined);

    const newGroupIds = groupIds.filter(
      (groupId) => !alreadyJoinedSet.has(groupId),
    );

    if (newGroupIds.length === 0) {
      return {
        joined: [],
        alreadyJoined,
      };
    }

    await this.prisma.groupMember.createMany({
      data: newGroupIds.map((groupId) => ({
        accountId: data.accountId,
        groupId,
      })),
      skipDuplicates: true,
    });

    const joined = await this.prisma.groupMember.findMany({
      where: {
        accountId: data.accountId,
        groupId: {
          in: newGroupIds,
        },
      },
    });

    const trustees = await this.prisma.account.findMany({
      where: {
        type: 'Trustee',
      },
      select: {
        id: true,
      },
    });

    const trusteeIds = trustees.map((trustee) => trustee.id);

    await Promise.all(
      joined.map((member) =>
        this.notificationService._sendNotification({
          code: AdminNotificationCode.JOIN_GROUP_BY_USER,
          audience: NotificationAudience.BOTH,
          type: NotificationType.Informational,
          userIds: trusteeIds,
          data: {
            groupId: member.groupId,
          },
        }),
      ),
    );

    return {
      joined,
      alreadyJoined,
    };
  }

  // async update(
  //   groupId: number,
  //   data: {
  //     title?: string;
  //     description?: string;
  //     categoryId?: number;
  //     image?: string;
  //   },
  // ): Promise<Group> {
  //   const group = await this.getById(groupId);
  //   return await this.prisma.$transaction(
  //     async (tx) => {
  //       const updatedGroup = await tx.group.update({
  //         data: {
  //           title: data.title,
  //           description: data.description,
  //           image: data.image,
  //           categoryId: data.categoryId,
  //         },
  //         where: { id: groupId },
  //       });

  //       // Remove previous profile image from storage
  //       if (data.image) {
  //         if (group.image) {
  //           await this.storageService.removeFile(
  //             join(this.groupImagePath, group.image),
  //           );
  //         }

  //         await this.storageService.move(data.image, this.groupImagePath);
  //       }

  //       return updatedGroup;
  //     },
  //     { timeout: 20000 },
  //   );
  // }

  // async delete(groupId: number): Promise<GroupMember> {
  //   return await this.prisma.group.delete({
  //     where: { id: groupId },
  //   });
  // }

  async getAll(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: GroupMember[];
  }> {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.GroupMemberWhereInput = {};
    const totalGroups = await this.prisma.groupMember.count({
      where,
    });
    const groups = await this.prisma.groupMember.findMany({
      where,
      include: {
        group: {
          select: {
            title: true,
            description: true,
          },
        },
        account: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
          },
        },
      },
      orderBy: { id: Prisma.SortOrder.asc },
      skip: pagination.skip,
      take: pagination.take,
    });
    return {
      count: totalGroups,
      skip: pagination.skip,
      take: pagination.take,
      data: groups,
    };
  }

  async getUserGroups(accountId: number) {
    const groups = await this.prisma.group.findMany({
      include: {
        groupMember: {
          where: { accountId },
          select: { id: true },
        },
      },
    });

    return groups.map((group) => ({
      ...group,
      isJoined: group.groupMember.length > 0,
    }));
  }

  async getJoinedGroups(accountId: number) {
    const groups = await this.prisma.group.findMany({
      where: {
        groupMember: {
          some: { accountId },
        },
      },
      select: { id: true, title: true, description: true, groupStatus: true },
    });

    return groups;
  }

  async removeMember(groupId: number, accountId: number): Promise<GroupMember> {
    const existing = await this.prisma.groupMember.findFirst({
      where: {
        groupId,
        accountId,
      },
    });
    if (!existing) {
      throw new Error(
        `Member with accountId ${accountId} not found in group ${groupId}`,
      );
    }

    return await this.prisma.groupMember.delete({
      where: {
        accountId_groupId: {
          groupId: groupId,
          accountId: accountId,
        },
      },
    });
  }

  async exitGroupByUser(
    groupId: number,
    accountId: number,
    data: { password: string },
  ): Promise<GroupMember> {
    const existing = await this.prisma.groupMember.findFirst({
      where: {
        groupId,
        accountId,
      },
    });
    if (!existing) {
      throw new Error(
        `Member with accountId ${accountId} not found in group ${groupId}`,
      );
    }
    const user = await this.accountService.getById(accountId);
    const checkPassword = await this.accountService.validateCredentials(
      user.email,
      data.password,
    );
    if (!checkPassword) {
      throw new Error('Password is incorrect');
    }
    return await this.prisma.groupMember.delete({
      where: {
        accountId_groupId: {
          groupId: groupId,
          accountId: accountId,
        },
      },
    });
  }
}
