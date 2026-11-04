import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { WalletsService } from '../wallets';
import { NotificationService } from '../notification';
import { NotificationAudience, NotificationCode } from '@Common';
import {
  TradeSettlementStatus,
  WalletType,
  WalletTransactionContext,
  NotificationType,
} from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class TrusteeSecondarySettlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletsService,
    private readonly notificationService: NotificationService,
  ) {}

  // Secondary-market ask/bid trades matched by the match engine, awaiting
  // (or having received) trustee approval before the seller is paid out.
  async listSettlements(options?: {
    status?: TradeSettlementStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    const where: Prisma.MarketplaceTradeWhereInput = {
      settlementStatus: options?.status,
      ...(search && {
        asset: { assetTitle: { contains: search, mode: 'insensitive' } },
      }),
    };

    const [count, trades] = await Promise.all([
      this.prisma.marketplaceTrade.count({ where }),
      this.prisma.marketplaceTrade.findMany({
        where,
        orderBy: { tradedAt: 'desc' },
        include: {
          asset: { select: { id: true, assetTitle: true } },
          seller: { select: { id: true, firstname: true, lastname: true } },
          buyer: { select: { id: true, firstname: true, lastname: true } },
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const data = trades.map((trade) => ({
      tradeId: trade.id,
      assetId: trade.asset.id,
      assetTitle: trade.asset.assetTitle,
      units: trade.units,
      pricePerUnit: trade.pricePerUnit,
      totalAmount: trade.totalAmount,
      fee: trade.fee,
      netAmount: trade.netAmount,
      seller: trade.seller
        ? {
            id: trade.seller.id,
            name: `${trade.seller.firstname} ${trade.seller.lastname}`.trim(),
          }
        : null,
      buyer: trade.buyer
        ? {
            id: trade.buyer.id,
            name: `${trade.buyer.firstname} ${trade.buyer.lastname}`.trim(),
          }
        : null,
      settlementStatus: trade.settlementStatus,
      tradedAt: trade.tradedAt,
      settledAt: trade.settledAt,
    }));

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  // Credits the seller's netAmount into their wallet and marks the trade settled.
  async approveSettlement(tradeId: number, trusteeId: number) {
    const trade = await this.prisma.marketplaceTrade.findUnique({
      where: { id: tradeId },
      include: { asset: { select: { assetTitle: true } } },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.settlementStatus === TradeSettlementStatus.Approved) {
      throw new Error('Trade settlement already approved');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.marketplaceTrade.update({
        where: { id: tradeId },
        data: {
          settlementStatus: TradeSettlementStatus.Approved,
          trusteeId,
          settledAt: new Date(),
        },
      });

      await this.walletService.addBalance(
        trade.sellerId,
        trade.netAmount,
        WalletType.Main,
        {
          tx,
          context: WalletTransactionContext.MarketSell,
          entityId: BigInt(trade.id),
        },
      );

      return updated;
    });

    try {
      await this.notificationService._sendNotification({
        code: NotificationCode.SETTLEMENT_APPROVED,
        audience: NotificationAudience.USER,
        type: NotificationType.Transactional,
        userIds: [trade.sellerId],
        createdById: trusteeId,
        data: {
          assetId: trade.assetId,
          assetTitle: trade.asset.assetTitle,
          netAmount: trade.netAmount.toFixed(2),
        },
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }

    return updated;
  }
}
