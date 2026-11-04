import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  AccountStatus,
  AccountType,
  PaymentRequestType,
  RequestStatus,
  TradeType,
} from '../generated/prisma/enums';

type RevenueFilter = 'daily' | 'weekly' | 'monthly' | 'yearly';

@Injectable()
export class AdminDashboardService {
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

  private formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }

  private dayLabel(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
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
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`;
  }

  private monthLabel(date: Date): string {
    const months = [
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
    return months[date.getMonth()];
  }

  // ─── Main Dashboard ───────────────────────────────────────────────────────

  async getDashboard() {
    const now = new Date();
    const thisMonthStart = this.startOfMonth(now);
    const prevMonthStart = this.startOfPrevMonth(now);
    const prevMonthEnd = this.endOfPrevMonth(now);

    const [
      totalUsers,
      activeUsers,
      usersByType,
      newUsersThisMonth,
      totalUsersPrev,
      activeUsersPrev,
      newUsersPrevMonth,
      revenueThisMonth,
      revenuePrevMonth,
      pendingDeposits,
      pendingWithdrawals,
      immediateSaleTransactions,
      immediateSaleCommission,
      marketplaceAssets,
    ] = await Promise.all([
      // Total non-deleted users
      this.prisma.account.count({ where: { isDeleted: false } }),

      // Active users
      this.prisma.account.count({
        where: { isDeleted: false, status: AccountStatus.Active },
      }),

      // Group by type
      this.prisma.account.groupBy({
        by: ['type'],
        where: { isDeleted: false },
        _count: { id: true },
      }),

      // New users this month
      this.prisma.account.count({
        where: { isDeleted: false, createdAt: { gte: thisMonthStart } },
      }),

      // Total users created before this month (prev base)
      this.prisma.account.count({
        where: { isDeleted: false, createdAt: { lt: thisMonthStart } },
      }),

      // Active users created before this month
      this.prisma.account.count({
        where: {
          isDeleted: false,
          status: AccountStatus.Active,
          createdAt: { lt: thisMonthStart },
        },
      }),

      // New users last month
      this.prisma.account.count({
        where: {
          isDeleted: false,
          createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
        },
      }),

      // Revenue this month (15% fee on immediate-sell trades)
      this.prisma.marketplaceTrade.aggregate({
        where: {
          tradeType: TradeType.MarketSell,
          buyerRole: 'admin',
          tradedAt: { gte: thisMonthStart },
        },
        _sum: { fee: true },
      }),

      // Revenue last month
      this.prisma.marketplaceTrade.aggregate({
        where: {
          tradeType: TradeType.MarketSell,
          buyerRole: 'admin',
          tradedAt: { gte: prevMonthStart, lte: prevMonthEnd },
        },
        _sum: { fee: true },
      }),

      // Pending deposit requests
      this.prisma.paymentRequest.count({
        where: {
          requestType: PaymentRequestType.Deposit,
          status: RequestStatus.Pending,
        },
      }),

      // Pending withdrawal requests
      this.prisma.paymentRequest.count({
        where: {
          requestType: PaymentRequestType.Withdraw,
          status: RequestStatus.Pending,
        },
      }),

      // Total completed immediate-sell transactions (all time)
      this.prisma.marketplaceTrade.count({
        where: { tradeType: TradeType.MarketSell, buyerRole: 'admin' },
      }),

      // Total commission earned from immediate-sell (all time)
      this.prisma.marketplaceTrade.aggregate({
        where: { tradeType: TradeType.MarketSell, buyerRole: 'admin' },
        _sum: { fee: true },
      }),

      // Assets listed on marketplace
      this.prisma.asset.count({ where: { isMarketplace: true } }),
    ]);

    const revenueNow = Number(revenueThisMonth._sum.fee ?? 0);
    const revenuePrev = Number(revenuePrevMonth._sum.fee ?? 0);

    const typeMap: Record<string, number> = {};
    for (const row of usersByType) {
      typeMap[row.type] = row._count.id;
    }

    return {
      totalUsers: {
        count: totalUsers,
        changePercent: this.changePercent(totalUsers, totalUsersPrev),
        trend: totalUsers >= totalUsersPrev ? 'UP' : 'DOWN',
      },
      activeUsers: {
        count: activeUsers,
        changePercent: this.changePercent(activeUsers, activeUsersPrev),
        trend: activeUsers >= activeUsersPrev ? 'UP' : 'DOWN',
      },
      usersByType: {
        investor: typeMap[AccountType.CorporateInvestor] ?? 0,
        assetOwner: typeMap[AccountType.AssetOwner] ?? 0,
        company: typeMap[AccountType.Company] ?? 0,
        broker: typeMap[AccountType.Broker] ?? 0,
        trustee: typeMap[AccountType.Trustee] ?? 0,
        developer: typeMap[AccountType.Developer] ?? 0,
        director: typeMap[AccountType.Director] ?? 0,
      },
      revenue: {
        amount: parseFloat(revenueNow.toFixed(2)),
        changePercent: this.changePercent(revenueNow, revenuePrev),
        trend: revenueNow >= revenuePrev ? 'UP' : 'DOWN',
      },
      growth: {
        newUsersThisMonth,
        changePercent: this.changePercent(newUsersThisMonth, newUsersPrevMonth),
        trend: newUsersThisMonth >= newUsersPrevMonth ? 'UP' : 'DOWN',
      },
      pendingRequests: {
        deposit: pendingDeposits,
        withdrawal: pendingWithdrawals,
      },
      immediateSaleTransactions: {
        count: immediateSaleTransactions,
        label: 'Total completed transactions',
      },
      immediateSaleCommission: {
        amount: parseFloat(
          Number(immediateSaleCommission._sum.fee ?? 0).toFixed(2),
        ),
        label: 'Total commission earned',
      },
      marketplaceAssets: {
        count: marketplaceAssets,
        label: 'Total listed assets',
      },
    };
  }

  // ─── Revenue Chart ────────────────────────────────────────────────────────

  async getRevenueChart(filter: RevenueFilter = 'monthly') {
    switch (filter) {
      case 'daily':
        return this.buildDailyChart();
      case 'weekly':
        return this.buildWeeklyChart();
      case 'monthly':
        return this.buildMonthlyChart();
      case 'yearly':
        return this.buildYearlyChart();
    }
  }

  // Hourly buckets for the last 24 hours — labels: "12 AM", "1 AM", …, "11 PM"
  private async buildDailyChart() {
    const since = new Date();
    since.setHours(since.getHours() - 23, 0, 0, 0);

    const trades = await this.prisma.marketplaceTrade.findMany({
      where: {
        tradeType: TradeType.MarketSell,
        buyerRole: 'admin',
        tradedAt: { gte: since },
      },
      select: { fee: true, tradedAt: true },
    });

    // Build map: hour-of-day → revenue (using the actual hour slot in the 24-window)
    const map = new Map<number, number>(); // key = absolute hour slot (0–23 from since)
    for (const t of trades) {
      const slotIndex = Math.floor(
        (t.tradedAt.getTime() - since.getTime()) / (60 * 60 * 1000),
      );
      map.set(slotIndex, (map.get(slotIndex) ?? 0) + Number(t.fee));
    }

    const data: { label: string; revenue: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const slotDate = new Date(since.getTime() + i * 60 * 60 * 1000);
      data.push({
        label: this.formatHour(slotDate.getHours()),
        revenue: parseFloat((map.get(i) ?? 0).toFixed(2)),
      });
    }

    return { filter: 'daily', data };
  }

  // Daily buckets for the last 7 days — labels: "Sun May 19", "Mon May 20", …
  private async buildWeeklyChart() {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const trades = await this.prisma.marketplaceTrade.findMany({
      where: {
        tradeType: TradeType.MarketSell,
        buyerRole: 'admin',
        tradedAt: { gte: since },
      },
      select: { fee: true, tradedAt: true },
    });

    const map = new Map<string, number>(); // key = YYYY-MM-DD
    for (const t of trades) {
      const key = t.tradedAt.toISOString().split('T')[0];
      map.set(key, (map.get(key) ?? 0) + Number(t.fee));
    }

    const data: { label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split('T')[0];
      data.push({
        label: this.dayLabel(d),
        revenue: parseFloat((map.get(key) ?? 0).toFixed(2)),
      });
    }

    return { filter: 'weekly', data };
  }

  // Daily buckets for every day in the current month — labels: "May 1", "May 2", …
  private async buildMonthlyChart() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const trades = await this.prisma.marketplaceTrade.findMany({
      where: {
        tradeType: TradeType.MarketSell,
        buyerRole: 'admin',
        tradedAt: { gte: monthStart },
      },
      select: { fee: true, tradedAt: true },
    });

    const map = new Map<string, number>(); // key = YYYY-MM-DD
    for (const t of trades) {
      const key = t.tradedAt.toISOString().split('T')[0];
      map.set(key, (map.get(key) ?? 0) + Number(t.fee));
    }

    const months = [
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

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    const data: { label: string; revenue: number }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      const key = d.toISOString().split('T')[0];
      data.push({
        label: `${months[now.getMonth()]} ${day}`,
        revenue: parseFloat((map.get(key) ?? 0).toFixed(2)),
      });
    }

    return { filter: 'monthly', data };
  }

  // Monthly buckets for the current calendar year — labels: "Jan", "Feb", …, "Dec"
  private async buildYearlyChart() {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);

    const trades = await this.prisma.marketplaceTrade.findMany({
      where: {
        tradeType: TradeType.MarketSell,
        buyerRole: 'admin',
        tradedAt: { gte: yearStart },
      },
      select: { fee: true, tradedAt: true },
    });

    const map = new Map<number, number>(); // key = month index 0–11
    for (const t of trades) {
      const m = t.tradedAt.getMonth();
      map.set(m, (map.get(m) ?? 0) + Number(t.fee));
    }

    const data: { label: string; revenue: number }[] = [];
    for (let m = 0; m < 12; m++) {
      data.push({
        label: this.monthLabel(new Date(now.getFullYear(), m, 1)),
        revenue: parseFloat((map.get(m) ?? 0).toFixed(2)),
      });
    }

    return { filter: 'yearly', data };
  }
}
