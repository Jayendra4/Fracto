import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { RWAStatus } from '../generated/prisma/enums';

const PENDING_STATUSES = [
  RWAStatus.Draft,
  RWAStatus.Submitted,
  RWAStatus.Rejected,
  RWAStatus.LegalReviewed,
  RWAStatus.LegalRejected,
  RWAStatus.ValuationReviewed,
  RWAStatus.ValuationRejected,
  RWAStatus.DueDiligence,
  RWAStatus.DueDiligenceRejected,
] as const;

const ACTIVE_ASSET_STATUSES = [RWAStatus.Submitted, RWAStatus.Draft] as const;

@Injectable()
export class TrusteeDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private startOfPrevMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1);
  }

  private endOfPrevMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
  }

  private changePercent(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }

  private timeAgo(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  private mapDisplayStatus(
    status: RWAStatus,
  ): 'Under Review' | 'Approved' | 'Rejected' {
    if (
      status === RWAStatus.LegalReviewed ||
      status === RWAStatus.ValuationReviewed ||
      status === RWAStatus.DueDiligence
    ) {
      return 'Approved';
    }
    if (
      status === RWAStatus.LegalRejected ||
      status === RWAStatus.ValuationRejected ||
      status === RWAStatus.DueDiligenceRejected
    ) {
      return 'Rejected';
    }
    return 'Under Review';
  }

  private buildLocation(
    meta: { metaKey: string; metaValue: string | null }[],
  ): string {
    const city = meta.find((m) => m.metaKey === 'city')?.metaValue ?? '';
    const state = meta.find((m) => m.metaKey === 'state')?.metaValue ?? '';
    const country = meta.find((m) => m.metaKey === 'country')?.metaValue ?? '';
    return [city, state, country ? `(${country})` : '']
      .filter(Boolean)
      .join(' ');
  }

  // ─── Main Dashboard ───────────────────────────────────────────────────────

  async getDashboard(trusteeAccountId: number) {
    const now = new Date();
    const thisMonthStart = this.startOfMonth(now);
    const prevMonthStart = this.startOfPrevMonth(now);
    const prevMonthEnd = this.endOfPrevMonth(now);

    const [
      // User stats
      totalUsers,
      totalUsersPrev,

      // Asset stats — current
      totalAssetsAgg,

      // Asset stats — previous month base
      assetsBeforeThisMonth,

      // Asset stats — prev month (for fraction comparison)
      assetsThisMonth,
      assetsPrevMonth,

      // Active asset: latest one approved by this trustee
      latestActiveAsset,

      // Pending requests
      pendingRequests,
    ] = await Promise.all([
      // Total non-deleted users (current)
      this.prisma.account.count({ where: { isDeleted: false } }),

      // Total users before this month
      this.prisma.account.count({
        where: { isDeleted: false, createdAt: { lt: thisMonthStart } },
      }),

      // Total fraction aggregates across all assets
      this.prisma.asset.aggregate({
        _sum: {
          totalFractions: true,
          soldFractions: true,
          remainingFractions: true,
        },
        _count: { id: true },
      }),

      // Assets created before this month (for count change %)
      this.prisma.asset.count({ where: { createdAt: { lt: thisMonthStart } } }),

      // Fraction totals for assets created this month
      this.prisma.asset.aggregate({
        where: { createdAt: { gte: thisMonthStart } },
        _sum: { soldFractions: true, remainingFractions: true },
      }),

      // Fraction totals for assets created last month
      this.prisma.asset.aggregate({
        where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } },
        _sum: { soldFractions: true, remainingFractions: true },
      }),

      // Latest asset reviewed/approved by this trustee
      this.prisma.rWARequest.findFirst({
        where: {
          status: { in: [...ACTIVE_ASSET_STATUSES] },
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          asset: {
            include: {
              price: true,
              meta: {
                where: { metaKey: { in: ['city', 'state', 'country'] } },
                select: { metaKey: true, metaValue: true },
              },
            },
          },
        },
      }),

      // All pending RWA requests
      this.prisma.rWARequest.findMany({
        where: { status: { in: [...PENDING_STATUSES] } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          asset: {
            include: {
              price: true,
              meta: {
                where: { metaKey: { in: ['city', 'state', 'country'] } },
                select: { metaKey: true, metaValue: true },
              },
            },
          },
        },
      }),
    ]);

    const totalAssetCount = totalAssetsAgg._count.id;
    const totalSoldFractions = totalAssetsAgg._sum.soldFractions ?? 0;
    const totalAvailableFractions = totalAssetsAgg._sum.remainingFractions ?? 0;

    const soldFractionsPrevMonth = Number(
      assetsPrevMonth._sum.soldFractions ?? 0,
    );
    const soldFractionsThisMonth = Number(
      assetsThisMonth._sum.soldFractions ?? 0,
    );
    const availableFractionsPrevMonth = Number(
      assetsPrevMonth._sum.remainingFractions ?? 0,
    );
    const availableFractionsThisMonth = Number(
      assetsThisMonth._sum.remainingFractions ?? 0,
    );

    // ── Active asset ──────────────────────────────────────────────────────
    let activeAsset: object | null = null;
    if (latestActiveAsset?.asset) {
      const a = latestActiveAsset.asset;
      const initialPrice = Number(a.price?.initialPricePerFraction ?? 0);
      const totalValue = initialPrice * a.totalFractions;
      const progress =
        a.totalFractions > 0
          ? parseFloat(((a.soldFractions / a.totalFractions) * 100).toFixed(1))
          : 0;

      activeAsset = {
        assetId: a.id,
        assetTitle: a.assetTitle,
        image: null as string | null, // resolved below
        location: this.buildLocation(a.meta),
        totalValue: parseFloat(totalValue.toFixed(2)),
        roi: a.yieldPercentage,
        progress,
        approvedAt: latestActiveAsset.approvedAt,
        status: latestActiveAsset.status,
      };

      // Fetch asset image from documents
      const assetDoc = await this.prisma.assetDocument.findFirst({
        where: { assetId: a.id, documentType: 'ASSET_IMAGE' },
        select: { documentUrl: true },
      });
      (activeAsset as any).image = assetDoc?.documentUrl ?? null;
    }

    // ── Pending requests ──────────────────────────────────────────────────
    const pendingRequestsData = pendingRequests.map((req) => {
      const a = req.asset;
      const initialPrice = Number(a.price?.initialPricePerFraction ?? 0);
      const totalValue = initialPrice * a.totalFractions;
      const displayStatus = this.mapDisplayStatus(req.status);

      return {
        requestId: req.id,
        refCode: `REQ${String(req.id).padStart(3, '0')}`,
        assetId: a.id,
        assetTitle: a.assetTitle,
        location: this.buildLocation(a.meta),
        rwaStatus: req.status,
        displayStatus,
        totalValue: parseFloat(totalValue.toFixed(2)),
        timeAgo: this.timeAgo(req.createdAt),
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      };
    });

    return {
      stats: {
        totalUsers: {
          count: totalUsers,
          changePercent: this.changePercent(totalUsers, totalUsersPrev),
          trend: totalUsers >= totalUsersPrev ? 'UP' : 'DOWN',
        },
        totalAssets: {
          count: totalAssetCount,
          changePercent: this.changePercent(
            totalAssetCount,
            assetsBeforeThisMonth,
          ),
          trend: totalAssetCount >= assetsBeforeThisMonth ? 'UP' : 'DOWN',
        },
        soldFractions: {
          count: Number(totalSoldFractions),
          changePercent: this.changePercent(
            soldFractionsThisMonth,
            soldFractionsPrevMonth,
          ),
          trend:
            soldFractionsThisMonth >= soldFractionsPrevMonth ? 'UP' : 'DOWN',
        },
        availableFractions: {
          count: Number(totalAvailableFractions),
          changePercent: this.changePercent(
            availableFractionsThisMonth,
            availableFractionsPrevMonth,
          ),
          trend:
            availableFractionsThisMonth >= availableFractionsPrevMonth
              ? 'UP'
              : 'DOWN',
        },
      },
      chartData: {
        totalAssets: totalAssetCount,
        soldFractions: Number(totalSoldFractions),
        availableFractions: Number(totalAvailableFractions),
      },
      activeAsset,
      pendingRequests: pendingRequestsData,
    };
  }
}
