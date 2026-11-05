import { appConfigFactory } from '@Config';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Asset, AssetOwnerInvite, Prisma } from '../generated/prisma/client';
import {
  AccountType,
  CommissionStatus,
  NotificationType,
  PayoutStatus,
  ReferralApprovalStatus,
  ReferralType,
  ReferralUsesType,
  WalletTransactionContext,
  WalletType,
} from '../generated/prisma/enums';
import { MailService } from '../mail';
import { PrismaService } from '../prisma';
import * as crypto from 'crypto';
import { ActivityService } from '../activity';
import {
  ActivityActorType,
  ActivityEntityType,
  ActivityType,
  ACTOR_TYPE_MAP,
} from '../activity/activity.types';
import {
  AdminNotificationCode,
  NotificationAudience,
  NotificationCode,
  UtilsService,
} from '@Common';
import { WalletsService } from '../wallets';
import { KycService } from '../kyc';
import { AccountsService } from '../accounts';
import { InviteAssetOwnerDto, reviewStatus } from './dto';
import { NotificationService } from '../notification';

@Injectable()
export class BrokerService {
  constructor(
    @Inject(appConfigFactory.KEY)
    private readonly appConfig: ConfigType<typeof appConfigFactory>,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly utilsService: UtilsService,
    private readonly walletsService: WalletsService,
    private readonly kycService: KycService,
    private readonly accountsService: AccountsService,
    private readonly notificationService: NotificationService,
  ) {}

  //   enum CommissionStatus {
  //   Pending        // created after purchase
  //   Requested      // broker requested payout
  //   Approved       // trustee approved
  //   Rejected       // rejected by admin/trustee
  //   Paid           // money transferred
  // }

  private generateReferralCode(prefix: string): string {
    const uniquePart = randomUUID()
      .replace(/-/g, '')
      .substring(0, 8)
      .toUpperCase();

    return `${prefix}-${uniquePart}`;
  }

  hashPropertyDetails(details: Record<string, any>): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(details))
      .digest('hex');
  }

  extractImportantPropertyDetails(payload: any): Record<string, any> {
    if (!payload?.basicInfo) {
      throw new Error('basicInfo is required in property payload');
    }

    if (!Array.isArray(payload?.meta)) {
      throw new Error('meta array is required in property payload');
    }

    const { assetType, assetTitle, ownershipModel } = payload.basicInfo;

    if (!assetType) {
      throw new Error('assetType is required');
    }

    if (!assetTitle || !assetTitle.trim()) {
      throw new Error('assetTitle is required');
    }

    if (!ownershipModel) {
      throw new Error('ownershipModel is required');
    }

    const metaMap = new Map(
      payload.meta.map((m: any) => [m.metaKey, m.metaValue]),
    );

    const requiredMetaKeys = [
      'city',
      'state',
      'country',
      'pincode',
      'landArea',
      'builtupArea',
      'marketValue',
    ];

    for (const key of requiredMetaKeys) {
      const value = metaMap.get(key);

      if (value === undefined || value === null || value === '') {
        throw new Error(`Property meta "${key}" is required`);
      }
    }

    return {
      assetType,
      assetTitle: assetTitle.trim(),
      ownershipModel,

      city: metaMap.get('city'),
      state: metaMap.get('state'),
      country: metaMap.get('country'),
      pincode: metaMap.get('pincode'),

      // geoLocation: metaMap.get('geoLocation'),

      landArea: metaMap.get('landArea'),
      builtupArea: metaMap.get('builtupArea'),

      marketValue: metaMap.get('marketValue'),
      // currency: metaMap.get('currency'),

      // ownershipEntityType: metaMap.get('ownershipEntityType'),
      // titleStatus: metaMap.get('titleStatus'),
    };
  }

  private buildReferralLink(assetId: number, code: string): string {
    return `${this.appConfig.appWebUrl}/property-details//${assetId}?ref=${code}`;
  }

  private buildAssetOwnerSignupLink(referralCode: string): string {
    return `${this.appConfig.appWebUrl}/signup?ref=${referralCode}&type=asset_owner`;
  }

  async getOrCreateAssetPromotionReferral(params: {
    brokerId: number;
    assetId: number;
  }) {
    const { brokerId, assetId } = params;

    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    const existingCampaign = await this.prisma.referralCampaign.findFirst({
      where: {
        ownerId: brokerId,
        isActive: true,
        referralType: ReferralType.Reference,
        usages: {
          some: {
            referralUsesType: ReferralUsesType.AssetPromotion,
            targetId: assetId,
          },
        },
      },
    });

    if (existingCampaign) {
      return {
        referralCode: existingCampaign.code,
        referralLink: this.buildReferralLink(assetId, existingCampaign.code),
        isExisting: true,
      };
    }

    const campaign = await this.prisma.$transaction(async (tx) => {
      const campaign = await tx.referralCampaign.create({
        data: {
          code: this.generateReferralCode('AST'), // ast asset reference
          ownerId: brokerId,
          referralType: ReferralType.Reference,
          isActive: true,
        },
      });

      await tx.referralUsage.create({
        data: {
          campaignId: campaign.id,
          referralUsesType: ReferralUsesType.AssetPromotion,
          targetId: assetId,
          rewardLimit: null, // unlimited commission
          referredUserId: brokerId,
        },
      });

      return campaign;
    });

    return {
      referralCode: campaign.code,
      referralLink: this.buildReferralLink(assetId, campaign.code),
      isExisting: false,
    };
  }

  async inviteAssetOwner(brokerId: number, data: InviteAssetOwnerDto) {
    const assetOwnerEmail = data.assetOwnerEmail.toLowerCase().trim();

    const assetOwner = await this.prisma.account.findUnique({
      where: { email: assetOwnerEmail },
    });

    const broker = await this.prisma.account.findUnique({
      where: { id: brokerId },
      select: { id: true, email: true, type: true },
    });
    if (!broker) {
      throw new Error('Broker not found');
    }

    if (broker.type !== AccountType.Broker) {
      throw new Error('Only broker can invite asset owner');
    }

    const asset = await this.prisma.asset.findUnique({
      where: { id: data.assetId },
      include: {
        meta: true,
        documents: true,
        price: true,
      },
    });

    const dbPropertyDetails = mapAssetToPropertyDetails(asset);

    const propertyDetails = {
      basicInfo: dbPropertyDetails,
    };

    const assetOwnerReferralCode =
      this.utilsService.generateReferralCode('AST');
    const invite = await this.prisma.$transaction(async (tx) => {
      const referral = await tx.referralCampaign.create({
        data: {
          code: assetOwnerReferralCode,
          ownerId: brokerId,
          referralType: ReferralType.AssetOwnerReferralCode,
          expiresAt: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days expiry
          ),
          isActive: assetOwner ? false : true,
        },
      });

      if (assetOwner) {
        const rewardLimit = this.accountsService.getRewardLimitByReferralType(
          ReferralUsesType.AssetRegistration,
        );

        await tx.referralUsage.create({
          data: {
            campaignId: referral.id,
            referredUserId: assetOwner.id,
            referralUsesType: ReferralUsesType.AssetRegistration,
            rewardLimit,
          },
        });
      }

      return tx.assetOwnerInvite.create({
        data: {
          assetId: data.assetId,
          campaignId: referral.id,
          brokerId,
          brokerEmail: broker.email,
          assetOwnerEmail,
          assetOwnerDetails: {
            firstName: data.firstName,
            lastName: data.lastName,
            mobile: data.mobile,
          },
          referralUsesType: assetOwner
            ? ReferralUsesType.AssetRegistration
            : ReferralUsesType.AssetOwnerSignup,
          proposedCommissionPct: data.proposedCommissionPct,
          brokerNote: data.brokerNote,
          propertyDetails: dbPropertyDetails,
          isAssetOnBording: true,
          assetOwnerId: assetOwner ? assetOwner.id : null,
        },
      });
    });

    await this.prisma.asset.update({
      where: { id: data.assetId },
      data: {
        ...(assetOwner && { accountId: assetOwner.id }),
        steps: '5',
      },
    });

    let signupLink;

    if (!assetOwner) {
      signupLink = this.buildAssetOwnerSignupLink(assetOwnerReferralCode);
    }

    this.sendInviteEmail({
      assetOwnerEmail,
      brokerEmail: broker.email,
      referralCode: assetOwnerReferralCode,
      proposedCommissionPct: data.proposedCommissionPct,
      brokerNote: data.brokerNote,
      propertyDetails: propertyDetails,
      signupLink: assetOwner ? undefined : signupLink,
    }).catch((err) => console.error('Asset owner invite mail failed', err));

    await this.activityService.createLog({
      type: ActivityType.REFERRAL_SENT,
      actorType: ActivityActorType.BROKER,
      actorId: brokerId,
      entityType: ActivityEntityType.REFERRAL,
      entityId: invite.id,
      targetId: brokerId,
      label: `Asset owner invitation has been successfully sent to ${assetOwnerEmail}.`,
      metadata: {
        message: `Asset owner invitation has been successfully sent to ${assetOwnerEmail}.`,
        email: assetOwnerEmail,
        referralCode: assetOwnerReferralCode,
      },
    });

    return {
      inviteId: invite.id,
      inviteLink: assetOwner ? null : signupLink,
      message: 'Asset owner invitation sent successfully',
    };
  }

  private async sendInviteEmail(data: {
    assetOwnerEmail: string;
    brokerEmail: string;
    referralCode: string;
    proposedCommissionPct: number;
    brokerNote?: string;
    propertyDetails: Record<string, any>;
    signupLink?: string;
  }): Promise<void> {
    await this.mailService.send({
      to: data.assetOwnerEmail,
      subject: 'Invitation to List Your Property on Fracto',
      mailBodyOrTemplate: {
        name: 'asset-owner-invite',
        data: {
          brokerEmail: data.brokerEmail,
          commissionPct: data.proposedCommissionPct,
          propertyDetails: data.propertyDetails,
          referralCode: data.referralCode,
          brokerNote: data.brokerNote,
          signupLink: data.signupLink!,
        },
      },
      replyTo: data.brokerEmail,
    });
  }

  async getAssetOwnerInvitesList(options?: {
    search?: string;
    skip?: number;
    take?: number;
    assetOwnerStatus?: ReferralApprovalStatus;
    adminStatus?: ReferralApprovalStatus;
    brokerId?: number;
    isAssetOnBording?: boolean;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: AssetOwnerInvite[];
  }> {
    const search = options?.search?.trim();
    const skip = options?.skip ?? 0;
    const take = options?.take ?? 10;

    const where: Prisma.AssetOwnerInviteWhereInput = {};

    if (options?.assetOwnerStatus) {
      where.assetOwnerStatus = options.assetOwnerStatus;
    }

    if (options?.adminStatus) {
      where.adminStatus = options.adminStatus;
    }

    if (options?.brokerId) {
      where.brokerId = options.brokerId;
    }

    if (options?.isAssetOnBording) {
      where.isAssetOnBording = options.isAssetOnBording;
    }

    if (search) {
      const parts = search.split(' ').filter(Boolean);

      where.AND = parts.map((part) => ({
        OR: [
          {
            brokerEmail: {
              contains: part,
              mode: 'insensitive',
            },
          },
          {
            assetOwnerEmail: {
              contains: part,
              mode: 'insensitive',
            },
          },
        ],
      }));
    }

    const [count, data] = await Promise.all([
      this.prisma.assetOwnerInvite.count({ where }),
      this.prisma.assetOwnerInvite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { campaign: true },
        skip,
        take,
      }),
    ]);

    return {
      count,
      skip,
      take,
      data,
    };
  }

  async getAssetsforOwnerApproval(
    ownerId: number,
    options?: {
      ownerStatus?: ReferralApprovalStatus;
      search?: string;
      skip?: number;
      take?: number;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: AssetOwnerInvite[];
  }> {
    const search = options?.search?.trim();
    const skip = options?.skip ?? 0;
    const take = options?.take ?? 10;

    const where: Prisma.AssetOwnerInviteWhereInput = {};

    if (search) {
      const parts = search.split(' ').filter(Boolean);

      where.AND = parts.map((part) => ({
        OR: [
          {
            brokerEmail: {
              contains: part,
              mode: 'insensitive',
            },
          },
          {
            assetOwnerEmail: {
              contains: part,
              mode: 'insensitive',
            },
          },
        ],
      }));
    }

    where.assetOwnerId = ownerId;

    if (options?.ownerStatus) {
      where.assetOwnerStatus = options.ownerStatus;
    }

    const finalWhere: Prisma.AssetOwnerInviteWhereInput = {
      ...where,
      asset: {
        isBrokerReferred: true,
      },
    };
    const [count, data] = await Promise.all([
      this.prisma.assetOwnerInvite.count({ where: finalWhere }),
      this.prisma.assetOwnerInvite.findMany({
        where: finalWhere,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { include: { meta: true, documents: true } },
          campaign: true,
        },
        skip,
        take,
      }),
    ]);

    return {
      count,
      skip,
      take,
      data,
    };
  }

  async getBrokerLeadsList(options?: {
    brokerId?: number;
    type: ReferralUsesType;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const search = options?.search?.trim();
    const skip = options?.skip ?? 0;
    const take = options?.take ?? 10;

    const where: Prisma.ReferralUsageWhereInput = {
      ...(options?.type && { referralUsesType: options.type }),
      ...(options?.brokerId && {
        campaign: { ownerId: options.brokerId },
      }),
    };

    if (search) {
      const parts = search.split(' ').filter(Boolean);
      where.AND = parts.map((part) => ({
        user: {
          OR: [
            { firstname: { contains: part, mode: 'insensitive' } },
            { lastname: { contains: part, mode: 'insensitive' } },
            { email: { contains: part, mode: 'insensitive' } },
          ],
        },
      }));
    }

    const [count, data] = await Promise.all([
      this.prisma.referralUsage.count({ where }),

      this.prisma.referralUsage.findMany({
        where,
        orderBy: { firstUsedAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          referralUsesType: true,
          usageCount: true,
          rewardLimit: true,
          isCompleted: true,
          firstUsedAt: true,
          updatedAt: true,

          campaign: {
            select: {
              code: true, // broker referral code
            },
          },

          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              mobile: true,
              type: true,
              companyKyc: {
                select: { overallStatus: true },
              },

              kyc: {
                select: {
                  status: true,
                },
              },

              referralCampaign: {
                select: {
                  code: true, // user's own referral code
                },
                take: 1,
              },

              assetOwnerInvite: true,
            },
          },
        },
      }),
    ]);

    const leads = data.map((usage) => ({
      id: usage.id,
      referralUsesType: usage.referralUsesType,
      usageCount: usage.usageCount,
      rewardLimit: usage.rewardLimit,
      isCompleted: usage.isCompleted,
      firstUsedAt: usage.firstUsedAt,
      updatedAt: usage.updatedAt,

      user: {
        id: usage.user.id,
        name: `${usage.user.firstname ?? ''} ${usage.user.lastname ?? ''}`.trim(),
        email: usage.user.email,
        mobile: usage.user.mobile,
        type: usage.user.type,
        kycStatus:
          usage.user.kyc?.status ??
          usage.user.companyKyc?.overallStatus ??
          null,
      },
      referredPropertyInvited: usage.user.assetOwnerInvite?.[0] ?? null,

      referredCode: usage.campaign.code,
      referralCode: usage.user.referralCampaign?.[0]?.code ?? null,
    }));

    return {
      count,
      skip,
      take,
      data: leads,
    };
  }

  async getBrokerLeadById(id: number) {
    const usage = await this.prisma.referralUsage.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        referralUsesType: true,
        usageCount: true,
        rewardLimit: true,
        isCompleted: true,
        firstUsedAt: true,
        updatedAt: true,

        campaign: {
          select: {
            code: true,
            owner: true,
          },
        },

        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
            type: true,
            referralCampaign: {
              where: {
                referralType: 'Plain',
              },
              select: {
                code: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!usage) {
      throw new Error('Lead not found');
    }

    const kyc = await this.kycService.getKycByAccountId(usage.user.id);

    return {
      id: usage.id,
      referralUsesType: usage.referralUsesType,
      usageCount: usage.usageCount,
      rewardLimit: usage.rewardLimit,
      isCompleted: usage.isCompleted,
      firstUsedAt: usage.firstUsedAt,
      updatedAt: usage.updatedAt,
      brokerReferralCode: usage.campaign.code,
      broker: usage.campaign.owner,
      user: {
        id: usage.user.id,
        name: `${usage.user.firstname ?? ''} ${usage.user.lastname ?? ''}`.trim(),
        email: usage.user.email,
        mobile: usage.user.mobile,
        type: usage.user.type,
        kyc,
        referralCode: usage.user.referralCampaign?.[0]?.code ?? null,
      },
    };
  }

  async approveCommissionByAdmin(
    assetOwnerInviteId: number,
    adminId: number,
    data: {
      status: reviewStatus;
      remarks?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const assetOwnerInvite = await tx.assetOwnerInvite.findUnique({
        where: { id: assetOwnerInviteId, adminStatus: 'Pending' },
      });

      if (!assetOwnerInvite) {
        throw new Error('Invite asset owner not found');
      }

      const invite = await tx.assetOwnerInvite.update({
        where: { id: assetOwnerInviteId },
        data: {
          adminStatus: data.status,
          remarks: data.remarks,
          finalCommissionPct: assetOwnerInvite.proposedCommissionPct,
          approvedAt: data.status === 'Approved' ? new Date() : null,
        },
      });

      if (data.status === 'Approved') {
        const holdCommissions = await tx.referralCommission.findMany({
          where: {
            assetId: invite.assetId,
            referralUsesType: ReferralUsesType.AssetOwnerSignup,
            status: CommissionStatus.Hold,
          },
        });

        for (const commission of holdCommissions) {
          await tx.referralCommission.update({
            where: { id: commission.id },
            data: { status: CommissionStatus.Pending },
          });

          await tx.commissionLedger.create({
            data: {
              commissionId: commission.id,
              fromStatus: CommissionStatus.Hold,
              toStatus: CommissionStatus.Pending,
              amount: commission.commissionAmount,
              reason: 'Admin approved commission – released from hold',
              metadata: {
                adminId,
                assetOwnerInviteId,
              },
            },
          });
        }
      }
      if (data.status === 'Approved') {
        try {
          await this.notificationService._sendNotification({
            code: NotificationCode.INFORM_TO_ASSET_OWNER_AND_BROKER,
            audience: NotificationAudience.USER,
            type: NotificationType.Informational,
            userIds: [
              assetOwnerInvite.brokerId!,
              assetOwnerInvite.assetOwnerId!,
            ],
            data: {
              assetId: assetOwnerInvite.assetId,
            },
          });
        } catch (notificationError) {
          console.error('Notification failed', notificationError);
        }
      } else {
        try {
          await this.notificationService._sendNotification({
            code: NotificationCode.REJECTED_COMMISSION,
            audience: NotificationAudience.USER,
            type: NotificationType.Informational,
            userIds: [
              assetOwnerInvite.brokerId!,
              assetOwnerInvite.assetOwnerId!,
            ],
            data: {
              assetId: assetOwnerInvite.assetId,
            },
          });
        } catch (notificationError) {
          console.error('Notification failed', notificationError);
        }
      }

      await this.activityService.createLog({
        type: ActivityType.COMMISSION_APPROVED_BY_ADMIN,
        actorType:
          ACTOR_TYPE_MAP[ActivityActorType.ADMIN] ?? ActivityActorType.SYSTEM,
        actorId: adminId,
        entityType: ActivityEntityType.ASSET,
        entityId: invite.id,
        targetId: adminId,
        label: 'Admin approved commission ptc for asset owner invite',
        metadata: {
          message: 'Admin approved commission ptc for asset owner invite',
        },
      });

      return invite;
    });
  }

  private async getTotalLockedCommission(brokerId: number) {
    const result = await this.prisma.referralCommission.aggregate({
      where: {
        ownerId: brokerId,
        status: CommissionStatus.Hold,
        campaign: {
          assetOwnerInvite: {
            some: {
              brokerId,
              adminStatus: {
                not: ReferralApprovalStatus.Approved,
              },
            },
          },
        },
      },
      _sum: {
        commissionAmount: true,
      },
    });

    return result._sum.commissionAmount ?? 0;
  }

  async getBrokerDashboard(brokerId: number) {
    const [
      totalLeads,
      activeLeads,
      assetsInProgress,
      commissionWallet,
      last7DaysCommission,
      lockedCommission,
      leadGainsCount,
      withdrawalProcessingAmount,
      commissionEarned,
      recentNotifications,
      recentReferrals,
    ] = await Promise.all([
      this.prisma.assetOwnerInvite.count({
        where: {
          brokerId,
        },
      }),

      // Active Leads
      this.prisma.assetOwnerInvite.count({
        where: {
          brokerId,
          assetOwnerStatus: 'Approved',
          isAssetOnBording: true,
          asset: {
            status: 'Available',
            isVisible: true,
          },
        },
      }),

      // Assets In Progress
      this.prisma.assetOwnerInvite.count({
        where: {
          brokerId,
          assetOwnerStatus: { in: ['Pending', 'Approved'] },
          asset: {
            status: 'Draft',
          },
        },
      }),

      this.prisma.wallet.findFirst({
        where: {
          accountId: brokerId,
          type: WalletType.Commission,
        },
        select: {
          amount: true,
        },
      }),

      this.prisma.referralCommission.aggregate({
        where: {
          ownerId: brokerId,
          status: CommissionStatus.Confirmed,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          commissionAmount: true,
        },
      }),

      this.getTotalLockedCommission(brokerId),

      // Lead Gains — every referral usage generated by this broker's
      // campaigns, across investor / asset-owner / asset-promotion types.
      this.prisma.referralUsage.count({
        where: { campaign: { ownerId: brokerId } },
      }),

      // Commission Withdrawal — requested but not yet approved/paid.
      this.getWithdrawRequestedAmount(brokerId),

      // Commission Earned — lifetime confirmed commissions.
      this.getTotalCommissionAmount(brokerId),

      this.notificationService.getNotifications(brokerId, { take: 5 }),

      // Action Center — latest asset referrals made on behalf of asset owners.
      this.prisma.assetOwnerInvite.findMany({
        where: { brokerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          assetOwnerStatus: true,
          assetOwnerDetails: true,
          createdAt: true,
          asset: { select: { assetTitle: true } },
          assetOwner: { select: { firstname: true, lastname: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalLeads,
        activeLeads,
        assetsInProgress,
      },
      earnings: {
        totalCommission: commissionWallet?.amount ?? 0,
        last7Days: last7DaysCommission._sum.commissionAmount ?? 0,
        lockedCommission,
      },
      leadGainsCount,
      withdrawalProcessingAmount: withdrawalProcessingAmount.toFixed(2),
      assetReferralCount: totalLeads,
      commissionEarned: commissionEarned.toFixed(2),
      recentActivity: recentNotifications.data.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.body,
        type: n.type,
        path: n.path,
        createdAt: n.createdAt,
        isRead: n.viewed,
      })),
      actionCenter: recentReferrals.map((r) => {
        const details = r.assetOwnerDetails as {
          firstName?: string;
          lastName?: string;
        } | null;
        const ownerName = r.assetOwner
          ? `${r.assetOwner.firstname} ${r.assetOwner.lastname}`.trim()
          : [details?.firstName, details?.lastName].filter(Boolean).join(' ') ||
            null;

        return {
          referralId: r.id,
          assetName: r.asset?.assetTitle ?? null,
          assetOwnerName: ownerName,
          status: r.assetOwnerStatus,
          createdAt: r.createdAt,
        };
      }),
    };
  }

  private isBlockedAssetOwner(invite: AssetOwnerInvite, asset: Asset) {
    return (
      invite.assetOwnerStatus !== 'Approved' ||
      !asset.isVerified ||
      invite.adminStatus !== 'Approved'
    );
  }

  async getAssetOwnerHoldAmount(brokerId: number) {
    const referralUsers = await this.prisma.referralUsage.findMany({
      where: {
        campaign: {
          ownerId: brokerId,
          assetOwnerInvite: {
            some: {
              assetOwnerStatus: 'Approved',
            },
          },
        },
        referralUsesType: 'AssetOwnerSignup',
      },
      include: {
        user: {
          include: {
            assetOwnerInvite: {
              include: {
                asset: {
                  include: { price: true },
                },
              },
            },
          },
        },
      },
    });

    let holdAmount = 0;

    for (const usage of referralUsers) {
      const user = usage.user;
      if (user.type !== 'AssetOwner') continue;

      for (const invite of user.assetOwnerInvite) {
        if (!invite.asset || !invite.asset.price) continue;
        if (!this.isBlockedAssetOwner(invite, invite.asset)) continue;

        const commissionPct = Number(
          invite.finalCommissionPct ?? invite.proposedCommissionPct,
        );

        const pricePerFraction =
          invite.asset.price.currentPricePerFraction.toNumber();

        const commission =
          invite.asset.totalFractions *
          pricePerFraction *
          (commissionPct / 100);

        holdAmount += commission;
      }
    }

    return holdAmount;
  }

  async getStoredCommissionAmounts(brokerId: number) {
    const grouped = await this.prisma.referralCommission.groupBy({
      by: ['status'],
      where: { ownerId: brokerId },
      _sum: { commissionAmount: true },
    });

    return {
      pendingAmount:
        grouped
          .find((g) => g.status === 'Pending')
          ?._sum.commissionAmount?.toNumber() ?? 0,

      paidAmount:
        grouped
          .find((g) => g.status === 'Paid')
          ?._sum.commissionAmount?.toNumber() ?? 0,
    };
  }

  async getEstimatedCommissionAmount(
    brokerId: number,
    filters?: { fromDate?: string; toDate?: string },
  ): Promise<Prisma.Decimal> {
    const createdAtFilter = this.buildDateFilter(filters);
    const invites = await this.prisma.assetOwnerInvite.findMany({
      where: {
        brokerId,
        assetOwnerStatus: 'Approved',
        adminStatus: {
          in: ['Approved', 'Pending'],
        },
        asset: {
          status: 'Available',
          isVisible: true,
          isSoldOut: false,
          price: { isNot: null },
        },
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      },
      select: {
        proposedCommissionPct: true,
        finalCommissionPct: true,
        asset: {
          select: {
            totalFractions: true,
            remainingFractions: true,
            price: {
              select: {
                currentPricePerFraction: true,
              },
            },
          },
        },
      },
    });

    let total = new Prisma.Decimal(0);

    for (const invite of invites) {
      if (!invite.asset?.price) continue;

      const pct = invite.finalCommissionPct ?? invite.proposedCommissionPct;

      const assetValue = new Prisma.Decimal(
        invite.asset.remainingFractions,
      ).mul(invite.asset.price.currentPricePerFraction);

      total = total.add(assetValue.mul(pct).div(100));
    }

    return total;
  }

  async getHoldCommissionAmount(
    brokerId: number,
    filters?: { fromDate?: string; toDate?: string },
  ): Promise<Prisma.Decimal> {
    const createdAtFilter = this.buildDateFilter(filters);
    const result = await this.prisma.referralCommission.aggregate({
      where: {
        ownerId: brokerId,
        status: CommissionStatus.Hold,
        referralUsesType: ReferralUsesType.AssetOwnerSignup,
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      },
      _sum: {
        commissionAmount: true,
      },
    });

    return result._sum.commissionAmount ?? new Prisma.Decimal(0);
  }

  async getWithdrawRequestedAmount(
    brokerId: number,
    filters?: { fromDate?: string; toDate?: string },
  ) {
    const createdAtFilter = this.buildDateFilter(filters);

    const result = await this.prisma.commissionPayoutRequest.aggregate({
      where: {
        brokerId,
        status: 'Pending',
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ?? new Prisma.Decimal(0);
  }

  async getPaidCommissionAmount(
    brokerId: number,
    filters?: { fromDate?: string; toDate?: string },
  ) {
    const createdAtFilter = this.buildDateFilter(filters);
    const result = await this.prisma.commissionPayoutRequest.aggregate({
      where: {
        brokerId,
        status: 'Approved',
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ?? new Prisma.Decimal(0);
  }

  private buildDateFilter(filters?: {
    fromDate?: string;
    toDate?: string;
  }): Prisma.DateTimeFilter | undefined {
    if (!filters) return undefined;

    const { fromDate, toDate } = filters;

    if (!fromDate && !toDate) {
      return undefined;
    }

    const createdAt: Prisma.DateTimeFilter = {};

    if (fromDate) {
      createdAt.gte = new Date(fromDate);
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      createdAt.lte = endDate;
    }

    return createdAt;
  }

  async getTotalCommissionAmount(
    brokerId: number,
    filters?: { fromDate?: string; toDate?: string },
  ) {
    const createdAtFilter = this.buildDateFilter(filters);
    const result = await this.prisma.referralCommission.aggregate({
      where: {
        ownerId: brokerId,
        status: 'Confirmed',
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      },
      _sum: {
        commissionAmount: true,
      },
    });

    return result._sum.commissionAmount ?? new Prisma.Decimal(0);
  }

  async getBrokerCommissionSummary(
    brokerId: number,
    filters?: { fromDate?: string; toDate?: string },
  ) {
    const [
      estimatedAmount,
      holdAmount,
      totalAmount,
      pendingWithdraw,
      releasedAmount,
    ] = await Promise.all([
      this.getEstimatedCommissionAmount(brokerId, filters),
      this.getHoldCommissionAmount(brokerId, filters),
      this.getTotalCommissionAmount(brokerId, filters),
      this.getWithdrawRequestedAmount(brokerId, filters),
      this.getPaidCommissionAmount(brokerId, filters),
    ]);

    const availableToWithdraw = totalAmount.minus(releasedAmount);

    return {
      estimatedAmount: estimatedAmount.toFixed(2),
      holdAmount: holdAmount.toFixed(2),
      // releasedAmount: releasedAmount.toFixed(2),
      pendingWithdraw: pendingWithdraw.toFixed(2),
      releasedAmount: releasedAmount.toFixed(2),
      availableToWithdraw: Prisma.Decimal.max(
        availableToWithdraw,
        new Prisma.Decimal(0),
      ).toFixed(2),
    };
  }

  async getBrokerCommissionHistory(options: {
    brokerId?: number;
    type?: ReferralUsesType;
    status?: CommissionStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const { brokerId, type, status, search, skip = 0, take = 10 } = options;

    const trimmedSearch = search?.trim();

    const where: Prisma.ReferralCommissionWhereInput = {
      ...(brokerId && { ownerId: brokerId }),
      ...(status && { status }),
      ...(type && { referralUsesType: type }),
    };

    if (trimmedSearch) {
      const parts = trimmedSearch.split(' ').filter(Boolean);

      where.AND = parts.map((part) => ({
        OR: [
          {
            campaign: {
              code: { contains: part, mode: 'insensitive' },
            },
          },
          {
            referredUser: {
              OR: [
                { firstname: { contains: part, mode: 'insensitive' } },
                { lastname: { contains: part, mode: 'insensitive' } },
                { email: { contains: part, mode: 'insensitive' } },
              ],
            },
          },
          {
            asset: {
              assetTitle: { contains: part, mode: 'insensitive' },
            },
          },
        ],
      }));
    }

    const [count, rows] = await Promise.all([
      this.prisma.referralCommission.count({ where }),
      this.prisma.referralCommission.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            select: { code: true },
          },
          referredUser: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
          asset: {
            select: {
              id: true,
              assetTitle: true,
            },
          },
        },
      }),
    ]);

    const data = rows.map((commission) => ({
      commissionId: commission.id,
      status: commission.status,
      referralUsesType: commission.referralUsesType,
      baseAmount: commission.baseAmount,
      commissionPct: commission.commissionPct,
      commissionAmount: commission.commissionAmount,
      createdAt: commission.createdAt,

      campaignCode: commission.campaign?.code ?? null,

      investor: commission.referredUser
        ? {
            id: commission.referredUser.id,
            name: `${commission.referredUser.firstname ?? ''} ${
              commission.referredUser.lastname ?? ''
            }`.trim(),
            email: commission.referredUser.email,
          }
        : null,

      asset: commission.asset
        ? {
            id: commission.asset.id,
            title: commission.asset.assetTitle,
          }
        : null,
    }));

    return {
      count,
      skip,
      take,
      data,
    };
  }

  private async calculateAssetCommissionAmounts(data: {
    brokerId: number;
    assetId: number;
  }): Promise<{
    estimatedAmount: Prisma.Decimal;
    holdAmount: Prisma.Decimal;
    earnedAmount: Prisma.Decimal;
  }> {
    const { brokerId, assetId } = data;

    const [
      invite,
      holdAggregate,
      confirmedAggregate,
      totalConfirmedAllAssetsAggregate,
      payoutAggregate,
    ] = await this.prisma.$transaction([
      this.prisma.assetOwnerInvite.findFirst({
        where: {
          brokerId,
          assetId,
          assetOwnerStatus: ReferralApprovalStatus.Approved,
          asset: { price: { isNot: null } },
        },
        select: {
          proposedCommissionPct: true,
          finalCommissionPct: true,
          asset: {
            select: {
              remainingFractions: true,
              price: {
                select: {
                  currentPricePerFraction: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.referralCommission.aggregate({
        where: {
          ownerId: brokerId,
          assetId,
          status: CommissionStatus.Hold,
          referralUsesType: ReferralUsesType.AssetOwnerSignup,
        },
        _sum: { commissionAmount: true },
      }),

      this.prisma.referralCommission.aggregate({
        where: {
          ownerId: brokerId,
          assetId,
          status: CommissionStatus.Confirmed,
        },
        _sum: { commissionAmount: true },
      }),

      this.prisma.referralCommission.aggregate({
        where: {
          ownerId: brokerId,
          status: CommissionStatus.Confirmed,
        },
        _sum: { commissionAmount: true },
      }),

      this.prisma.commissionPayoutRequest.aggregate({
        where: {
          brokerId,
          status: 'Approved',
        },
        _sum: { amount: true },
      }),
    ]);

    let estimatedAmount = new Prisma.Decimal(0);

    if (invite?.asset?.price) {
      const commissionPct =
        invite.finalCommissionPct ?? invite.proposedCommissionPct;

      if (commissionPct?.gt(0)) {
        const totalAssetValue = new Prisma.Decimal(
          invite.asset.remainingFractions,
        ).mul(invite.asset.price.currentPricePerFraction);

        estimatedAmount = totalAssetValue.mul(commissionPct).div(100);
      }
    }

    const holdAmount =
      holdAggregate._sum.commissionAmount ?? new Prisma.Decimal(0);
    const totalConfirmed =
      confirmedAggregate._sum.commissionAmount ?? new Prisma.Decimal(0);
    const totalConfirmedAllAssets =
      totalConfirmedAllAssetsAggregate._sum.commissionAmount ??
      new Prisma.Decimal(0);

    const releasedAmount = payoutAggregate._sum.amount ?? new Prisma.Decimal(0);
    const assetReleasedAmount = totalConfirmedAllAssets.gt(0)
      ? releasedAmount.mul(totalConfirmed).div(totalConfirmedAllAssets)
      : new Prisma.Decimal(0);
    const earnedAmount = totalConfirmed.minus(assetReleasedAmount);

    return {
      estimatedAmount,
      holdAmount,
      earnedAmount,
    };
  }

  async getBrokerCommissionById(data: { commissionId: number }) {
    const { commissionId } = data;

    const commission = await this.prisma.referralCommission.findUnique({
      where: {
        id: commissionId,
      },
      include: {
        campaign: {
          select: {
            code: true,
          },
        },
        referredUser: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            referralCampaign: {
              where: {
                referralType: 'Plain',
              },
              take: 1,
            },
          },
        },
        asset: {
          select: {
            id: true,
            assetTitle: true,
          },
        },
      },
    });

    if (!commission) {
      throw new Error('Commission record not found');
    }

    const amounts = commission.assetId
      ? await this.calculateAssetCommissionAmounts({
          brokerId: commission.ownerId,
          assetId: commission.assetId,
        })
      : {
          estimatedAmount: new Prisma.Decimal(0),
          holdAmount: new Prisma.Decimal(0),
          earnedAmount: new Prisma.Decimal(0),
        };

    return {
      commissionId: commission.id,
      status: commission.status,
      referralUsesType: commission.referralUsesType,

      baseAmount: commission.baseAmount,
      commissionPct: commission.commissionPct,
      commissionAmount: commission.commissionAmount,
      createdAt: commission.createdAt,
      referredCode: commission.campaign?.code ?? null,
      investor: commission.referredUser
        ? {
            id: commission.referredUser.id,
            name: `${commission.referredUser.firstname ?? ''} ${
              commission.referredUser.lastname ?? ''
            }`.trim(),
            email: commission.referredUser.email,
            referralCode: commission.referredUser.referralCampaign[0].code,
          }
        : null,

      asset: commission.asset
        ? {
            id: commission.asset.id,
            title: commission.asset.assetTitle,
          }
        : null,

      amounts: {
        estimatedAmount: amounts.estimatedAmount.toFixed(2),
        holdAmount: amounts.holdAmount.toFixed(2),
        earnedAmount: amounts.earnedAmount.toFixed(2),
      },
    };
  }

  async createCommissionContract(data: {
    brokerId: number;
    assetId: number;
    proposedCommissionPct: number;
    brokerNote?: string;
  }) {
    const { brokerId, assetId, proposedCommissionPct } = data;
    if (proposedCommissionPct <= 0 || proposedCommissionPct > 10) {
      throw new Error('Commission must be between 0 and 10%');
    }
    const commissionDecimal = new Prisma.Decimal(
      proposedCommissionPct.toFixed(2),
    );

    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true, accountId: true },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    const existing = await this.prisma.assetBrokerCommissionContract.findFirst({
      where: { assetId },
    });

    if (existing) {
      throw new Error('Commission contract already exists for this asset');
    }

    return this.prisma.assetBrokerCommissionContract.create({
      data: {
        brokerId,
        assetOwnerId: asset.accountId!,
        assetId,
        proposedCommissionPct: commissionDecimal,
        brokerNote: data.brokerNote,
      },
    });
  }

  async reviewContractByAssetOwner(
    contractId: number,
    assetOwnerId: number,
    status: ReferralApprovalStatus,
    assetOwnerNote?: string,
  ) {
    const contract = await this.prisma.assetBrokerCommissionContract.findUnique(
      {
        where: { id: contractId },
        include: {
          asset: true,
        },
      },
    );

    if (!contract) throw new Error('Contract not found');

    if (contract.asset.accountId !== assetOwnerId) {
      throw new Error('Not allowed');
    }

    if (contract.status !== 'Pending') {
      throw new Error('Contract already processed');
    }

    return this.prisma.assetBrokerCommissionContract.update({
      where: { id: contractId },
      data: {
        status,
        finalCommissionPct: contract.proposedCommissionPct,
        assetOwnerNote,
        approvedAt: new Date(),
      },
    });
  }

  async adminReviewCommissionContract(
    contractId: number,
    status: ReferralApprovalStatus,
  ) {
    const contract = await this.prisma.assetBrokerCommissionContract.findUnique(
      {
        where: { id: contractId },
      },
    );

    if (!contract) throw new Error('Contract not found');

    if (contract.status !== 'Approved') {
      throw new Error('Asset owner approval required');
    }

    if (!contract.finalCommissionPct) {
      throw new Error('Final commission missing');
    }

    return this.prisma.assetBrokerCommissionContract.update({
      where: { id: contractId },
      data: {
        adminStatus: status,
      },
    });
  }

  async requestCommissionPayout(brokerId: number, amount: Prisma.Decimal) {
    if (amount.lte(0)) {
      throw new Error('Invalid payout amount');
    }

    const commissionRequest = await this.prisma.$transaction(async (tx) => {
      const wallet = await this.walletsService.getWalletByAccountId(
        brokerId,
        WalletType.Commission,
        { tx },
      );

      const pendingSum = await tx.commissionPayoutRequest.aggregate({
        where: {
          brokerId,
          status: PayoutStatus.Pending,
        },
        _sum: {
          amount: true,
        },
      });

      const alreadyRequested = pendingSum._sum.amount ?? new Prisma.Decimal(0);
      const totalAfterRequest = alreadyRequested.add(amount);
      if (totalAfterRequest.gt(wallet.amount)) {
        throw new Error(
          `Insufficient commission balance. Available: ${wallet.amount.minus(
            alreadyRequested,
          )}`,
        );
      }

      return await tx.commissionPayoutRequest.create({
        data: {
          brokerId,
          amount,
          status: PayoutStatus.Pending,
        },
      });
    });

    await this.activityService.createLog({
      type: ActivityType.PAYOUT_REQUESTED,
      actorType: ActivityActorType.BROKER,
      actorId: brokerId,
      entityType: ActivityEntityType.COMMISSION,
      entityId: commissionRequest.id,
      targetId: brokerId,
      label: 'Broker requested commission payout',
      metadata: {
        amount: amount.toString(),
        status: PayoutStatus.Pending,
      },
    });

    await this.notificationService._sendNotification({
      code: AdminNotificationCode.PAYOUT_REQUESTED,
      audience: NotificationAudience.ADMIN,
      type: NotificationType.Transactional,
    });

    return commissionRequest;
  }

  async reviewCommissionPayout(data: {
    requestId: number;
    reviewerId: number;
    status: reviewStatus;
    remarks?: string;
  }) {
    const { requestId, reviewerId, status, remarks } = data;

    await this.prisma.$transaction(async (tx) => {
      const request = await tx.commissionPayoutRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error('Payout request not found');
      }

      if (request.status !== PayoutStatus.Pending) {
        throw new Error('Payout request already processed');
      }

      // Rejected flow
      if (status === PayoutStatus.Rejected) {
        const updatedRequest = await tx.commissionPayoutRequest.update({
          where: { id: requestId },
          data: {
            status: PayoutStatus.Rejected,
            reviewedById: reviewerId,
            remarks,
          },
        });

        await this.activityService.createLog(
          {
            type: ActivityType.COMMISSION_PAYOUT_REJECTED,
            actorType: ActivityActorType.ADMIN,
            actorId: reviewerId,

            entityType: ActivityEntityType.COMMISSION_PAYOUT,
            entityId: updatedRequest.id,

            targetId: request.brokerId,
            label: `Commission payout request #${request.id} for ₹${request.amount.toString()} was rejected.`,
            metadata: {
              amount: request.amount.toString(),
              brokerId: request.brokerId,
              remarks,
            },
          },
          { tx },
        );

        await this.notificationService._sendNotification({
          code: NotificationCode.PAYOUT_REQUEST_REJECTED,
          audience: NotificationAudience.USER,
          type: NotificationType.Informational,
          userIds: [request.brokerId],
        });

        return;
      }

      // Approved flow
      if (status === PayoutStatus.Approved) {
        // Transfer commission wallet → main wallet
        await this.walletsService.transfer(
          request.brokerId,
          WalletType.Commission,
          WalletType.Main,
          request.amount,
          {
            tx,
            context: WalletTransactionContext.CommissionPayout,
            entityId: BigInt(request.id),
          },
        );

        // Mark payout request as paid
        const updatedRequest = await tx.commissionPayoutRequest.update({
          where: { id: requestId },
          data: {
            status: PayoutStatus.Approved,
            reviewedById: reviewerId,
            remarks,
          },
        });
        await this.activityService.createLog(
          {
            type: ActivityType.COMMISSION_PAYOUT_APPROVED,
            actorType: ActivityActorType.ADMIN,
            actorId: reviewerId,

            entityType: ActivityEntityType.COMMISSION_PAYOUT,
            entityId: updatedRequest.id,

            targetId: request.brokerId,
            label: `Commission payout request #${updatedRequest.id} for ₹${request.amount.toString()} was approved and processed successfully.`,
            metadata: {
              amount: request.amount.toString(),
              brokerId: request.brokerId,
              remarks,
            },
          },
          { tx },
        );

        await this.notificationService._sendNotification({
          code: NotificationCode.PAYOUT_REQUEST_APPROVED,
          audience: NotificationAudience.USER,
          type: NotificationType.Informational,
          userIds: [request.brokerId],
        });
      }
    });
  }

  async getCommissionPayoutRequests(options?: {
    brokerId?: number;
    status?: reviewStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const search = options?.search?.trim();
    const skip = options?.skip ?? 0;
    const take = options?.take ?? 10;

    const where: Prisma.CommissionPayoutRequestWhereInput = {
      ...(options?.brokerId && { brokerId: options.brokerId }),
      ...(options?.status && { status: options.status }),
    };

    if (search) {
      const parts = search.split(' ').filter(Boolean);

      where.AND = parts.map((part) => ({
        broker: {
          OR: [
            { firstname: { contains: part, mode: 'insensitive' } },
            { lastname: { contains: part, mode: 'insensitive' } },
            { email: { contains: part, mode: 'insensitive' } },
            { mobile: { contains: part, mode: 'insensitive' } },
          ],
        },
      }));
    }

    const [count, data] = await this.prisma.$transaction([
      this.prisma.commissionPayoutRequest.count({ where }),

      this.prisma.commissionPayoutRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          amount: true,
          status: true,
          remarks: true,
          createdAt: true,
          updatedAt: true,

          broker: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              mobile: true,
              type: true,
            },
          },
        },
      }),
    ]);

    return {
      count,
      skip,
      take,
      data: data.map((item) => ({
        id: item.id,
        amount: item.amount.toFixed(2),
        status: item.status,
        remarks: item.remarks,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,

        broker: {
          id: item.broker.id,
          name: `${item.broker.firstname ?? ''} ${item.broker.lastname ?? ''}`.trim(),
          email: item.broker.email,
          mobile: item.broker.mobile,
          type: item.broker.type,
        },
      })),
    };
  }

  private getHoldReasons(invite: {
    adminStatus: ReferralApprovalStatus;
    assetOwnerStatus: ReferralApprovalStatus;
    isAssetOnBording: boolean;
    remarks?: string | null;
  }) {
    const reasons: string[] = [];
    if (invite.adminStatus !== ReferralApprovalStatus.Approved) {
      reasons.push('Admin commission approval pending');
    }

    if (invite.assetOwnerStatus !== ReferralApprovalStatus.Approved) {
      reasons.push('Asset owner verification pending');
    }

    if (!invite.isAssetOnBording) {
      reasons.push('Asset onboarding not completed');
    }

    if (invite.remarks) {
      reasons.push(invite.remarks);
    }

    return reasons;
  }

  async getCommissionLocks(brokerId: number) {
    // Fetch pending commissions where admin not approved
    const commissions = await this.prisma.referralCommission.findMany({
      where: {
        ownerId: brokerId,
        status: CommissionStatus.Hold,
        campaign: {
          assetOwnerInvite: {
            some: {
              brokerId,
              adminStatus: {
                not: ReferralApprovalStatus.Approved,
              },
            },
          },
        },
      },
      select: {
        assetId: true,
        commissionAmount: true,
        asset: {
          select: {
            id: true,
            assetTitle: true,
          },
        },
        campaign: {
          select: {
            assetOwnerInvite: {
              where: { brokerId },
              select: {
                adminStatus: true,
                assetOwnerStatus: true,
                isAssetOnBording: true,
                remarks: true,
              },
            },
          },
        },
      },
    });

    // Aggregate by asset
    const map = new Map<number, any>();

    for (const row of commissions) {
      const assetId = row.assetId!;
      const invite = row.campaign.assetOwnerInvite[0];
      if (!map.has(assetId)) {
        map.set(assetId, {
          assetId,
          assetName: row.asset?.assetTitle ?? 'Unknown Asset',
          lockedAmount: 0,
          reasons: this.getHoldReasons(invite),
        });
      }

      map.get(assetId).lockedAmount += Number(row.commissionAmount);
    }

    const lockedProperties = Array.from(map.values());

    const totalLockedAmount = lockedProperties.reduce(
      (sum, p) => sum + p.lockedAmount,
      0,
    );

    return {
      totalLockedAmount,
      properties: lockedProperties,
    };
  }
}
function mapAssetToPropertyDetails(asset: any) {
  const metaObject = Object.fromEntries(
    (asset.meta || []).map((m: any) => [m.metaKey, m.metaValue]),
  );

  return {
    city: metaObject.city,
    state: metaObject.state,
    country: metaObject.country,
    pincode: metaObject.pincode,
    landArea: metaObject.landArea,
    builtupArea: metaObject.builtupArea,
    marketValue: metaObject.marketValue,

    assetType: asset.assetType,
    assetTitle: asset.assetTitle,
    ownershipModel: asset.ownershipModel,
  };
}
