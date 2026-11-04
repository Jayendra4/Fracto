import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { NotificationService } from '../notification';
import {
  NotificationAudience,
  NotificationCode,
  StorageService,
} from '@Common';
import {
  AccountType,
  AdminFractionalizationStatus,
  MembershipStatus,
  NotificationType,
  Prisma,
  SpvStatus,
  VoteChoice,
} from '../generated/prisma/client';

const VOTING_REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const ACCOUNT_SUMMARY_SELECT = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  mobile: true,
} satisfies Prisma.AccountSelect;
interface MemberInvestment {
  fractionUnits: number;
  totalPaidAmount: number;
  purchaseDate: Date | null;
}

@Injectable()
export class SpvService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly storageService: StorageService,
  ) {}

  private eligibleAccountWhere(
    secondaryClubId: number,
  ): Prisma.AccountWhereInput {
    return {
      votes: { some: { secondaryClubId, choice: VoteChoice.Yes } },
      clubMembershipRequests: {
        some: { secondaryClubId, status: MembershipStatus.Approved },
      },
    };
  }

  private async getEligibleAccountIds(
    secondaryClubId: number,
  ): Promise<Set<number>> {
    const eligible = await this.prisma.account.findMany({
      where: this.eligibleAccountWhere(secondaryClubId),
      select: { id: true },
    });

    return new Set(eligible.map((a) => a.id));
  }

  async getEligibleUsers(
    secondaryClubId: number,
    options?: { search?: string; skip?: number; take?: number },
  ) {
    const club = await this.prisma.secondaryClubs.findUnique({
      where: { id: secondaryClubId },
    });
    if (!club) throw new NotFoundException('Secondary club not found');

    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.AccountWhereInput = {
      ...this.eligibleAccountWhere(secondaryClubId),
      ...(options?.search && {
        OR: [
          { firstname: { contains: options.search, mode: 'insensitive' } },
          { lastname: { contains: options.search, mode: 'insensitive' } },
          { email: { contains: options.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [count, data] = await Promise.all([
      this.prisma.account.count({ where }),
      this.prisma.account.findMany({
        where,
        select: ACCOUNT_SUMMARY_SELECT,
        orderBy: { firstname: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  async create(
    adminId: number,
    data: { name: string; secondaryClubId: number; accountIds?: number[] },
  ) {
    const club = await this.prisma.secondaryClubs.findUnique({
      where: { id: data.secondaryClubId },
      select: {
        assetId: true,
        asset: {
          select: { assetTitle: true, accountId: true, tempGroupIds: true },
        },
      },
    });
    if (!club) throw new NotFoundException('Secondary club not found');

    const checkAsset = await this.prisma.rWARequest.findUnique({
      where: {
        assetId: club.assetId!,
      },
      select: {
        fractionalizationStatus: true,
      },
    });

    const redirectId = String(club.asset?.tempGroupIds?.[0]);
    if (
      checkAsset?.fractionalizationStatus !==
      AdminFractionalizationStatus.Completed
    ) {
      throw new BadRequestException(
        'The asset has not been fractionalized yet. Please fractionalize the asset first.',
        redirectId,
      );
    }
    const existingSpv = await this.prisma.spv.findFirst({
      where: { secondaryClubId: data.secondaryClubId },
    });
    if (existingSpv) {
      throw new BadRequestException(
        'An SPV already exists for this secondary club',
      );
    }

    const requestedAccountIds = [...new Set(data.accountIds ?? [])];

    if (requestedAccountIds.length > 0) {
      const eligibleAccountIds = await this.getEligibleAccountIds(
        data.secondaryClubId,
      );
      const ineligibleAccountIds = requestedAccountIds.filter(
        (id) => !eligibleAccountIds.has(id),
      );

      if (ineligibleAccountIds.length > 0) {
        throw new BadRequestException(
          `The following users are not eligible for this SPV (must have voted Yes and have an admin-approved NDA request): account ID(s) ${ineligibleAccountIds.join(', ')}`,
        );
      }
    }

    const createdSpv = await this.prisma.$transaction(async (tx) => {
      const spv = await tx.spv.create({
        data: {
          name: data.name,
          secondaryClubId: data.secondaryClubId,
          createdById: adminId,
        },
      });

      await tx.spvMember.createMany({
        data: requestedAccountIds.map((accountId) => ({
          spvId: spv.id,
          accountId,
        })),
      });

      return tx.spv.findUnique({
        where: { id: spv.id },
        include: {
          members: { include: { account: { select: ACCOUNT_SUMMARY_SELECT } } },
        },
      });
    });

    await this.notifySpvCreated(
      createdSpv!.id,
      data.name,
      club.asset?.assetTitle ?? '',
      club.asset!.accountId!,
      data.secondaryClubId,
      adminId,
    );

    return createdSpv;
  }

  // Notifies every eligible voter (voted Yes + approved club membership) of
  // the SPV's secondary club, plus all trustee accounts. Fired after the SPV
  // row is committed, not inside the create() transaction — a notification
  // fan-out failure shouldn't roll back a successfully created SPV.
  private async notifySpvCreated(
    spvId: number,
    spvName: string,
    assetTitle: string,
    accountId: number,
    secondaryClubId: number,
    actorId: number,
  ) {
    const [eligibleAccountIds, trustees] = await Promise.all([
      this.getEligibleAccountIds(secondaryClubId),
      this.prisma.account.findMany({
        where: { type: AccountType.Trustee },
        select: { id: true },
      }),
    ]);

    const notificationData = { spvId, spvName, assetTitle };

    if (eligibleAccountIds.size) {
      await this.notificationService._sendNotification({
        code: NotificationCode.SPV_CREATED,
        audience: NotificationAudience.USER,
        userIds: [accountId!, ...eligibleAccountIds],
        type: NotificationType.Informational,
        createdById: actorId,
        data: notificationData,
      });
    }

    if (trustees.length) {
      await this.notificationService._sendNotification({
        code: NotificationCode.SPV_CREATED_TRUSTEE,
        audience: trustees.length
          ? NotificationAudience.BOTH
          : NotificationAudience.ADMIN,
        userIds: trustees.map((t) => t.id),
        type: NotificationType.Informational,
        createdById: actorId,
        data: notificationData,
      });
    }
  }

  async getAll(options?: {
    search?: string;
    accountId?: number;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.SpvWhereInput = {
      ...(options?.search && {
        name: { contains: options.search, mode: 'insensitive' },
      }),
      ...(options?.accountId && {
        members: { some: { accountId: options.accountId } },
      }),
    };

    const [count, data] = await Promise.all([
      this.prisma.spv.count({ where }),
      this.prisma.spv.findMany({
        where,
        include: {
          secondaryClub: {
            select: {
              id: true,
              title: true,
              assetId: true,
              asset: { select: { status: true } },
            },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  async getById(id: number) {
    const spv = await this.prisma.spv.findUnique({
      where: { id },
      include: {
        secondaryClub: { select: { id: true, title: true } },
        members: { include: { account: { select: ACCOUNT_SUMMARY_SELECT } } },
      },
    });
    if (!spv) throw new NotFoundException('SPV not found');

    return spv;
  }

  async setStatus(id: number, status: SpvStatus) {
    const spv = await this.prisma.spv.findUnique({ where: { id } });
    if (!spv) throw new NotFoundException('SPV not found');

    return this.prisma.spv.update({
      where: { id },
      data: { status },
      include: {
        secondaryClub: { select: { id: true, title: true } },
        members: { include: { account: { select: ACCOUNT_SUMMARY_SELECT } } },
      },
    });
  }

  // Joins the account to the club's SPV once it has both voted Yes and has
  // an admin-approved club membership request. Called after either event
  // (vote cast, or membership request reviewed) so whichever completes
  // second triggers the join. A no-op if no SPV shell exists yet, or the
  // account isn't (yet) eligible — safe to call speculatively.
  async syncMembership(secondaryClubId: number, accountId: number) {
    const spv = await this.prisma.spv.findFirst({
      where: { secondaryClubId },
    });
    if (!spv) return null;

    const [vote, membershipRequest] = await Promise.all([
      this.prisma.vote.findUnique({
        where: { secondaryClubId_accountId: { secondaryClubId, accountId } },
      }),
      this.prisma.clubMembershipRequest.findUnique({
        where: { secondaryClubId_accountId: { secondaryClubId, accountId } },
      }),
    ]);

    const isEligible =
      vote?.choice === VoteChoice.Yes &&
      membershipRequest?.status === MembershipStatus.Approved;
    if (!isEligible) return null;

    return this.prisma.spvMember.upsert({
      where: { spvId_accountId: { spvId: spv.id, accountId } },
      update: {},
      create: { spvId: spv.id, accountId },
    });
  }

  async getAssetSpvMembers(ownerId: number, assetId: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    if (asset.accountId !== ownerId) {
      throw new ForbiddenException('You do not own this asset');
    }

    const spv = await this.prisma.spv.findFirst({
      where: { secondaryClub: { assetId } },
      include: {
        secondaryClub: { select: { id: true, title: true } },
        members: { include: { account: { select: ACCOUNT_SUMMARY_SELECT } } },
      },
    });
    if (!spv) throw new NotFoundException('No SPV found for this asset');

    const accountIds = spv.members.map((m) => m.accountId);
    const investments = await this.prisma.assetPurchase.groupBy({
      by: ['accountId'],
      where: { assetId, accountId: { in: accountIds } },
      _sum: { totalAmount: true, fractions: true },
    });
    const investmentByAccount = new Map(
      investments.map((i) => [
        i.accountId,
        {
          totalInvested: Number(i._sum.totalAmount ?? 0),
          fractions: i._sum.fractions ?? 0,
        },
      ]),
    );

    return {
      spvId: spv.id,
      name: spv.name,
      status: spv.status,
      secondaryClub: spv.secondaryClub,
      members: spv.members.map((m) => ({
        accountId: m.accountId,
        profile: m.account,
        joinedAt: m.createdAt,
        investment: investmentByAccount.get(m.accountId) ?? {
          totalInvested: 0,
          fractions: 0,
        },
      })),
    };
  }

  // Admin-facing: every asset that has an SPV, each with its member list
  // and per-member investment in that asset.
  async getAllAssetsWithSpvMembers(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    const where: Prisma.SpvWhereInput = {
      secondaryClub: { assetId: { not: null } },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          {
            secondaryClub: {
              asset: { assetTitle: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const [count, spvs] = await Promise.all([
      this.prisma.spv.count({ where }),
      this.prisma.spv.findMany({
        where,
        include: {
          secondaryClub: {
            select: {
              id: true,
              title: true,
              asset: { select: { id: true, assetTitle: true } },
            },
          },
          members: {
            include: { account: { select: ACCOUNT_SUMMARY_SELECT } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const assetIds = [
      ...new Set(
        spvs
          .map((spv) => spv.secondaryClub.asset?.id)
          .filter((id): id is number => id != null),
      ),
    ];
    const accountIds = [
      ...new Set(spvs.flatMap((spv) => spv.members.map((m) => m.accountId))),
    ];

    const investments =
      assetIds.length && accountIds.length
        ? await this.prisma.assetPurchase.groupBy({
            by: ['assetId', 'accountId'],
            where: { assetId: { in: assetIds }, accountId: { in: accountIds } },
            _sum: { totalAmount: true, fractions: true },
          })
        : [];

    const investmentByAssetAccount = new Map(
      investments.map((i) => [
        `${i.assetId}:${i.accountId}`,
        {
          totalInvested: Number(i._sum.totalAmount ?? 0),
          fractions: i._sum.fractions ?? 0,
        },
      ]),
    );

    const data = spvs
      .filter((spv) => spv.secondaryClub.asset)
      .map((spv) => {
        const asset = spv.secondaryClub.asset!;

        return {
          assetId: asset.id,
          assetTitle: asset.assetTitle,
          spvId: spv.id,
          spvName: spv.name,
          spvStatus: spv.status,
          secondaryClubId: spv.secondaryClub.id,
          members: spv.members.map((m) => ({
            accountId: m.accountId,
            profile: m.account,
            joinedAt: m.createdAt,
            investment: investmentByAssetAccount.get(
              `${asset.id}:${m.accountId}`,
            ) ?? { totalInvested: 0, fractions: 0 },
          })),
        };
      });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  // Owner-facing: lightweight list of the caller's assets that already have
  // an SPV, with just the asset name and SPV name/id (no member breakdown).
  async getMyAssetsWithSpv(
    accountId: number,
    options?: { search?: string; skip?: number; take?: number },
  ) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    const where: Prisma.SpvWhereInput = {
      secondaryClub: {
        assetId: { not: null },
        asset: { accountId },
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          {
            secondaryClub: {
              asset: { assetTitle: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const [count, spvs] = await Promise.all([
      this.prisma.spv.count({ where }),
      this.prisma.spv.findMany({
        where,
        select: {
          id: true,
          name: true,
          secondaryClub: {
            select: {
              asset: { select: { id: true, assetTitle: true } },
            },
          },
          members: {
            include: { account: { select: ACCOUNT_SUMMARY_SELECT } },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const data = spvs
      .filter((spv) => spv.secondaryClub.asset)
      .map((spv) => ({
        assetId: spv.secondaryClub.asset!.id,
        assetTitle: spv.secondaryClub.asset!.assetTitle,
        spvId: spv.id,
        spvName: spv.name,
        memberCount: spv._count.members,
        members: spv.members.map((m) => ({
          accountId: m.accountId,
          profile: m.account,
          joinedAt: m.createdAt,
        })),
      }));

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  // Sums an SPV's members' purchases of the SPV's linked asset in a single
  // query, keyed by accountId. `purchaseDate` is the member's first
  // purchase (allotment) of that asset.
  private async buildMemberInvestmentMap(
    assetId: number | null,
    accountIds: number[],
  ): Promise<Map<number, MemberInvestment>> {
    if (!assetId || accountIds.length === 0) return new Map();

    const purchases = await this.prisma.assetPurchase.groupBy({
      by: ['accountId'],
      where: { assetId, accountId: { in: accountIds } },
      _sum: { totalAmount: true, fractions: true },
      _min: { createdAt: true },
    });

    return new Map(
      purchases.map((purchase) => [
        purchase.accountId,
        {
          fractionUnits: purchase._sum.fractions ?? 0,
          totalPaidAmount: Number(purchase._sum.totalAmount ?? 0),
          purchaseDate: purchase._min.createdAt ?? null,
        },
      ]),
    );
  }

  // Admin/Trustee-facing "Shareholder Register": every eligible Asset
  // (visible + fractions fully sold) with the users who have given a
  // fraction-purchase consent decision on it (true or false) and their
  // investment in that asset. This is asset-consent driven, not SPV/vote
  // driven — an asset with no consent submissions yet still appears, just
  // with an empty `members` list.
  async getShareholderRegister(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    const where: Prisma.AssetWhereInput = {
      isVisible: true,
      ...(search && {
        assetTitle: { contains: search, mode: 'insensitive' },
      }),
    };

    const [count, assets] = await Promise.all([
      this.prisma.asset.count({ where }),
      this.prisma.asset.findMany({
        where,
        select: { id: true, assetTitle: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    if (assets.length === 0) {
      return { count, skip: pagination.skip, take: pagination.take, data: [] };
    }

    const assetIds = assets.map((asset) => asset.id);

    const consents = await this.prisma.fractionsConsent.findMany({
      where: { assetId: { in: assetIds } },
      orderBy: { createdAt: 'asc' },
      select: {
        assetId: true,
        accountId: true,
        buyerConsent: true,
        rejectionReason: true,
        account: { select: ACCOUNT_SUMMARY_SELECT },
      },
    });

    const accountIds = [...new Set(consents.map((c) => c.accountId))];

    const investments =
      accountIds.length > 0
        ? await this.prisma.assetPurchase.groupBy({
            by: ['assetId', 'accountId'],
            where: { assetId: { in: assetIds }, accountId: { in: accountIds } },
            _sum: { totalAmount: true, fractions: true },
            _min: { createdAt: true },
          })
        : [];

    const investmentMap = new Map(
      investments.map((investment) => [
        `${investment.assetId}:${investment.accountId}`,
        {
          fractionUnits: investment._sum.fractions ?? 0,
          totalPaidAmount: Number(investment._sum.totalAmount ?? 0),
          purchaseDate: investment._min.createdAt ?? null,
        } satisfies MemberInvestment,
      ]),
    );

    const consentsByAsset = new Map<number, typeof consents>();
    for (const consent of consents) {
      const forAsset = consentsByAsset.get(consent.assetId) ?? [];
      forAsset.push(consent);
      consentsByAsset.set(consent.assetId, forAsset);
    }

    const data = assets.map((asset) => {
      const assetConsents = consentsByAsset.get(asset.id) ?? [];

      return {
        assetId: asset.id,
        assetTitle: asset.assetTitle,
        totalMembersCount: assetConsents.length,
        members: assetConsents.map((consent) => {
          const investment = investmentMap.get(
            `${asset.id}:${consent.accountId}`,
          );

          return {
            accountId: consent.accountId,
            name: `${consent.account.firstname} ${consent.account.lastname}`.trim(),
            email: consent.account.email,
            mobile: consent.account.mobile,
            fractionUnits: investment?.fractionUnits ?? 0,
            totalPaidAmount: investment?.totalPaidAmount ?? 0,
            purchaseDate: investment?.purchaseDate ?? null,
            consent: consent.buyerConsent,
            reason: consent.rejectionReason,
          };
        }),
      };
    });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  // Independently paginated member browsing for a single SPV — `count`
  // reflects the full (search-filtered) membership, never the page size.
  async getSpvMembers(
    spvId: number,
    options?: { search?: string; skip?: number; take?: number },
  ) {
    const spv = await this.prisma.spv.findUnique({
      where: { id: spvId },
      select: {
        id: true,
        name: true,
        secondaryClub: { select: { assetId: true } },
      },
    });
    if (!spv) throw new NotFoundException('SPV not found');

    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    const where: Prisma.SpvMemberWhereInput = {
      spvId,
      ...(search && {
        account: {
          OR: [
            { firstname: { contains: search, mode: 'insensitive' } },
            { lastname: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { mobile: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [count, members] = await Promise.all([
      this.prisma.spvMember.count({ where }),
      this.prisma.spvMember.findMany({
        where,
        select: {
          accountId: true,
          account: { select: ACCOUNT_SUMMARY_SELECT },
        },
        orderBy: { createdAt: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const investmentMap = await this.buildMemberInvestmentMap(
      spv.secondaryClub.assetId,
      members.map((member) => member.accountId),
    );

    const data = members.map((member) => {
      const investment = investmentMap.get(member.accountId);

      return {
        accountId: member.accountId,
        name: `${member.account.firstname} ${member.account.lastname}`.trim(),
        email: member.account.email,
        mobile: member.account.mobile,
        fractionUnits: investment?.fractionUnits ?? 0,
        totalPaidAmount: investment?.totalPaidAmount ?? 0,
        purchaseDate: investment?.purchaseDate ?? null,
      };
    });

    return {
      spvId: spv.id,
      spvName: spv.name,
      count,
      skip: pagination.skip,
      take: pagination.take,
      data,
    };
  }

  // Admin/Trustee-facing voting overview: every SPV with its true member
  // pool (everyone who registered interest in the linked secondary club —
  // the same eligible-voter pool `sendVotingReminder` targets, not just
  // the subset who've already completed the join flow) and how many of
  // those have cast a vote, plus the linked asset's status and RWA status.
  async getVotingStatus(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    const where: Prisma.SpvWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          {
            secondaryClub: {
              asset: { assetTitle: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const [count, spvs] = await Promise.all([
      this.prisma.spv.count({ where }),
      this.prisma.spv.findMany({
        where,
        select: {
          id: true,
          name: true,
          status: true,
          secondaryClub: {
            select: {
              id: true,
              asset: {
                select: {
                  id: true,
                  assetTitle: true,
                  status: true,
                  rwaRequest: { select: { status: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    if (spvs.length === 0) {
      return { count, skip: pagination.skip, take: pagination.take, data: [] };
    }

    const clubIds = spvs.map((spv) => spv.secondaryClub.id);

    const [interestRows, votes] = await Promise.all([
      this.prisma.assetInterest.findMany({
        where: { secondaryClubId: { in: clubIds } },
        select: { secondaryClubId: true, accountId: true },
        distinct: ['secondaryClubId', 'accountId'],
      }),
      this.prisma.vote.findMany({
        where: { secondaryClubId: { in: clubIds } },
        select: { secondaryClubId: true, accountId: true },
      }),
    ]);

    const eligibleAccountsByClub = new Map<number, Set<number>>();
    for (const row of interestRows) {
      if (row.secondaryClubId == null) continue;
      const eligibleAccounts =
        eligibleAccountsByClub.get(row.secondaryClubId) ?? new Set<number>();
      eligibleAccounts.add(row.accountId);
      eligibleAccountsByClub.set(row.secondaryClubId, eligibleAccounts);
    }

    const votedAccountsByClub = new Map<number, Set<number>>();
    for (const vote of votes) {
      const votedAccounts =
        votedAccountsByClub.get(vote.secondaryClubId) ?? new Set<number>();
      votedAccounts.add(vote.accountId);
      votedAccountsByClub.set(vote.secondaryClubId, votedAccounts);
    }

    const data = spvs.map((spv) => {
      const eligibleAccounts =
        eligibleAccountsByClub.get(spv.secondaryClub.id) ?? new Set<number>();
      const votedAccounts =
        votedAccountsByClub.get(spv.secondaryClub.id) ?? new Set<number>();
      const totalMembers = eligibleAccounts.size;
      const votedMembers = [...eligibleAccounts].filter((accountId) =>
        votedAccounts.has(accountId),
      ).length;

      return {
        spvId: spv.id,
        spvName: spv.name,
        spvStatus: spv.status,
        secondaryClubId: spv.secondaryClub.id,
        assetId: spv.secondaryClub.asset?.id ?? null,
        assetTitle: spv.secondaryClub.asset?.assetTitle ?? null,
        totalMembers,
        votedMembers,
        notVotedMembers: totalMembers - votedMembers,
        assetStatus: spv.secondaryClub.asset?.status ?? null,
        rwaStatus: spv.secondaryClub.asset?.rwaRequest?.status ?? null,
      };
    });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  // Sends a voting reminder to every account that has joined the SPV's
  // secondary club (AssetInterest — the same eligible-voter pool
  // VoteService already uses) but hasn't cast its one-time club vote yet.
  // Note: existing SpvMember rows can never be non-voters here — membership
  // itself requires having already voted Yes (see `syncMembership`) — so
  // this targets people still mid-way through joining, not existing
  // shareholders.
  async sendVotingReminder(spvId: number, actorId: number) {
    const spv = await this.prisma.spv.findUnique({
      where: { id: spvId },
      select: {
        id: true,
        name: true,
        secondaryClubId: true,
        secondaryClub: {
          select: {
            startDate: true,
            endDate: true,
            asset: { select: { assetTitle: true } },
          },
        },
      },
    });
    if (!spv) throw new NotFoundException('SPV not found');

    const interestRows = await this.prisma.assetInterest.findMany({
      where: { secondaryClubId: spv.secondaryClubId },
      select: { accountId: true },
      distinct: ['accountId'],
    });
    const eligibleAccountIds = interestRows.map((row) => row.accountId);
    const totalEligibleMembers = eligibleAccountIds.length;

    if (totalEligibleMembers === 0) {
      return {
        spvId: spv.id,
        totalEligibleMembers: 0,
        alreadyVoted: 0,
        nonVoters: 0,
        notificationsSent: 0,
      };
    }

    const votedRows = await this.prisma.vote.findMany({
      where: {
        secondaryClubId: spv.secondaryClubId,
        accountId: { in: eligibleAccountIds },
      },
      select: { accountId: true },
    });
    const votedAccountIds = new Set(votedRows.map((row) => row.accountId));
    const alreadyVoted = votedAccountIds.size;

    const nonVoterIds = eligibleAccountIds.filter(
      (accountId) => !votedAccountIds.has(accountId),
    );

    if (nonVoterIds.length === 0) {
      return {
        spvId: spv.id,
        totalEligibleMembers,
        alreadyVoted,
        nonVoters: 0,
        notificationsSent: 0,
      };
    }

    // Skip anyone already reminded for this SPV within the cooldown window,
    // so re-triggering the endpoint doesn't spam members who were notified
    // minutes ago — while still reaching anyone newly eligible since then.
    const recentReminder = await this.prisma.notification.findFirst({
      where: {
        notificationCode: NotificationCode.SPV_VOTING_REMINDER,
        createdAt: { gte: new Date(Date.now() - VOTING_REMINDER_COOLDOWN_MS) },
        data: { path: ['spvId'], equals: spv.id },
      },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
    });

    let alreadyRemindedIds = new Set<number>();
    if (recentReminder) {
      const views = await this.prisma.notificationViews.findMany({
        where: {
          notificationId: recentReminder.id,
          userId: { in: nonVoterIds },
        },
        select: { userId: true },
      });
      alreadyRemindedIds = new Set(views.map((view) => view.userId));
    }

    const toNotifyIds = nonVoterIds.filter(
      (accountId) => !alreadyRemindedIds.has(accountId),
    );

    let notificationsSent = 0;
    if (toNotifyIds.length > 0) {
      const notification = await this.notificationService._sendNotification({
        code: NotificationCode.SPV_VOTING_REMINDER,
        audience: NotificationAudience.USER,
        userIds: toNotifyIds,
        type: NotificationType.Informational,
        createdById: actorId,
        data: {
          spvId: spv.id,
          spvName: spv.name,
          assetTitle: spv.secondaryClub.asset?.assetTitle ?? '',
        },
      });

      // `_sendNotification` only creates a NotificationViews row (i.e. an
      // actual in-app notification) for recipients with an active device
      // token — report the real count rather than assuming everyone in
      // toNotifyIds received one.
      notificationsSent = notification
        ? await this.prisma.notificationViews.count({
            where: { notificationId: notification.id },
          })
        : 0;
    }

    return {
      spvId: spv.id,
      totalEligibleMembers,
      alreadyVoted,
      nonVoters: nonVoterIds.length,
      notificationsSent,
    };
  }

  // Admin/Trustee-facing: every SPV with its (single, per current schema)
  // linked asset and that asset's documents — grouped as the screenshot's
  // SPV -> Asset -> Documents hierarchy.
  async getSpvAssetDocuments(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    const where: Prisma.SpvWhereInput = {
      secondaryClub: { assetId: { not: null } },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          {
            secondaryClub: {
              asset: { assetTitle: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const [count, spvs] = await Promise.all([
      this.prisma.spv.count({ where }),
      this.prisma.spv.findMany({
        where,
        select: {
          id: true,
          name: true,
          secondaryClub: {
            select: {
              asset: {
                select: {
                  id: true,
                  assetTitle: true,
                  documents: {
                    select: {
                      id: true,
                      documentType: true,
                      documentName: true,
                      documentUrl: true,
                      isVerified: true,
                      remark: true,
                      uploadedAt: true,
                    },
                    orderBy: { uploadedAt: 'desc' },
                    // take: SPV_ASSET_DOCUMENTS_PREVIEW,
                  },
                  _count: { select: { documents: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const data = spvs
      .filter((spv) => spv.secondaryClub.asset)
      .map((spv) => {
        const asset = spv.secondaryClub.asset!;

        return {
          spvId: spv.id,
          spvName: spv.name,
          // No distinct "SPV code" column exists in the schema — `name` is
          // the only stored identifier, so it's surfaced under both keys.
          spvCode: spv.name,
          assets: [
            {
              assetId: asset.id,
              assetTitle: asset.assetTitle,
              documentsCount: asset._count.documents,
              documents: asset.documents.map((doc) => ({
                documentId: doc.id,
                name: doc.documentName ?? doc.documentType,
                type: doc.documentType,
                url: this.storageService.resolveFileUrl(doc.documentUrl),
                isVerified: doc.isVerified,
                remark: doc.remark,
                uploadedAt: doc.uploadedAt,
              })),
            },
          ],
        };
      });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  // Independently paginated document browsing for a single SPV's asset —
  // for assets that accumulate enough documents that embedding them all in
  // `getSpvAssetDocuments` would be wasteful.
  async getSpvAssetDocumentsPage(
    spvId: number,
    assetId: number,
    options?: { skip?: number; take?: number },
  ) {
    const spv = await this.prisma.spv.findFirst({
      where: { id: spvId, secondaryClub: { assetId } },
      select: { id: true },
    });
    if (!spv) throw new NotFoundException('Asset not found under this SPV');

    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const [count, documents] = await Promise.all([
      this.prisma.assetDocument.count({ where: { assetId } }),
      this.prisma.assetDocument.findMany({
        where: { assetId },
        select: {
          id: true,
          documentType: true,
          documentName: true,
          documentUrl: true,
          isVerified: true,
          remark: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return {
      spvId,
      assetId,
      count,
      skip: pagination.skip,
      take: pagination.take,
      data: documents.map((doc) => ({
        documentId: doc.id,
        name: doc.documentName ?? doc.documentType,
        type: doc.documentType,
        url: this.storageService.resolveFileUrl(doc.documentUrl),
        isVerified: doc.isVerified,
        remark: doc.remark,
        uploadedAt: doc.uploadedAt,
      })),
    };
  }

  // Trustee-facing: every asset that has gone live, with its post-funding
  // lifecycle status — secondary club formed, fractionalization status, SPV
  // created, funded, secondary marketplace established.
  async listExitTracker(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    // "Gone live" = fractions are open for purchase — isVisible flips true
    // once fractionalization sets totalFractions (see AssetService).
    const where: Prisma.AssetWhereInput = {
      isVisible: true,
      ...(search && {
        assetTitle: { contains: search, mode: 'insensitive' },
      }),
    };

    const [count, assets] = await Promise.all([
      this.prisma.asset.count({ where }),
      this.prisma.asset.findMany({
        where,
        select: {
          id: true,
          assetTitle: true,
          status: true,
          isSoldOut: true,
          isMarketplace: true,
          meta: {
            where: { metaKey: 'marketValue' },
            select: { metaKey: true, metaValue: true },
          },
          rwaRequest: {
            select: {
              status: true,
              statusForDueDiligence: true,
              statusForLegal: true,
              statusForValuation: true,
              fractionalizationStatus: true,
            },
          },
          secondaryClub: {
            select: {
              id: true,
              endDate: true,
              spv: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    if (assets.length === 0) {
      return { count, skip: pagination.skip, take: pagination.take, data: [] };
    }

    // Same eligible-voter pool as `getVotingStatus` — everyone who
    // registered interest in the asset's secondary club, cross-referenced
    // against who has actually cast the club's (one-time) vote.
    const clubIds = assets
      .map((asset) => asset.secondaryClub?.id)
      .filter((id): id is number => id != null);

    const [interestRows, votes] = clubIds.length
      ? await Promise.all([
          this.prisma.assetInterest.findMany({
            where: { secondaryClubId: { in: clubIds } },
            select: { secondaryClubId: true, accountId: true },
            distinct: ['secondaryClubId', 'accountId'],
          }),
          this.prisma.vote.findMany({
            where: { secondaryClubId: { in: clubIds } },
            select: { secondaryClubId: true, accountId: true },
          }),
        ])
      : [[], []];

    const eligibleAccountsByClub = new Map<number, Set<number>>();
    for (const row of interestRows) {
      if (row.secondaryClubId == null) continue;
      const eligibleAccounts =
        eligibleAccountsByClub.get(row.secondaryClubId) ?? new Set<number>();
      eligibleAccounts.add(row.accountId);
      eligibleAccountsByClub.set(row.secondaryClubId, eligibleAccounts);
    }

    const votedAccountsByClub = new Map<number, Set<number>>();
    for (const vote of votes) {
      const votedAccounts =
        votedAccountsByClub.get(vote.secondaryClubId) ?? new Set<number>();
      votedAccounts.add(vote.accountId);
      votedAccountsByClub.set(vote.secondaryClubId, votedAccounts);
    }

    const data = assets.map((asset) => {
      // A club has at most one SPV, now enforced at the schema level too.
      const club = asset.secondaryClub ?? null;
      const spv = club?.spv ?? null;

      const marketValueMeta = asset.meta.find(
        (m) => m.metaKey === 'marketValue',
      )?.metaValue;
      const marketValue = marketValueMeta != null ? Number(marketValueMeta) : 0;

      const eligibleAccounts = club
        ? (eligibleAccountsByClub.get(club.id) ?? new Set<number>())
        : new Set<number>();
      const votedAccounts = club
        ? (votedAccountsByClub.get(club.id) ?? new Set<number>())
        : new Set<number>();
      const totalShareholders = eligibleAccounts.size;
      const votedShareholders = [...eligibleAccounts].filter((accountId) =>
        votedAccounts.has(accountId),
      ).length;

      return {
        assetId: asset.id,
        assetTitle: asset.assetTitle,
        marketValue,
        shareholderVote: club
          ? {
              totalShareholders,
              votedShareholders,
              notVotedShareholders: totalShareholders - votedShareholders,
              closesAt: club.endDate,
            }
          : null,
        status: {
          assetStatus: asset.status,
          status: asset.rwaRequest?.status,
          legalStatus: asset.rwaRequest?.statusForLegal,
          valuationStatus: asset.rwaRequest?.statusForValuation,
          dueDiligence: asset.rwaRequest?.statusForDueDiligence,
          hasSecondaryClub: !!club,
          secondaryClubId: club?.id ?? null,
          fractionalizationStatus:
            asset.rwaRequest?.fractionalizationStatus ?? null,
          hasSpv: !!spv,
          spvId: spv?.id ?? null,
          spvName: spv?.name ?? null,
          isFunded: asset.isSoldOut,
          hasSecondaryMarketplace: asset.isMarketplace,
        },
      };
    });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }
}
