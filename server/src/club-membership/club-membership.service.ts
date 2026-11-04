import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  MembershipStatus,
  NotificationType,
  Prisma,
  VoteChoice,
} from '../generated/prisma/client';
import { SpvService } from '../spv/spv.service';
import { NotificationAudience, NotificationCode } from '@Common';
import { NotificationService } from '../notification';

@Injectable()
export class ClubMembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spvService: SpvService,
    private readonly notificationService: NotificationService,
  ) {}

  async acceptNda(accountId: number, secondaryClubId: number) {
    const club = await this.prisma.secondaryClubs.findUnique({
      where: { id: secondaryClubId },
      select: {
        assetId: true,
        asset: { select: { assetTitle: true } },
      },
    });
    if (!club) throw new NotFoundException('Secondary club not found');

    const membership = await this.prisma.assetInterest.findFirst({
      where: { accountId, secondaryClubId },
    });
    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this secondary club',
      );
    }

    const vote = await this.prisma.vote.findUnique({
      where: { secondaryClubId_accountId: { secondaryClubId, accountId } },
    });
    if (!vote) {
      throw new ForbiddenException(
        'You must cast your vote before accepting the NDA',
      );
    }

    const existing = await this.prisma.clubMembershipRequest.findUnique({
      where: { secondaryClubId_accountId: { secondaryClubId, accountId } },
    });
    if (existing) {
      throw new BadRequestException(
        existing.status === MembershipStatus.PendingAdminApproval
          ? 'NDA already accepted; awaiting admin approval'
          : 'Membership request has already been reviewed',
      );
    }

    const clubMember = this.prisma.clubMembershipRequest.create({
      data: {
        accountId,
        secondaryClubId,
        ndaAccepted: true,
        status: MembershipStatus.PendingAdminApproval,
      },
    });

    return clubMember;
  }

  async getMyMembershipStatus(accountId: number, secondaryClubId: number) {
    const request = await this.prisma.clubMembershipRequest.findUnique({
      where: { secondaryClubId_accountId: { secondaryClubId, accountId } },
    });

    return {
      secondaryClubId,
      ndaAccepted: request?.ndaAccepted ?? false,
      status: request?.status ?? null,
      rejectionReason: request?.rejectionReason ?? null,
      approvedAt: request?.approvedAt ?? null,
    };
  }

  async getAll(options?: {
    secondaryClubId?: number;
    status?: MembershipStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const requestWhere: Prisma.ClubMembershipRequestWhereInput = {
      ...(options?.status && { status: options.status }),
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

    const clubWhere: Prisma.SecondaryClubsWhereInput = {
      ...(options?.secondaryClubId && { id: options.secondaryClubId }),
      clubMembershipRequests: { some: requestWhere },
    };

    const [count, clubs] = await Promise.all([
      this.prisma.secondaryClubs.count({ where: clubWhere }),
      this.prisma.secondaryClubs.findMany({
        where: clubWhere,
        select: { id: true, title: true, assetId: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const clubIds = clubs.map((club) => club.id);
    if (clubIds.length === 0) {
      return { count, skip: pagination.skip, take: pagination.take, data: [] };
    }

    const [requests, spvs, yesVotes] = await Promise.all([
      this.prisma.clubMembershipRequest.findMany({
        where: { ...requestWhere, secondaryClubId: { in: clubIds } },
        include: {
          account: {
            select: { id: true, firstname: true, lastname: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.spv.findMany({
        where: { secondaryClubId: { in: clubIds } },
        select: { id: true, secondaryClubId: true },
      }),
      this.prisma.vote.findMany({
        where: { secondaryClubId: { in: clubIds }, choice: VoteChoice.Yes },
        select: { secondaryClubId: true, accountId: true },
      }),
    ]);

    const yesVotersByClub = new Map<number, Set<number>>();
    yesVotes.forEach((vote) => {
      const existing =
        yesVotersByClub.get(vote.secondaryClubId) ?? new Set<number>();
      existing.add(vote.accountId);
      yesVotersByClub.set(vote.secondaryClubId, existing);
    });

    const requestsByClub = new Map<number, typeof requests>();
    requests.forEach((request) => {
      // Only surface members who voted Yes for this club.
      if (
        !yesVotersByClub.get(request.secondaryClubId)?.has(request.accountId)
      ) {
        return;
      }

      const existing = requestsByClub.get(request.secondaryClubId) ?? [];
      existing.push(request);
      requestsByClub.set(request.secondaryClubId, existing);
    });

    const spvByClub = new Map(spvs.map((spv) => [spv.secondaryClubId, spv.id]));

    const data = clubs.map((club) => ({
      id: club.id,
      title: club.title,
      assetId: club.assetId,
      spvCreated: spvByClub.has(club.id),
      spvId: spvByClub.get(club.id) ?? null,
      members: (requestsByClub.get(club.id) ?? []).map((request) => ({
        id: request.id,
        accountId: request.accountId,
        secondaryClubId: request.secondaryClubId,
        ndaAccepted: request.ndaAccepted,
        status: request.status,
        approvedBy: request.approvedBy,
        approvedAt: request.approvedAt,
        rejectionReason: request.rejectionReason,
        createdAt: request.createdAt,
        account: request.account,
      })),
    }));

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  async review(
    adminId: number,
    requestId: number,
    data: {
      status:
        | typeof MembershipStatus.Approved
        | typeof MembershipStatus.Rejected;
      rejectionReason?: string;
    },
  ) {
    const request = await this.prisma.clubMembershipRequest.findUnique({
      where: { id: requestId },
      include: {
        secondaryClub: {
          select: { assetId: true, asset: { select: { assetTitle: true } } },
        },
      },
    });
    if (!request) throw new NotFoundException('Membership request not found');

    if (request.status !== MembershipStatus.PendingAdminApproval) {
      throw new BadRequestException(
        'Only requests awaiting admin approval can be reviewed',
      );
    }

    if (data.status === MembershipStatus.Rejected && !data.rejectionReason) {
      throw new BadRequestException(
        'A rejection reason is required to reject a membership request',
      );
    }

    const updated = await this.prisma.clubMembershipRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        approvedBy: adminId,
        approvedAt:
          data.status === MembershipStatus.Approved ? new Date() : null,
        rejectionReason:
          data.status === MembershipStatus.Rejected
            ? data.rejectionReason
            : null,
      },
    });

    // Approval may complete SPV eligibility (vote + approved NDA) — a
    // no-op if the account hasn't voted Yes yet, or there's no SPV shell.
    if (data.status === MembershipStatus.Approved) {
      await this.spvService.syncMembership(
        request.secondaryClubId,
        request.accountId,
      );
      await this.notificationService._sendNotification({
        code: NotificationCode.ACCEPT_NDA,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: [request.accountId!],
        data: {
          assetId: request.secondaryClub.assetId,
          clubId: request.secondaryClubId,
          name: request.secondaryClub.asset?.assetTitle,
        },
      });
    }

    return updated;
  }
}
