import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  NotificationType,
  Prisma,
  SpvStatus,
  VoteChoice,
} from '../generated/prisma/client';
import {
  AdminNotificationCode,
  getVoteStatus,
  NotificationAudience,
  VoteStatus,
} from '@Common';
import { SpvService } from '../spv/spv.service';
import { NotificationService } from '../notification';

@Injectable()
export class VoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spvService: SpvService,
    private readonly notificationService: NotificationService,
  ) {}

  // private buildPaginationMeta(skip: number, take: number, totalItems: number) {
  //   const limit = take > 0 ? take : totalItems;
  //   const page = limit > 0 ? Math.floor(skip / limit) + 1 : 1;
  //   const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

  //   return {
  //     page,
  //     limit,
  //     totalItems,
  //     totalPages,
  //     hasNextPage: page < totalPages,
  //     hasPreviousPage: page > 1,
  //   };
  // }

  async create(data: {
    accountId: number;
    assetId: number;
    secondaryClubId: number;
    choice: VoteChoice;
  }) {
    const club = await this.prisma.secondaryClubs.findUnique({
      where: { id: data.secondaryClubId },
    });

    if (!club) throw new NotFoundException('Secondary club not found');
    if (club.assetId !== data.assetId) {
      throw new BadRequestException('Asset does not match this secondary club');
    }

    const [membership, spv] = await Promise.all([
      this.prisma.assetInterest.findFirst({
        where: {
          accountId: data.accountId,
          secondaryClubId: data.secondaryClubId,
        },
      }),
      this.prisma.spv.findFirst({
        where: { secondaryClubId: data.secondaryClubId },
      }),
    ]);

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this secondary club',
      );
    }

    if (spv?.status === SpvStatus.Disabled) {
      throw new ForbiddenException(
        'Voting is disabled because your Supervisor is inactive.',
      );
    }

    const existingVote = await this.prisma.vote.findUnique({
      where: {
        secondaryClubId_accountId: {
          secondaryClubId: data.secondaryClubId,
          accountId: data.accountId,
        },
      },
    });

    if (existingVote) {
      throw new BadRequestException('You have already voted for this club');
    }

    const vote = await this.prisma.vote.create({
      data: {
        secondaryClubId: data.secondaryClubId,
        assetId: data.assetId,
        accountId: data.accountId,
        choice: data.choice,
      },
    });

    if (data.choice === VoteChoice.Yes) {
      await this.spvService.syncMembership(
        data.secondaryClubId,
        data.accountId,
      );
    }

    await this.notificationService._sendNotification({
      code: AdminNotificationCode.VOTE_PLUS_NDA_CONSENT,
      audience: NotificationAudience.ADMIN,
      type: NotificationType.Informational,
      data: {
        assetId: data.assetId,
        assetTitle: club.title,
      },
    });

    return vote;
  }

  async getAll(options?: {
    secondaryClubId?: number;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Prisma.VoteGetPayload<{ include: { account: true } }>[];
  }> {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.VoteWhereInput = {
      ...(options?.secondaryClubId && {
        secondaryClubId: options.secondaryClubId,
      }),
      ...(options?.search && {
        account: {
          OR: [
            { firstname: { contains: options.search, mode: 'insensitive' } },
            { lastname: { contains: options.search, mode: 'insensitive' } },
            { email: { contains: options.search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [count, data] = await Promise.all([
      this.prisma.vote.count({ where }),
      this.prisma.vote.findMany({
        where,
        include: { account: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  private async computeVoteBreakdown(secondaryClubId: number) {
    const totalMembers = await this.prisma.assetInterest.count({
      where: { secondaryClubId },
    });

    const votes = await this.prisma.vote.groupBy({
      by: ['choice'],
      where: { secondaryClubId },
      _count: { choice: true },
    });

    const counts: Record<VoteChoice, number> = {
      [VoteChoice.Yes]: 0,
      [VoteChoice.No]: 0,
      [VoteChoice.Abstain]: 0,
    };
    votes.forEach((v) => {
      counts[v.choice] = v._count.choice;
    });

    const totalVotes = counts.Yes + counts.No + counts.Abstain;
    const notVotedCount = Math.max(totalMembers - totalVotes, 0);

    const percentage = (count: number) =>
      totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;

    return {
      totalMembers,
      totalVotes,
      yesCount: counts.Yes,
      yesPercentage: percentage(counts.Yes),
      noCount: counts.No,
      noPercentage: percentage(counts.No),
      abstainCount: counts.Abstain,
      abstainPercentage: percentage(counts.Abstain),
      notVotedCount,
    };
  }

  async getClubVoteSummary(secondaryClubId: number) {
    const club = await this.prisma.secondaryClubs.findUnique({
      where: { id: secondaryClubId },
    });

    if (!club) throw new NotFoundException('Secondary club not found');

    const breakdown = await this.computeVoteBreakdown(secondaryClubId);

    return {
      secondaryClubId,
      startDate: club.startDate,
      endDate: club.endDate,
      ...breakdown,
    };
  }

  async getAllAssetVoteSummaries(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.SecondaryClubsWhereInput = {
      assetId: { not: null },
      ...(options?.search && {
        asset: {
          assetTitle: { contains: options.search, mode: 'insensitive' },
        },
      }),
    };

    const [count, clubs] = await Promise.all([
      this.prisma.secondaryClubs.count({ where }),
      this.prisma.secondaryClubs.findMany({
        where,
        include: { asset: { select: { id: true, assetTitle: true } } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const clubIds = clubs.map((club) => club.id);
    if (clubIds.length === 0) {
      return { count, skip: pagination.skip, take: pagination.take, data: [] };
    }

    const [memberCounts, voteCounts] = await Promise.all([
      this.prisma.assetInterest.groupBy({
        by: ['secondaryClubId'],
        where: { secondaryClubId: { in: clubIds } },
        _count: { _all: true },
      }),
      this.prisma.vote.groupBy({
        by: ['secondaryClubId', 'choice'],
        where: { secondaryClubId: { in: clubIds } },
        _count: { choice: true },
      }),
    ]);

    const memberCountMap = new Map(
      memberCounts.map((m) => [m.secondaryClubId, m._count._all]),
    );

    const voteCountMap = new Map<number, Record<VoteChoice, number>>();
    voteCounts.forEach((v) => {
      const existing = voteCountMap.get(v.secondaryClubId) ?? {
        [VoteChoice.Yes]: 0,
        [VoteChoice.No]: 0,
        [VoteChoice.Abstain]: 0,
      };
      existing[v.choice] = v._count.choice;
      voteCountMap.set(v.secondaryClubId, existing);
    });

    const percentage = (count: number, total: number) =>
      total > 0 ? Math.round((count / total) * 100) : 0;

    const data = clubs.map((club) => {
      const totalMembers = memberCountMap.get(club.id) ?? 0;
      const counts = voteCountMap.get(club.id) ?? {
        [VoteChoice.Yes]: 0,
        [VoteChoice.No]: 0,
        [VoteChoice.Abstain]: 0,
      };
      const totalVotes = counts.Yes + counts.No + counts.Abstain;

      return {
        assetId: club.asset?.id ?? club.assetId,
        assetTitle: club.asset?.assetTitle ?? null,
        secondaryClubId: club.id,
        totalMembers,
        totalVotes,
        notVotedCount: Math.max(totalMembers - totalVotes, 0),
        yesCount: counts.Yes,
        yesPercentage: percentage(counts.Yes, totalMembers),
        noCount: counts.No,
        noPercentage: percentage(counts.No, totalMembers),
        abstainCount: counts.Abstain,
        abstainPercentage: percentage(counts.Abstain, totalMembers),
      };
    });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  async getAssetVoteSummary(assetId: number, options?: { search?: string }) {
    const club = await this.prisma.secondaryClubs.findFirst({
      where: { assetId },
      include: { asset: { select: { id: true, assetTitle: true } } },
    });

    if (!club) {
      throw new NotFoundException('No secondary club found for this asset');
    }

    const [totalMembers, votes] = await Promise.all([
      this.prisma.assetInterest.count({
        where: { secondaryClubId: club.id },
      }),
      this.prisma.vote.findMany({
        where: { secondaryClubId: club.id },
        include: {
          account: {
            select: { id: true, firstname: true, lastname: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const search = options?.search?.trim().toLowerCase();

    const counts: Record<VoteChoice, number> = {
      [VoteChoice.Yes]: 0,
      [VoteChoice.No]: 0,
      [VoteChoice.Abstain]: 0,
    };
    const membersByChoice: Record<
      VoteChoice,
      {
        accountId: number;
        name: string;
        email: string;
        voteStatus: VoteChoice;
        votedAt: Date;
      }[]
    > = {
      [VoteChoice.Yes]: [],
      [VoteChoice.No]: [],
      [VoteChoice.Abstain]: [],
    };

    for (const vote of votes) {
      counts[vote.choice]++;

      const name = `${vote.account.firstname} ${vote.account.lastname}`;
      const matchesSearch =
        !search ||
        name.toLowerCase().includes(search) ||
        vote.account.email.toLowerCase().includes(search);

      if (matchesSearch) {
        membersByChoice[vote.choice].push({
          accountId: vote.accountId,
          name,
          email: vote.account.email,
          voteStatus: vote.choice,
          votedAt: vote.createdAt,
        });
      }
    }

    const totalVotes = counts.Yes + counts.No + counts.Abstain;
    const notVotedCount = Math.max(totalMembers - totalVotes, 0);
    const percentage = (count: number) =>
      totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;

    return {
      assetId: club.asset?.id ?? assetId,
      assetTitle: club.asset?.assetTitle ?? null,
      secondaryClubId: club.id,
      totalMembers,
      totalVotes,
      notVotedCount,
      yesCount: counts.Yes,
      yesPercentage: percentage(counts.Yes),
      noCount: counts.No,
      noPercentage: percentage(counts.No),
      abstainCount: counts.Abstain,
      abstainPercentage: percentage(counts.Abstain),
      members: {
        yes: membersByChoice[VoteChoice.Yes],
        no: membersByChoice[VoteChoice.No],
        abstain: membersByChoice[VoteChoice.Abstain],
      },
    };
  }

  async getOwnerVoteStatistics(
    ownerId: number,
    options?: { skip?: number; take?: number },
  ) {
    // const skip = options?.skip ?? 0;
    // const take = options?.take ?? 10;

    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.SecondaryClubsWhereInput = {
      asset: { accountId: ownerId },
    };

    const [totalItems, clubs] = await Promise.all([
      this.prisma.secondaryClubs.count({ where }),
      this.prisma.secondaryClubs.findMany({
        where,
        include: {
          asset: { select: { id: true, assetTitle: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const data = await Promise.all(
      clubs.map(async (club) => {
        const breakdown = await this.computeVoteBreakdown(club.id);

        return {
          assetId: club.asset?.id ?? club.assetId,
          assetTitle: club.asset?.assetTitle ?? null,
          secondaryClubId: club.id,
          clubTitle: club.title,
          ...breakdown,
        };
      }),
    );

    return {
      count: totalItems,
      skip: pagination.skip,
      take: pagination.take,
      data,
    };
  }
}
