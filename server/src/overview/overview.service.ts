import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma } from '../generated/prisma/client';
import {
  AssetStatus,
  KycStatus,
  ListingStatus,
  ListingType,
  RWAStatus,
} from '../generated/prisma/enums';
import { NotificationService } from '../notification';
import { VoteService } from '../vote/vote.service';
import { getVoteStatus, VoteStatus } from '@Common';

type StageState = 'completed' | 'current' | 'pending' | 'rejected';

interface PipelineStage {
  stage: string;
  status: StageState;
}

@Injectable()
export class OverviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly voteService: VoteService,
  ) {}

  // ─── Existing helpers ─────────────────────────────────────────────────────

  async getPortfolioAmount(accountId: number): Promise<number> {
    const result = await this.prisma.assetPurchase.aggregate({
      where: { accountId },
      _sum: { totalAmount: true },
    });
    return Number(result._sum.totalAmount ?? 0);
  }

  async getInvestedAssetCount(accountId: number): Promise<number> {
    const assets = await this.prisma.assetPurchase.groupBy({
      by: ['assetId'],
      where: { accountId },
    });
    return assets.length;
  }

  async getTotalIncomeCollected(accountId: number): Promise<number> {
    const investments = await this.prisma.assetPurchase.findMany({
      where: { accountId },
      select: {
        totalAmount: true,
        asset: { select: { yieldPercentage: true } },
      },
    });

    let totalIncome = 0;
    for (const inv of investments) {
      const yieldPct = inv.asset.yieldPercentage ?? 0;
      totalIncome += Number(inv.totalAmount) * (yieldPct / 100);
    }
    return Number(totalIncome.toFixed(2));
  }

  async getOverview(accountId: number) {
    const [portfolioAmount, investedAssetCount, totalIncomeCollected] =
      await Promise.all([
        this.getPortfolioAmount(accountId),
        this.getInvestedAssetCount(accountId),
        this.getTotalIncomeCollected(accountId),
      ]);

    return {
      summary: { portfolioAmount, investedAssetCount, totalIncomeCollected },
    };
  }

  async getAllAssetsWithUserData(accountId: number) {
    const assets = await this.prisma.asset.findMany({
      where: { status: 'Available', isVisible: true },
      select: {
        id: true,
        assetTitle: true,
        yieldPercentage: true,
        meta: { where: { metaKey: 'state' }, select: { metaValue: true } },
      },
    });

    const userInvestments = await this.prisma.assetPurchase.groupBy({
      by: ['assetId'],
      where: { accountId },
      _sum: { totalAmount: true, fractions: true },
    });

    const investmentMap = new Map<
      number,
      { investedAmount: number; fractions: number }
    >();
    for (const inv of userInvestments) {
      investmentMap.set(inv.assetId, {
        investedAmount: Number(inv._sum.totalAmount ?? 0),
        fractions: inv._sum.fractions ?? 0,
      });
    }

    return assets.map((asset) => {
      const userInv = investmentMap.get(asset.id);
      const investedAmount = userInv?.investedAmount ?? 0;
      const fractionsPurchased = userInv?.fractions ?? 0;
      const yieldPct = asset.yieldPercentage ?? 0;
      const incomeCollected = investedAmount * (yieldPct / 100);

      return {
        assetId: asset.id,
        assetTitle: asset.assetTitle,
        location: asset.meta?.[0]?.metaValue ?? '',
        investedAmount,
        fractionsPurchased,
        incomeCollected: Number(incomeCollected.toFixed(2)),
        percentage: yieldPct,
        hasInvested: investedAmount > 0,
      };
    });
  }

  // ─── Investor Dashboard Widgets ────────────────────────────────────────────

  async getInvestorActivityWidgets(accountId: number) {
    const [recentActivity, documentsAcknowledgements] = await Promise.all([
      this.notificationService.getNotifications(accountId, { take: 5 }),
      this.getDocumentsAcknowledgements(accountId),
    ]);

    return {
      recentActivity: recentActivity.data,
      documentsAcknowledgements,
    };
  }

  private async getDocumentsAcknowledgements(accountId: number) {
    const documents = await this.prisma.entityDocument.findMany({
      where: { accountId },
      include: { documentType: { select: { name: true } } },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.documentType.name,
      status: doc.isVerified
        ? 'Approved'
        : doc.remark
          ? 'Rejected'
          : 'Under Review',
      uploadedAt: doc.uploadedAt,
      verifiedAt: doc.verifiedAt,
    }));
  }

  // ─── API 1: Marketplace Overview ──────────────────────────────────────────

  async getMarketplaceOverview(accountId: number) {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeListingsCount,
      activeListingValues,
      activeBids,
      askRequests,
      myListings,
      weeklyVolumeAgg,
      trendingStats,
      joinedGroupMembers,
    ] = await Promise.all([
      this.prisma.marketplaceListing.count({
        where: { status: ListingStatus.Active },
      }),

      this.prisma.marketplaceListing.findMany({
        where: { status: ListingStatus.Active },
        select: { pricePerUnit: true, remainingUnits: true },
      }),

      this.prisma.marketplaceListing.count({
        where: {
          accountId,
          type: ListingType.Bid,
          status: ListingStatus.Active,
        },
      }),

      this.prisma.marketplaceListing.count({
        where: {
          accountId,
          type: ListingType.Ask,
          status: ListingStatus.Active,
        },
      }),

      this.prisma.marketplaceListing.count({
        where: { accountId, status: ListingStatus.Active },
      }),

      this.prisma.marketplaceTrade.aggregate({
        where: { tradedAt: { gte: since7d } },
        _sum: { totalAmount: true },
      }),

      this.prisma.assetMarketStat.findMany({
        orderBy: { priceChange24h: 'desc' },
        take: 5,
        include: {
          asset: { select: { id: true, assetTitle: true } },
        },
      }),

      // All GroupMember rows for this user to get their joined group IDs
      this.prisma.groupMember.findMany({
        where: { accountId },
        select: { groupId: true },
      }),
    ]);

    const totalMarketValue = activeListingValues.reduce(
      (sum, l) => sum + Number(l.pricePerUnit) * l.remainingUnits,
      0,
    );

    const communities = await this.getCommunitiesStats(
      accountId,
      joinedGroupMembers.map((m) => m.groupId).filter(Boolean) as number[],
      since7d,
    );

    return {
      activeListings: activeListingsCount,
      totalMarketValue: parseFloat(totalMarketValue.toFixed(2)),
      stats: {
        activeBids,
        askRequests,
        myListings,
      },
      weeklyTradeVolume: parseFloat(
        Number(weeklyVolumeAgg._sum.totalAmount ?? 0).toFixed(2),
      ),
      trendingAssets: trendingStats.map((s) => ({
        assetId: s.asset.id,
        assetTitle: s.asset.assetTitle,
        priceChange24h: Number(s.priceChange24h),
        trend: Number(s.priceChange24h) >= 0 ? 'UP' : 'DOWN',
      })),
      communities,
    };
  }

  private async getCommunitiesStats(
    accountId: number,
    groupIds: number[],
    since7d: Date,
  ) {
    if (!groupIds.length) {
      return {
        groupsJoined: 0,
        totalMembers: 0,
        assetsShared: 0,
        mySharedAssets: 0,
        newMembersThisWeek: 0,
        mostActiveGroup: null,
      };
    }

    const [
      totalMembersAgg,
      assetsSharedCount,
      mySharedAssetsCount,
      newMembersThisWeek,
      groupsWithMemberCount,
    ] = await Promise.all([
      // Total members across all joined groups
      this.prisma.groupMember.count({
        where: { groupId: { in: groupIds } },
      }),

      // Assets shared inside user's joined groups
      this.prisma.sharedAssetGroup.count({
        where: { groupId: { in: groupIds } },
      }),

      // Assets shared by this user specifically (across any group)
      this.prisma.sharedAsset.count({
        where: { sharedById: accountId },
      }),

      // New members joined user's groups in the past 7 days
      this.prisma.groupMember.count({
        where: { groupId: { in: groupIds }, createdAt: { gte: since7d } },
      }),

      // Groups with their member count (to find the most active)
      this.prisma.group.findMany({
        where: { id: { in: groupIds } },
        select: {
          id: true,
          title: true,
          _count: { select: { groupMember: true } },
        },
        orderBy: { groupMember: { _count: 'desc' } },
        take: 1,
      }),
    ]);

    const mostActive = groupsWithMemberCount[0] ?? null;

    return {
      groupsJoined: groupIds.length,
      totalMembers: totalMembersAgg,
      assetsShared: assetsSharedCount,
      mySharedAssets: mySharedAssetsCount,
      newMembersThisWeek,
      mostActiveGroup: mostActive
        ? {
            id: mostActive.id,
            title: mostActive.title,
            memberCount: mostActive._count.groupMember,
          }
        : null,
    };
  }

  // ─── API 2: Portfolio Overview ────────────────────────────────────────────

  async getPortfolioOverview(
    accountId: number,
    period: '24h' | '7d' | '30d' = '24h',
  ) {
    const periodMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    const since = new Date(Date.now() - periodMs[period]);

    const [holdings, sellTrades] = await Promise.all([
      this.prisma.holding.findMany({
        where: { accountId },
        include: {
          asset: {
            include: { price: true },
          },
        },
      }),

      this.prisma.marketplaceTrade.findMany({
        where: { sellerId: accountId, tradedAt: { gte: since } },
        select: { netAmount: true, units: true, assetId: true },
      }),
    ]);

    // "Active commitments" — holdings the account still owns fractions of.
    const activeHoldings = holdings.filter(
      (h) => Number(h.availableQuantity) + Number(h.lockedQuantity) > 0,
    );

    // Total invested and current value, scoped to active holdings only.
    let totalInvested = 0;
    let currentPortfolioValue = 0;
    for (const h of activeHoldings) {
      const qty = Number(h.availableQuantity) + Number(h.lockedQuantity);
      const currentPrice = Number(
        h.asset.price?.currentPricePerFraction ?? h.averageBuyPrice,
      );
      totalInvested += qty * Number(h.averageBuyPrice);
      currentPortfolioValue += qty * currentPrice;
    }

    const portfolioChangeAmount = currentPortfolioValue - totalInvested;
    const portfolioChangePercent =
      totalInvested > 0
        ? parseFloat(((portfolioChangeAmount / totalInvested) * 100).toFixed(2))
        : 0;

    // Asset appreciation for the period
    const assetIds = activeHoldings.map((h) => h.assetId);
    let appreciationAmount = 0;

    if (assetIds.length > 0) {
      const tradesInPeriod = await this.prisma.marketplaceTrade.findMany({
        where: { assetId: { in: assetIds }, tradedAt: { gte: since } },
        orderBy: { tradedAt: 'asc' },
        select: { assetId: true, pricePerUnit: true },
      });

      // For each asset: first price in period = opening, last price = closing
      const assetPriceRange = new Map<
        number,
        { first: number; last: number }
      >();
      for (const t of tradesInPeriod) {
        const price = Number(t.pricePerUnit);
        const existing = assetPriceRange.get(t.assetId);
        if (!existing) {
          assetPriceRange.set(t.assetId, { first: price, last: price });
        } else {
          existing.last = price;
        }
      }

      for (const h of activeHoldings) {
        const range = assetPriceRange.get(h.assetId);
        if (range) {
          const priceChange = range.last - range.first;
          const totalQty =
            Number(h.availableQuantity) + Number(h.lockedQuantity);
          appreciationAmount += priceChange * totalQty;
        }
      }
    }

    const appreciationPercent =
      currentPortfolioValue > 0
        ? parseFloat(
            ((appreciationAmount / currentPortfolioValue) * 100).toFixed(2),
          )
        : 0;

    // Realized P&L (sells in period vs average cost basis)
    const holdingMap = new Map(
      holdings.map((h) => [h.assetId, Number(h.averageBuyPrice)]),
    );
    let realizedAmount = 0;
    for (const trade of sellTrades) {
      const avgBuyPrice = holdingMap.get(trade.assetId) ?? 0;
      realizedAmount += Number(trade.netAmount) - avgBuyPrice * trade.units;
    }

    const [
      totalIncomeCollected,
      totalPropertiesInvested,
      propertyBreakdown,
      portfolioPerformance,
      spvCount,
      kycStatus,
      myHoldings,
    ] = await Promise.all([
      this.getTotalIncomeCollected(accountId),
      this.getInvestedAssetCount(accountId),
      this.getInvestedPropertiesBreakdown(accountId),
      this.getPortfolioPerformanceChart(accountId),
      this.prisma.spvMember.count({ where: { accountId } }),
      this.getKycStatus(accountId),
      this.getTopHoldings(activeHoldings, 3),
    ]);

    return {
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      activeCommitments: activeHoldings.length,
      spvCount,
      kycStatus,
      myHoldings,
      totalPortfolioValue: {
        amount: parseFloat(currentPortfolioValue.toFixed(2)),
        changeAmount: parseFloat(portfolioChangeAmount.toFixed(2)),
        changePercent: portfolioChangePercent,
        trend: portfolioChangeAmount >= 0 ? 'UP' : 'DOWN',
      },
      assetAppreciation: {
        amount: parseFloat(Math.abs(appreciationAmount).toFixed(2)),
        percentage: Math.abs(appreciationPercent),
        trend: appreciationAmount >= 0 ? 'UP' : 'DOWN',
        period,
      },
      realizedProfitLoss: {
        amount: parseFloat(Math.abs(realizedAmount).toFixed(2)),
        type: realizedAmount >= 0 ? 'PROFIT' : 'LOSS',
        label: 'From Exits',
        period,
      },
      totalIncomeCollected,
      totalPropertiesInvested,
      propertyBreakdown,
      portfolioPerformance,
    };
  }

  private async getKycStatus(accountId: number) {
    const kyc = await this.prisma.kyc.findUnique({ where: { accountId } });
    const status = kyc?.status ?? null;

    return {
      status,
      label: status === KycStatus.Approved ? 'Completed' : 'Pending',
    };
  }

  private getHoldingStatusLabel(status: AssetStatus): string {
    switch (status) {
      case AssetStatus.Available:
        return 'Funding';
      case AssetStatus.Funded:
        return 'Managed';
      case AssetStatus.Exited:
        return 'Exited';
      default:
        return status;
    }
  }

  private async getTopHoldings(
    activeHoldings: Array<
      Prisma.HoldingGetPayload<{
        include: { asset: { include: { price: true } } };
      }>
    >,
    take: number,
  ) {
    if (!activeHoldings.length) return [];

    const assetIds = activeHoldings.map((h) => h.assetId);
    const spvs = await this.prisma.spv.findMany({
      where: { secondaryClub: { assetId: { in: assetIds } } },
      select: {
        id: true,
        name: true,
        secondaryClub: { select: { assetId: true } },
      },
    });

    const spvByAssetId = new Map<number, { id: number; name: string }>();
    for (const s of spvs) {
      const assetId = s.secondaryClub?.assetId;
      if (assetId != null && !spvByAssetId.has(assetId)) {
        spvByAssetId.set(assetId, { id: s.id, name: s.name });
      }
    }

    return activeHoldings
      .map((h) => {
        const qty = Number(h.availableQuantity) + Number(h.lockedQuantity);
        const currentPrice = Number(
          h.asset.price?.currentPricePerFraction ?? h.averageBuyPrice,
        );
        const spv = spvByAssetId.get(h.assetId) ?? null;

        return {
          assetId: h.assetId,
          assetTitle: h.asset.assetTitle,
          spvId: spv?.id ?? null,
          spvName: spv?.name ?? null,
          invested: parseFloat((qty * Number(h.averageBuyPrice)).toFixed(2)),
          currentValue: parseFloat((qty * currentPrice).toFixed(2)),
          status: this.getHoldingStatusLabel(h.asset.status),
        };
      })
      .sort((a, b) => b.invested - a.invested)
      .slice(0, take);
  }

  private async getInvestedPropertiesBreakdown(accountId: number) {
    const userInvestments = await this.prisma.assetPurchase.groupBy({
      by: ['assetId'],
      where: { accountId },
      _sum: { totalAmount: true, fractions: true },
    });

    if (!userInvestments.length) return [];

    const assetIds = userInvestments.map((inv) => inv.assetId);

    const assets = await this.prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: {
        id: true,
        assetTitle: true,
        yieldPercentage: true,
        meta: { where: { metaKey: 'state' }, select: { metaValue: true } },
      },
    });

    const assetMap = new Map(assets.map((a) => [a.id, a]));

    return userInvestments.map((inv) => {
      const asset = assetMap.get(inv.assetId);
      const investedAmount = Number(inv._sum.totalAmount ?? 0);
      const yieldPct = asset?.yieldPercentage ?? 0;
      const incomeCollected = investedAmount * (yieldPct / 100);

      return {
        assetId: inv.assetId,
        assetTitle: asset?.assetTitle ?? '',
        location: asset?.meta?.[0]?.metaValue ?? '',
        investedAmount,
        fractionsPurchased: inv._sum.fractions ?? 0,
        incomeCollected: parseFloat(incomeCollected.toFixed(2)),
        yieldPercentage: yieldPct,
      };
    });
  }

  private async getPortfolioPerformanceChart(accountId: number) {
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const purchases = await this.prisma.assetPurchase.findMany({
      where: { accountId, createdAt: { gte: since } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthMap = new Map<string, number>();
    for (const p of purchases) {
      const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(p.totalAmount));
    }

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Get total invested before the chart window for cumulative base
    const priorTotal = await this.prisma.assetPurchase.aggregate({
      where: { accountId, createdAt: { lt: since } },
      _sum: { totalAmount: true },
    });

    let cumulative = Number(priorTotal._sum.totalAmount ?? 0);
    const result: { month: string; year: number; value: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      cumulative += monthMap.get(key) ?? 0;
      result.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        value: parseFloat(cumulative.toFixed(2)),
      });
    }

    return result;
  }

  // ─── API 3: Asset Owner Business Overview ─────────────────────────────────

  async getAssetOwnerOverview(accountId: number) {
    const assets = await this.prisma.asset.findMany({
      where: { accountId },
      include: {
        price: true,
        rwaRequest: true,
        meta: {
          where: { metaKey: { in: ['city', 'state', 'country'] } },
          select: { metaKey: true, metaValue: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // ── Stat cards (existing) ──────────────────────────────────────────────
    const openAssets = assets.filter((a) => a.isVisible && !a.isSoldOut);
    const liquidatedAssets = assets.filter((a) => a.isSoldOut);

    const valueOf = (list: typeof assets) =>
      list.reduce((sum, a) => {
        const price = Number(a.price?.initialPricePerFraction ?? 0);
        return sum + price * a.totalFractions;
      }, 0);

    const soldValueOf = (list: typeof assets) =>
      list.reduce((sum, a) => {
        const price = Number(a.price?.initialPricePerFraction ?? 0);
        return sum + price * a.soldFractions;
      }, 0);

    // ── Stat cards (new — dashboard v2) ────────────────────────────────────
    // "Live" = fully finalized and on the marketplace; "Closed" = exited.
    const liveAssets = assets.filter((a) => a.status === AssetStatus.Available);
    const closedAssets = assets.filter((a) => a.status === AssetStatus.Exited);

    const totalValue = valueOf(assets);
    const capitalRaised = soldValueOf(assets);
    const capitalRaisedPercent =
      totalValue > 0
        ? parseFloat(((capitalRaised / totalValue) * 100).toFixed(1))
        : 0;

    // Assumption: "pending actions" = assets where the ball is in the owner's
    // court right now — admin approved and awaiting full details (steps==='2'),
    // or any stage was rejected and needs resubmission.
    const rejectedRwaStatuses = new Set<RWAStatus>([
      RWAStatus.Rejected,
      RWAStatus.LegalRejected,
      RWAStatus.ValuationRejected,
      RWAStatus.DueDiligenceRejected,
    ]);
    const pendingActions = assets.filter(
      (a) =>
        a.steps === '2' ||
        a.status === AssetStatus.Rejected ||
        (a.rwaRequest && rejectedRwaStatuses.has(a.rwaRequest.status)),
    ).length;

    // Assumption: "compliance queries" = assets with an open legal/trustee
    // rejection specifically (a subset of pending actions) — there is no
    // dedicated query/clarification model in the schema yet, so this is
    // derived from RWAStatus's rejected family until that feature exists.
    const complianceQueries = assets.filter(
      (a) => a.rwaRequest && rejectedRwaStatuses.has(a.rwaRequest.status),
    ).length;

    const stats = {
      totalAssets: assets.length,
      openForInvestment: openAssets.length,
      fullyLiquidated: liquidatedAssets.length,
      totalValue: parseFloat(totalValue.toFixed(2)),
      openForInvestmentValue: parseFloat(valueOf(openAssets).toFixed(2)),
      fullyLiquidatedValue: parseFloat(valueOf(liquidatedAssets).toFixed(2)),
      // new fields:
      liveCount: liveAssets.length,
      closedCount: closedAssets.length,
      capitalRaised: parseFloat(capitalRaised.toFixed(2)),
      capitalRaisedPercent,
      pendingActions,
      complianceQueries,
    };

    // ── Action Center (new) ────────────────────────────────────────────────
    const recentNotifications = await this.notificationService.getNotifications(
      accountId,
      { take: 5 },
    );
    const actionCenter = recentNotifications.data;

    // ── My Listed Assets table (new) ───────────────────────────────────────
    const listedAssets = assets.slice(0, 10).map((asset) => {
      const price = Number(asset.price?.initialPricePerFraction ?? 0);
      const assetTotalValue = price * asset.totalFractions;
      const assetSoldValue = price * asset.soldFractions;
      const raiseProgress =
        asset.totalFractions > 0
          ? parseFloat(
              ((asset.soldFractions / asset.totalFractions) * 100).toFixed(1),
            )
          : 0;

      const pipeline = this.buildAssetTrackingPipeline(asset, asset.rwaRequest);
      const stage = this.getCurrentStageLabel(pipeline);
      const isLiveOrClosed =
        asset.status === AssetStatus.Available ||
        asset.status === AssetStatus.Exited ||
        asset.isSoldOut;

      return {
        assetId: asset.id,
        assetTitle: asset.assetTitle,
        stage,
        status: isLiveOrClosed ? this.getLiquidationStatus(asset) : stage,
        raiseProgress,
        totalValue: parseFloat(assetTotalValue.toFixed(2)),
        soldValue: parseFloat(assetSoldValue.toFixed(2)),
      };
    });

    // ── Latest asset detail ────────────────────────────────────────────────
    const latest = assets[0] ?? null;
    let latestAsset: object | null = null;

    if (latest) {
      const price = Number(latest.price?.initialPricePerFraction ?? 0);
      const totalValue = price * latest.totalFractions;
      const soldValue = price * latest.soldFractions;
      const liquidationPercent =
        latest.totalFractions > 0
          ? parseFloat(
              ((latest.soldFractions / latest.totalFractions) * 100).toFixed(1),
            )
          : 0;

      // Total unique investors for this asset
      const investorCount = await this.prisma.assetPurchase.groupBy({
        by: ['accountId'],
        where: { assetId: latest.id },
      });

      const processTimeline = this.buildProcessTimeline(
        latest,
        latest.rwaRequest,
      );

      // New — accurate tracking pipeline reflecting the current RWA flow
      // (Draft → Admin Review → Full Details → Legal/Valuation/Due Diligence
      // → Listing Requested → Live), replacing the legacy processTimeline
      // above which is still returned as-is for backward compatibility.
      const trackingPipeline = this.buildAssetTrackingPipeline(
        latest,
        latest.rwaRequest,
      );

      latestAsset = {
        assetId: latest.id,
        assetTitle: latest.assetTitle,
        liquidationStatus: this.getLiquidationStatus(latest),
        soldFractions: latest.soldFractions,
        totalFractions: latest.totalFractions,
        soldValue: parseFloat(soldValue.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        liquidationPercent,
        totalInvestors: investorCount.length,
        createdAt: latest.createdAt,
        processTimeline,
        // new fields:
        currentStage: this.getCurrentStageLabel(trackingPipeline),
        trackingPipeline,
      };
    }

    return { stats, listedAssets, latestAsset, actionCenter };
  }

  // Maps the current asset onboarding/review flow (asset.steps, asset.status,
  // and the trustee's RWAStatus sub-review) onto a fixed sequence of named
  // stages. Unlike the legacy buildProcessTimeline below, this reflects the
  // actual fields the current pipeline writes to.
  private buildAssetTrackingPipeline(
    asset: {
      status: AssetStatus;
      steps: string | null;
      isSoldOut: boolean;
    },
    rwa: { status: RWAStatus } | null,
  ): PipelineStage[] {
    const rwaStatus = rwa?.status ?? null;
    const steps = asset.steps;

    const reviewOrder: RWAStatus[] = [
      RWAStatus.LegalReviewed,
      RWAStatus.ValuationReviewed,
      RWAStatus.DueDiligence,
    ];
    const reachedIndex = rwaStatus ? reviewOrder.indexOf(rwaStatus) : -1;

    const legalStatus: StageState =
      rwaStatus === RWAStatus.LegalRejected
        ? 'rejected'
        : reachedIndex >= 0
          ? 'completed'
          : steps === '5'
            ? 'current'
            : 'pending';

    const valuationStatus: StageState =
      rwaStatus === RWAStatus.ValuationRejected
        ? 'rejected'
        : reachedIndex >= 1
          ? 'completed'
          : reachedIndex === 0
            ? 'current'
            : 'pending';

    const dueDiligenceStatus: StageState =
      rwaStatus === RWAStatus.DueDiligenceRejected
        ? 'rejected'
        : steps === '6'
          ? 'completed'
          : reachedIndex === 1
            ? 'current'
            : 'pending';

    const isLive = asset.status === AssetStatus.Available;
    const isListingRequested =
      asset.status === AssetStatus.RequestLive || isLive;

    return [
      { stage: 'Draft', status: 'completed' },
      {
        stage: 'Admin Review',
        status:
          asset.status === AssetStatus.Rejected
            ? 'rejected'
            : steps && steps !== '1'
              ? 'completed'
              : 'current',
      },
      // '3' is the broker path's in-progress state (broker submitted details
      // but hasn't invited the owner yet) — treat it like '2'.
      {
        stage: 'Full Details Submission',
        status:
          steps === '5' || steps === '6'
            ? 'completed'
            : steps === '2' || steps === '3'
              ? 'current'
              : 'pending',
      },
      { stage: 'Legal Review', status: legalStatus },
      { stage: 'Valuation Review', status: valuationStatus },
      { stage: 'Due Diligence', status: dueDiligenceStatus },
      {
        stage: 'Listing Requested',
        status: isListingRequested
          ? 'completed'
          : steps === '6'
            ? 'current'
            : 'pending',
      },
      {
        stage: 'Live',
        status: isLive
          ? 'completed'
          : asset.status === AssetStatus.RequestLive
            ? 'current'
            : 'pending',
      },
    ];
  }

  // Picks a single human-readable "current stage" out of the pipeline —
  // the first rejected/current stage, or the last stage if everything is
  // complete.
  private getCurrentStageLabel(pipeline: PipelineStage[]): string {
    const rejected = pipeline.find((p) => p.status === 'rejected');
    if (rejected) return `${rejected.stage} — Rejected`;

    const current = pipeline.find((p) => p.status === 'current');
    if (current) return current.stage;

    return pipeline[pipeline.length - 1].stage;
  }

  private getLiquidationStatus(asset: {
    isSoldOut: boolean;
    isVisible: boolean;
    soldFractions: number;
  }): string {
    if (asset.isSoldOut) return 'Fully Liquidated';
    if (asset.isVisible && asset.soldFractions > 0)
      return 'Liquidation InProgress';
    if (asset.isVisible) return 'Open For Investment';
    return 'Pending';
  }

  private buildProcessTimeline(
    asset: {
      isSoldOut: boolean;
      isVisible: boolean;
      soldFractions: number;
      updatedAt: Date;
    },
    rwa: {
      status: RWAStatus;
      createdAt: Date;
      updatedAt: Date;
      approvedAt: Date | null;
      rejectedAt: Date | null;
    } | null,
  ) {
    // Ordered list of statuses that mark each stage as past/complete
    const statusOrder: RWAStatus[] = [
      RWAStatus.Draft,
      RWAStatus.Submitted,
      RWAStatus.LegalReviewed,
      RWAStatus.LegalRejected,
      RWAStatus.ValuationReviewed,
      RWAStatus.ValuationRejected,
      RWAStatus.DueDiligence,
      RWAStatus.DueDiligenceRejected,
    ];

    const currentStatus = rwa?.status ?? null;
    const currentIndex = currentStatus
      ? statusOrder.indexOf(currentStatus)
      : -1;

    const stageStatus = (
      completedAfterIndex: number,
      inProgressIndex: number,
    ): 'completed' | 'in_progress' | 'pending' => {
      if (currentIndex > completedAfterIndex) return 'completed';
      if (currentIndex === inProgressIndex) return 'in_progress';
      return 'pending';
    };

    // Stage 1 — Asset Owner Clearance (Legal): Requested
    const stage1Status = stageStatus(0, 0);

    // Stage 2 — Valuation: RequestAccepted
    const stage2Status = stageStatus(1, 1);

    // Stage 3 — Company Approval: ReviewPending → in_progress, Reviewed → completed
    // ReviewReject is treated as rejected (shown as 'in_progress' with rejection note)
    let stage3Status: 'completed' | 'in_progress' | 'pending' | 'rejected';
    if (
      currentStatus === RWAStatus.Approved ||
      currentStatus === RWAStatus.LegalReviewed ||
      currentStatus === RWAStatus.ValuationReviewed ||
      currentStatus === RWAStatus.DueDiligence
    ) {
      stage3Status = 'completed';
    } else if (
      currentStatus === RWAStatus.LegalRejected &&
      RWAStatus.ValuationRejected &&
      RWAStatus.DueDiligenceRejected
    ) {
      stage3Status = 'rejected';
    } else if (currentStatus === RWAStatus.Submitted && RWAStatus.Draft) {
      stage3Status = 'in_progress';
    } else {
      stage3Status = 'pending';
    }

    // Stage 4 — Liquidation Start: triggered when isVisible = true after Reviewed
    let stage4Status: 'completed' | 'in_progress' | 'pending';
    if (asset.isSoldOut) {
      stage4Status = 'completed';
    } else if (asset.isVisible && asset.soldFractions > 0) {
      stage4Status = 'in_progress';
    } else if (asset.isVisible) {
      stage4Status = 'in_progress';
    } else {
      stage4Status = 'pending';
    }

    return [
      {
        stage: 'Asset Owner Clearance (Legal)',
        status: stage1Status,
        date: rwa?.createdAt ?? null,
        isEstimated: false,
      },
      {
        stage: 'Valuation',
        status: stage2Status,
        // No dedicated timestamp — use rwa.updatedAt as approximation when accepted
        date: stage2Status !== 'pending' ? (rwa?.updatedAt ?? null) : null,
        isEstimated: stage2Status !== 'pending',
      },
      {
        stage: 'Company Approval',
        status: stage3Status,
        date:
          stage3Status === 'completed'
            ? (rwa?.approvedAt ?? rwa?.updatedAt ?? null)
            : stage3Status === 'rejected'
              ? (rwa?.rejectedAt ?? rwa?.updatedAt ?? null)
              : null,
        isEstimated: false,
      },
      {
        stage: 'Liquidation Start',
        status: stage4Status,
        // When pending, show asset.createdAt as the estimated open date
        date:
          stage4Status === 'completed' || stage4Status === 'in_progress'
            ? asset.updatedAt
            : asset.updatedAt,
        isEstimated: stage4Status === 'pending',
      },
    ];
  }

  // ─── API 4: Admin Dashboard ────────────────────────────────────────────

  async getAdminDashboard(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    // Reached-milestone semantics: an RWARequest still sitting before
    // LegalReviewed is awaiting legal; sitting at LegalReviewed is awaiting
    // valuation; sitting at ValuationReviewed is awaiting due diligence.
    const legalPendingStatuses = [RWAStatus.Draft, RWAStatus.Submitted];

    const assetWhere: Prisma.AssetWhereInput = {
      ...(search && {
        assetTitle: { contains: search, mode: 'insensitive' },
      }),
    };

    const [
      totalAssets,
      availableAssetsCount,
      spvAssets,
      legalPending,
      valuationPending,
      dueDiligencePending,
      matchingAssetsCount,
      assets,
    ] = await Promise.all([
      this.prisma.asset.count(),

      this.prisma.asset.count({ where: { status: AssetStatus.Available } }),

      this.prisma.secondaryClubs.findMany({
        where: { assetId: { not: null }, spv: { isNot: null } },
        select: { assetId: true },
        distinct: ['assetId'],
      }),

      this.prisma.rWARequest.count({
        where: { status: { in: legalPendingStatuses } },
      }),
      this.prisma.rWARequest.count({
        where: { status: RWAStatus.LegalReviewed },
      }),
      this.prisma.rWARequest.count({
        where: { status: RWAStatus.ValuationReviewed },
      }),

      this.prisma.asset.count({ where: assetWhere }),

      this.prisma.asset.findMany({
        where: assetWhere,
        select: {
          id: true,
          assetTitle: true,
          status: true,
          meta: {
            where: { metaKey: { in: ['city', 'state'] } },
            select: { metaKey: true, metaValue: true },
          },
          rwaRequest: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const assetIds = assets.map((a) => a.id);

    const [spvs, votesByAsset] = await Promise.all([
      assetIds.length
        ? this.prisma.spv.findMany({
            where: { secondaryClub: { assetId: { in: assetIds } } },
            select: {
              id: true,
              name: true,
              createdAt: true,
              secondaryClub: { select: { assetId: true } },
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],
      assetIds.length
        ? this.prisma.vote.groupBy({
            by: ['assetId'],
            where: { assetId: { in: assetIds } },
            _count: { _all: true },
          })
        : [],
    ]);

    // One SPV per asset for display purposes — most recently created wins
    // if an asset somehow has more than one (e.g. across multiple clubs).
    const spvByAssetId = new Map<number, { id: number; name: string }>();
    for (const s of spvs) {
      const assetId = s.secondaryClub?.assetId;
      if (assetId != null && !spvByAssetId.has(assetId)) {
        spvByAssetId.set(assetId, { id: s.id, name: s.name });
      }
    }

    const spvIds = [...spvByAssetId.values()].map((s) => s.id);
    const memberCounts = spvIds.length
      ? await this.prisma.spvMember.groupBy({
          by: ['spvId'],
          where: { spvId: { in: spvIds } },
          _count: { _all: true },
        })
      : [];
    const memberCountBySpv = new Map(
      memberCounts.map((m) => [m.spvId, m._count._all]),
    );
    const voteCountByAsset = new Map(
      votesByAsset.map((v) => [v.assetId, v._count._all]),
    );

    const data = assets.map((asset) => {
      const metaMap = new Map(asset.meta.map((m) => [m.metaKey, m.metaValue]));
      const spv = spvByAssetId.get(asset.id) ?? null;
      const shareholdersCount = spv ? (memberCountBySpv.get(spv.id) ?? 0) : 0;
      const governanceVoteCount = voteCountByAsset.get(asset.id) ?? 0;
      const votePercentage =
        shareholdersCount > 0
          ? parseFloat(
              ((governanceVoteCount / shareholdersCount) * 100).toFixed(2),
            )
          : 0;

      return {
        assetId: asset.id,
        assetTitle: asset.assetTitle,
        spvName: spv?.name ?? null,
        location: {
          city: metaMap.get('city') ?? null,
          state: metaMap.get('state') ?? null,
        },
        assetStatus: asset.status,
        rwaStatus: asset.rwaRequest?.status ?? null,
        shareholdersCount,
        governanceVoteCount,
        votePercentage,
      };
    });

    return {
      totalAssets,
      availableAssetsCount,
      spvCreatedCount: spvAssets.length,
      pendingRwaStatus: {
        legal: legalPending,
        valuation: valuationPending,
        dueDiligence: dueDiligencePending,
        total: legalPending + valuationPending + dueDiligencePending,
      },
      assets: {
        count: matchingAssetsCount,
        skip: pagination.skip,
        take: pagination.take,
        data,
      },
    };
  }
}
