import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  WalletType,
  WalletTransactionContext,
  NotificationType,
  CommissionStatus,
  ReferralUsesType,
  ReferralApprovalStatus,
  AssetStatus,
  KycStatus,
  AccountType,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma';
import { WalletsService } from '../wallets';
import { Prisma, ReferralCampaign } from '../generated/prisma/client';
import { NotificationService } from '../notification';
import {
  NotificationAudience,
  NotificationCode,
  StorageService,
} from '@Common';
import { BrokerCommissionConfigFactory } from '@Config';
import { ConfigType } from '@nestjs/config';
import { CouponService } from '../coupon';
import {
  ActivityActorType,
  ActivityEntityType,
  ActivityService,
  ActivityType,
  ACTOR_TYPE_MAP,
} from '../activity';
import { AssetFinancialCalculator } from '../asset/asset-financial';
import { AssetsService } from '../asset/asset.service';

@Injectable()
export class AssetPurchaseService {
  constructor(
    @Inject(BrokerCommissionConfigFactory.KEY)
    private readonly BrokerCommissionConfig: ConfigType<
      typeof BrokerCommissionConfigFactory
    >,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly walletsService: WalletsService,
    private readonly couponService: CouponService,
    private readonly activityService: ActivityService,
    private readonly assetFinancialCalculator: AssetFinancialCalculator,
    private readonly assetsService: AssetsService,
    private readonly storageService: StorageService,
  ) {}

  private async createCommission(
    tx: Prisma.TransactionClient,
    params: {
      campaign: ReferralCampaign;
      purchaseId: number;
      assetId: number;
      referredUserId?: number;
      purchaseAmount: Prisma.Decimal;
      referralUsesType: ReferralUsesType;
      commissionPct: Prisma.Decimal;
      status: CommissionStatus;
      reason: string;
    },
  ): Promise<Prisma.Decimal> {
    const {
      campaign,
      purchaseId,
      assetId,
      purchaseAmount,
      referralUsesType,
      referredUserId,
      commissionPct,
      status,
      reason,
    } = params;

    if (!commissionPct) {
      throw new Error('commissionPct is required');
    }
    const commissionAmount = purchaseAmount.mul(commissionPct).div(100).toDP(2);

    const commission = await tx.referralCommission.create({
      data: {
        campaignId: campaign.id, // who will got the commission
        ownerId: campaign.ownerId, // // who will got the commission
        transactionId: purchaseId,
        referredUserId, // who will purchase the asset
        assetId,
        referralUsesType,
        baseAmount: purchaseAmount,
        commissionPct,
        commissionAmount,
        status,
      },
    });

    await tx.commissionLedger.create({
      data: {
        commissionId: commission.id,
        fromStatus: null,
        toStatus: status,
        amount: commissionAmount,
        reason,
        metadata: {
          campaignId: campaign.id,
          purchaseId,
          assetId,
        },
      },
    });

    const user = await tx.account.findUnique({
      where: {
        id: referredUserId,
      },
    });

    if (!user) {
      throw new Error('user not found');
    }

    await this.activityService.createLog(
      {
        type: ActivityType.COMMISSION_CREATED,
        actorType: ACTOR_TYPE_MAP[user.type] ?? ActivityActorType.SYSTEM,
        actorId: referredUserId,
        entityType: ActivityEntityType.REFERRAL_COMMISSION,
        entityId: commission.id,
        targetId: campaign.ownerId, // broker
        label: `A commission of ₹${commissionAmount.toString()} has been generated and marked as pending.`,
        metadata: {
          commissionId: commission.id,
          campaignId: campaign.id,
          brokerId: campaign.ownerId,
          purchaseId,
          assetId,
          baseAmount: purchaseAmount.toString(),
          commissionPct: commissionPct.toString(),
          commissionAmount: commissionAmount.toString(),
          referralUsesType,
          reason,
        },
      },
      { tx },
    );

    return commissionAmount;
  }

  private async applyInvestorSignupCommission(
    tx: Prisma.TransactionClient,
    data: {
      buyerId: number;
      assetId: number;
      purchaseId: number;
      purchaseAmount: Prisma.Decimal;
    },
  ): Promise<Prisma.Decimal> {
    const { buyerId, assetId, purchaseId, purchaseAmount } = data;

    const usage = await tx.referralUsage.findFirst({
      where: {
        referredUserId: buyerId,
        referralUsesType: ReferralUsesType.InvestorSignup,
        isCompleted: false,
        campaign: { isActive: true },
      },
      include: {
        campaign: true,
      },
    });

    if (!usage || !usage.campaign) return new Prisma.Decimal(0);

    const alreadyCredited = await tx.referralCommission.findFirst({
      where: {
        transactionId: purchaseId,
        referralUsesType: ReferralUsesType.InvestorSignup,
      },
    });

    if (alreadyCredited) return new Prisma.Decimal(0);
    if (usage.rewardLimit !== null && usage.usageCount >= usage.rewardLimit) {
      await tx.referralUsage.update({
        where: { id: usage.id },
        data: { isCompleted: true },
      });
      return new Prisma.Decimal(0);
    }

    const contract = await tx.assetBrokerCommissionContract.findFirst({
      where: {
        assetId,
        brokerId: usage.campaign.ownerId,
        status: ReferralApprovalStatus.Approved,
        adminStatus: ReferralApprovalStatus.Approved,
      },
      select: {
        id: true,
        finalCommissionPct: true,
      },
    });

    const commissionPct =
      contract?.finalCommissionPct ??
      new Prisma.Decimal(this.BrokerCommissionConfig.commissionPct);

    // Validate percentage
    if (!commissionPct || commissionPct.lte(0) || commissionPct.gt(100)) {
      throw new Error('Invalid commission percentage');
    }

    const commissionAmount = await this.createCommission(tx, {
      campaign: usage.campaign,
      purchaseId,
      assetId,
      purchaseAmount,
      referredUserId: buyerId,
      referralUsesType: ReferralUsesType.InvestorSignup,
      commissionPct,
      status: CommissionStatus.Pending, // always pending
      reason: 'Investor purchase referral commission',
    });

    const nextCount = usage.usageCount + 1;

    await tx.referralUsage.update({
      where: { id: usage.id },
      data: {
        usageCount: nextCount,
        isCompleted:
          usage.rewardLimit !== null && nextCount >= usage.rewardLimit,
      },
    });

    return commissionAmount;
  }

  private async applyAssetOwnerSignupCommission(
    tx: Prisma.TransactionClient,
    data: {
      buyerId: number;
      assetId: number;
      purchaseId: number;
      purchaseAmount: Prisma.Decimal;
    },
  ): Promise<Prisma.Decimal> {
    const { assetId, buyerId, purchaseId, purchaseAmount } = data;
    if (purchaseAmount.lte(0)) return new Prisma.Decimal(0);

    const assetInvite = await tx.assetOwnerInvite.findFirst({
      where: {
        assetId,
        assetOwnerStatus: ReferralApprovalStatus.Approved,
        // adminStatus: ReferralApprovalStatus.Approved,
        isAssetOnBording: true,
        campaign: { isActive: false },
      },
      include: { campaign: true },
    });

    if (!assetInvite) return new Prisma.Decimal(0);

    const alreadyCredited = await tx.referralCommission.findFirst({
      where: {
        transactionId: purchaseId,
        referralUsesType: ReferralUsesType.AssetOwnerSignup,
      },
    });

    if (alreadyCredited) return new Prisma.Decimal(0);

    let commissionPct: Prisma.Decimal;
    if (assetInvite.adminStatus === ReferralApprovalStatus.Approved) {
      if (!assetInvite.finalCommissionPct) {
        throw new Error('Final commission percentage not approved');
      }
      commissionPct = assetInvite.finalCommissionPct;
    } else {
      commissionPct = assetInvite.proposedCommissionPct;
    }

    if (commissionPct.lte(0) || commissionPct.gt(100)) {
      throw new Error('Invalid commission percentage');
    }

    const status =
      assetInvite.adminStatus === ReferralApprovalStatus.Approved
        ? CommissionStatus.Pending
        : CommissionStatus.Hold;

    return this.createCommission(tx, {
      campaign: assetInvite.campaign,
      purchaseId,
      assetId,
      purchaseAmount,
      referredUserId: buyerId,
      referralUsesType: ReferralUsesType.AssetOwnerSignup,
      commissionPct,
      status,
      reason: 'Asset owner property commission',
    });
  }

  private async applyAssetCommission(
    tx: Prisma.TransactionClient,
    data: {
      buyerId: number;
      assetId: number;
      purchaseId: number;
      purchaseAmount: Prisma.Decimal;
    },
  ) {
    const { assetId, buyerId, purchaseId, purchaseAmount } = data;
    if (purchaseAmount.lte(0)) return;

    const assetInvite = await tx.assetOwnerInvite.findFirst({
      where: {
        assetId,
        assetOwnerStatus: ReferralApprovalStatus.Approved,
        // adminStatus: ReferralApprovalStatus.Approved,
        isAssetOnBording: true,
        campaign: { isActive: false },
      },
      include: { campaign: true },
    });

    if (!assetInvite) return;

    const alreadyCredited = await tx.referralCommission.findFirst({
      where: {
        transactionId: purchaseId,
        referralUsesType: ReferralUsesType.AssetRegistration,
      },
    });

    if (alreadyCredited) return;

    let commissionPct: Prisma.Decimal;
    if (assetInvite.adminStatus === ReferralApprovalStatus.Approved) {
      if (!assetInvite.finalCommissionPct) {
        throw new Error('Final commission percentage not approved');
      }
      commissionPct = assetInvite.finalCommissionPct;
    } else {
      commissionPct = assetInvite.proposedCommissionPct;
    }

    if (commissionPct.lte(0) || commissionPct.gt(100)) {
      throw new Error('Invalid commission percentage');
    }

    const status =
      assetInvite.adminStatus === ReferralApprovalStatus.Approved
        ? CommissionStatus.Pending
        : CommissionStatus.Hold;

    await this.createCommission(tx, {
      campaign: assetInvite.campaign,
      purchaseId,
      assetId,
      purchaseAmount,
      referredUserId: buyerId,
      referralUsesType: ReferralUsesType.AssetRegistration,
      commissionPct,
      status,
      reason: 'Asset owner property commission',
    });
  }

  private async applyReferralCommissionOnPurchase(
    tx: Prisma.TransactionClient,
    data: {
      buyerId: number;
      assetId: number;
      purchaseId: number;
      purchaseAmount: Prisma.Decimal;
    },
  ): Promise<Prisma.Decimal> {
    if (data.purchaseAmount.lte(0)) return new Prisma.Decimal(0);

    const [investorCommission, assetOwnerCommission] = await Promise.all([
      this.applyInvestorSignupCommission(tx, data),
      this.applyAssetOwnerSignupCommission(tx, data),
      // this.applyAssetCommission(tx, data),
    ]);

    return investorCommission.add(assetOwnerCommission).toDP(2);
  }

  async purchaseAsset(
    accountId: number,
    data: {
      assetId: number;
      fractions: number;
      couponCode?: string;
    },
  ) {
    const userConsent = await this.prisma.fractionsConsent.findUnique({
      where: {
        accountId_assetId: { accountId, assetId: data.assetId },
      },
    });

    if (!userConsent) {
      throw new BadRequestException('User is not filled the consent form');
    }

    if (!userConsent.buyerConsent) {
      throw new BadRequestException(
        'Consent is required before purchasing fractions.',
      );
    }

    const purchase = await this.prisma.$transaction(
      async (tx) => {
        const asset = await tx.asset.findUnique({
          where: { id: data.assetId },
          include: { price: true },
        });

        const checkKyc = await tx.kyc.findUnique({
          where: { accountId: accountId },
        });

        if (!checkKyc || checkKyc.status !== KycStatus.Approved) {
          throw new BadRequestException(
            'Your KYC is not approved. Please complete your KYC before purchasing an asset.',
          );
        }

        if (!asset) throw new Error('Asset not found');
        if (asset.isSoldOut) throw new Error('Asset is sold out');
        if (asset.remainingFractions < data.fractions) {
          throw new Error('Not enough fractions available');
        }

        const pricePerUnit = asset.price!.currentPricePerFraction;
        let totalFractions = data.fractions;
        let totalAmount = pricePerUnit.mul(data.fractions).toDP(2);
        const order = await tx.assetPurchase.create({
          data: {
            assetId: asset.id,
            accountId,
            fractions: data.fractions,
            pricePerUnit,
            totalAmount,
          },
        });

        console.log('data', data.couponCode, totalAmount, data.fractions);

        // validate and apply coupon
        if (data.couponCode) {
          const couponResult = await this.couponService.validateAndApplyCoupon(
            tx,
            {
              couponCode: data.couponCode,
              userId: accountId,
              orderId: order.id,
              purchaseAmount: totalAmount,
              fractions: data.fractions,
            },
          );
          totalAmount = totalAmount.minus(couponResult.discountAmount).toDP(2);
          totalFractions += couponResult.bonusFractions;

          await tx.assetPurchase.update({
            where: { id: order.id },
            data: {
              totalAmount,
              fractions: totalFractions,
            },
          });
        }

        // atomic fraction update
        const updatedAsset = await tx.asset.updateMany({
          where: {
            id: asset.id,
            remainingFractions: { gte: totalFractions },
          },
          data: {
            soldFractions: { increment: totalFractions },
            remainingFractions: { decrement: totalFractions },
          },
        });

        if (updatedAsset.count !== 1) {
          throw new Error('Fractions no longer available');
        }

        await this.walletsService.subtractBalance(
          accountId,
          totalAmount,
          WalletType.Main,
          {
            tx,
            context: WalletTransactionContext.FractionsPurchase,
          },
        );

        const totalCommission = await this.applyReferralCommissionOnPurchase(
          tx,
          {
            buyerId: accountId,
            assetId: asset.id,
            purchaseId: order.id,
            purchaseAmount: order.totalAmount,
          },
        );

        // Credit asset owner with purchase amount minus broker commission
        if (asset.accountId) {
          console.log('totalCommission', totalCommission);
          const ownerReceives = totalAmount.minus(totalCommission).toDP(2);
          if (ownerReceives.gt(0)) {
            await this.walletsService.addBalance(
              asset.accountId,
              ownerReceives,
              WalletType.Main,
              {
                tx,
                context: WalletTransactionContext.FractionsSale,
              },
            );
          }
        }

        if (asset.remainingFractions === totalFractions) {
          await tx.asset.update({
            where: { id: asset.id },
            data: { isSoldOut: true, status: AssetStatus.Funded },
          });
        }

        const spv = await tx.spv.findFirst({
          where: { secondaryClub: { assetId: asset.id } },
          select: { id: true },
        });

        if (spv) {
          await tx.spvMember.upsert({
            where: {
              spvId_accountId: { spvId: spv.id, accountId },
            },
            update: {},
            create: { spvId: spv.id, accountId },
          });
        }

        return order;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    // Notification
    try {
      const asset = await this.prisma.asset.findUnique({
        where: { id: data.assetId },
        select: {
          accountId: true,
          assetTitle: true,
          isSoldOut: true,
          tempGroupIds: true,
        },
      });

      const accountInf = await this.prisma.account.findFirst({
        where: { id: accountId },
        select: { firstname: true, lastname: true },
      });
      await this.notificationService._sendNotification({
        code: NotificationCode.BUY_FRACTION_INITIATED,
        audience: NotificationAudience.USER,
        userIds: [asset!.accountId!],
        type: NotificationType.Transactional,
        data: {
          assetId: data.assetId,
          propertyName: asset?.assetTitle ?? '',
          userName: `${accountInf?.firstname} ${accountInf?.lastname}`,
        },
      });

      if (asset?.isSoldOut) {
        const [investors, trustees] = await Promise.all([
          this.prisma.assetPurchase.findMany({
            where: { assetId: data.assetId },
            select: { accountId: true },
            distinct: ['accountId'],
          }),
          this.prisma.account.findMany({
            where: { type: AccountType.Trustee },
            select: { id: true },
          }),
        ]);

        const recipientIds = new Set<number>([
          ...investors.map((i) => i.accountId),
          ...trustees.map((t) => t.id),
        ]);
        if (asset.accountId) recipientIds.add(asset.accountId);

        await this.notificationService._sendNotification({
          code: NotificationCode.PROPERTY_FULLY_FUNDED,
          audience: NotificationAudience.BOTH,
          userIds: [...recipientIds],
          type: NotificationType.Informational,
          data: {
            assetId: data.assetId,
            propertyName: asset.assetTitle,
            groupId: asset.tempGroupIds[0],
          },
        });
      }
    } catch (err) {
      console.error('Notification failed:', err);
    }

    return purchase;
  }

  async getAllFractions(
    accountId: number,
    query: {
      assetId?: number;
      fromDate?: Date;
      toDate?: Date;
      skip?: number;
      take?: number;
    },
  ) {
    const { assetId, fromDate, toDate } = query;

    const where: Prisma.AssetPurchaseWhereInput = {
      accountId,
      ...(assetId && { assetId }),
    };

    if (fromDate || toDate) {
      where.createdAt = {
        ...(fromDate && { gte: fromDate }),
        ...(toDate && {
          lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
        }),
      };
    }

    const skip = query.skip ?? 0;
    const take = query.take ?? 10;

    const [count, data] = await this.prisma.$transaction([
      this.prisma.assetPurchase.count({ where }),
      this.prisma.assetPurchase.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: {
            select: {
              id: true,
              assetTitle: true,
              assetType: true,
            },
          },
          account: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              mobile: true,
            },
          },
        },
      }),
    ]);

    return {
      count,
      skip,
      take,
      data,
    };
  }

  sortColumnMap = {
    value: 'currentValue',
    profit: 'profitLoss',
    fractions: 'totalFractionsPurchased',
  };

  async getMyAssetPortfolioDetailed(
    accountId: number,
    query: {
      skip?: number;
      take?: number;
      search?: string;
      sortBy?: 'profit' | 'value' | 'fractions';
      order?: 'asc' | 'desc';
    },
  ) {
    const sortColumn = this.sortColumnMap[query.sortBy ?? 'profit'];
    const sortOrder = query.order === 'asc' ? 'asc' : 'desc';
    const portfolioData = await this.prisma.$queryRaw<any[]>`
    SELECT
      a.*,

      apx.id                 AS "price_id",
      apx.initial_price      AS "initial_price",
      apx.current_price      AS "current_price",
      g.title               AS "groupTitle",

      SUM(ap.fractions)      AS "totalFractionsPurchased",
      SUM(ap.total_amount)   AS "totalInvestedAmount",
      AVG(ap.price_per_unit) AS "avgBuyPrice",

      SUM(ap.fractions) * apx.current_price
                             AS "currentValue",

      (SUM(ap.fractions) * apx.current_price)
        - SUM(ap.total_amount)
                             AS "profitLoss"

    FROM asset_purchase ap
    JOIN asset a ON a.id = ap.asset_id
    LEFT JOIN asset_price apx ON apx.asset_id = a.id
    LEFT JOIN "group" g ON g.id = a.temp_group_ids[1]

    WHERE ap.account_id = ${accountId}

    GROUP BY a.id, apx.id, g.title
    ORDER BY ${Prisma.raw(`"${sortColumn}" ${sortOrder}`)}
    OFFSET ${query.skip ?? 0}
    LIMIT ${query.take ?? 10}
  `;

    if (!portfolioData.length) {
      return {
        data: [],
        skip: query.skip ?? 0,
        take: query.take ?? 10,
      };
    }

    const assetIds = portfolioData.map((a) => a.id);

    const REQUIRED_META_KEYS = [
      'marketValue',
      'netOperationalIncome',
      'expectedAppreciationPercentage',
      'state',
      'city',
      'yearOfConstruction',
    ];

    const metas = await this.prisma.assetMeta.findMany({
      where: {
        assetId: { in: assetIds },
        metaKey: { in: REQUIRED_META_KEYS },
      },
    });

    const metaMap = new Map<number, typeof metas>();

    metas.forEach((m) => {
      if (!metaMap.has(m.assetId)) {
        metaMap.set(m.assetId, []);
      }
      metaMap.get(m.assetId)!.push(m);
    });

    const documents = await this.prisma.assetDocument.findMany({
      where: { assetId: { in: assetIds } },
      take: 1,
    });

    const documentMap = new Map<number, typeof documents>();

    documents.forEach((doc) => {
      if (!documentMap.has(doc.assetId)) {
        documentMap.set(doc.assetId, []);
      }
      documentMap.get(doc.assetId)!.push(doc);
    });

    const data = portfolioData.map((asset) => {
      const assetMetas = metaMap.get(asset.id) ?? [];
      const assetDocs = documentMap.get(asset.id) ?? [];

      const marketValue = this.assetsService.getMetaNumber(
        assetMetas,
        'marketValue',
      );

      const netOperationalIncome = this.assetsService.getMetaNumber(
        assetMetas,
        'netOperationalIncome',
      );

      const expectedAppreciationPercentage = this.assetsService.getMetaNumber(
        assetMetas,
        'expectedAppreciationPercentage',
      );

      const financials = this.assetFinancialCalculator.calculate({
        marketValue,
        netOperationalIncome,
        expectedAppreciationPercentage,
        totalFractions: asset.total_fraction,
        currentPricePerFraction: Number(asset.current_price) ?? 0,
      });

      return {
        asset: {
          id: asset.id,
          accountId: asset.account_id,
          assetType: asset.asset_type,
          assetSubType: asset.asset_sub_type,
          assetTitle: asset.asset_title,
          tempGroupIds: asset.temp_group_ids,
          groupName: asset.groupTitle ?? null,
          currentOwnerName: asset.current_owner_name,
          assetAppreciation: asset.asset_appreciation,
          totalFractions: asset.total_fraction,
          soldFractions: asset.sold_fraction,
          remainingFractions: asset.remaining_fraction,
          yieldPercentage: asset.yield_percentage,
          isSoldOut: asset.is_sold_out,
          isVerified: asset.is_verified,
          ownershipModel: asset.ownership_model,
          createdAt: asset.created_at,
          updatedAt: asset.updated_at,
        },
        price: asset.price_id
          ? {
              initialPricePerFraction: Number(asset.initial_price),
              currentPricePerFraction: Number(asset.current_price),
            }
          : null,
        meta: assetMetas,
        documents: assetDocs.map((doc) => ({
          ...doc,
          url: doc.documentUrl
            ? this.storageService.resolveFileUrl(doc.documentUrl)
            : null,
        })),
        investment: {
          totalFractionsPurchased: Number(asset.totalFractionsPurchased),
          totalInvestedAmount: Number(asset.totalInvestedAmount),
          avgBuyPrice: Number(asset.avgBuyPrice),
          currentValue: Number(asset.currentValue),
          profitLoss: Number(asset.profitLoss),
        },
        financials,
      };
    });

    return {
      data,
      count: data.length,
      skip: query.skip ?? 0,
      take: query.take ?? 10,
    };
  }

  async getAssetPurchaseHistory(
    assetId: number,
    query: {
      skip?: number;
      take?: number;
    },
  ) {
    const where: Prisma.AssetPurchaseWhereInput = {
      assetId,
    };

    const [purchases, total, amountAggregate, assetSummary] =
      await this.prisma.$transaction([
        this.prisma.assetPurchase.findMany({
          where,
          select: {
            id: true,
            fractions: true,
            pricePerUnit: true,
            totalAmount: true,
            createdAt: true,

            account: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                type: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: query.skip ?? 0,
          take: query.take ?? 10,
        }),
        this.prisma.assetPurchase.count({ where }),
        this.prisma.assetPurchase.aggregate({
          where,
          _sum: {
            totalAmount: true,
            fractions: true,
          },
        }),
        this.prisma.asset.findUnique({
          where: { id: assetId },
          select: {
            totalFractions: true,
            soldFractions: true,
            remainingFractions: true,
            isSoldOut: true,
          },
        }),
      ]);

    if (!assetSummary) {
      throw new Error('Asset not found');
    }

    const data = purchases.map((purchase) => ({
      investorId: purchase.account.id,
      investorName: `${purchase.account.firstname} ${purchase.account.lastname}`,
      type: purchase.account.type,
      fractions: purchase.fractions,
      pricePerUnit: Number(purchase.pricePerUnit),
      totalAmount: Number(purchase.totalAmount),
      date: purchase.createdAt,
    }));

    return {
      summary: {
        totalFractions: assetSummary.totalFractions,
        soldFractions: assetSummary.soldFractions,
        remainingFractions: assetSummary.remainingFractions,
        isSoldOut: assetSummary.isSoldOut,
        totalAmountSold: Number(amountAggregate._sum.totalAmount ?? 0),
        totalFractionsSoldFromPurchases: amountAggregate._sum.fractions ?? 0,
      },
      count: total,
      skip: query.skip ?? 0,
      take: query.take ?? 10,
      data,
    };
  }

  async signOnFractionsConsent(
    accountId: number,
    data: {
      assetId: number;
      buyerConsent: boolean;
      rejectionReason?: string;
    },
  ) {
    try {
      return await this.prisma.fractionsConsent.upsert({
        where: {
          accountId_assetId: { accountId, assetId: data.assetId },
        },
        update: {
          buyerConsent: data.buyerConsent,
          rejectionReason: data.rejectionReason ?? null,
        },
        create: {
          accountId,
          assetId: data.assetId,
          buyerConsent: data.buyerConsent,
          rejectionReason: data.rejectionReason ?? null,
        },
      });
    } catch (error) {
      // if (
      //   error instanceof Prisma.PrismaClientUnknownRequestError &&
      //   error.message.includes('42P10')
      // ) {
      //   const existing = await this.prisma.fractionsConsent.findFirst({
      //     where: { accountId, assetId: data.assetId },
      //   });

      //   if (existing) {
      //     return this.prisma.fractionsConsent.update({
      //       where: { id: existing.id },
      //       data: {
      //         buyerConsent: data.buyerConsent,
      //         rejectionReason: data.rejectionReason ?? null,
      //       },
      //     });
      //   }

      //   return this.prisma.fractionsConsent.create({
      //     data: {
      //       accountId,
      //       assetId: data.assetId,
      //       buyerConsent: data.buyerConsent,
      //       rejectionReason: data.rejectionReason ?? null,
      //     },
      //   });
      // }

      throw error;
    }
  }
}
