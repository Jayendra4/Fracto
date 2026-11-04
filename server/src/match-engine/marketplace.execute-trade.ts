// listeners/execute-trade.listener.ts
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { WalletsService } from '../wallets';
import {
  MarketplaceMatchEngineService,
  MarketplaceOrdersMatchedQueuePayload,
} from './match-engine.service';
import {
  AccountType,
  ListingStatus,
  MatchApprovalStatus,
  TradeType,
  WalletType,
  WalletTransactionContext,
  NotificationType,
} from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { NotificationService } from '../notification/notification.service';
import { NotificationAudience, NotificationCode } from '@Common';

@Injectable()
export class ExecuteTradeListener {
  private readonly logger = new Logger(ExecuteTradeListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletsService,
    private readonly matchEngineService: MarketplaceMatchEngineService,
    private readonly notificationService: NotificationService,
  ) {}

  @OnEvent('marketplace.order.execute-trade')
  async handle(data: MarketplaceOrdersMatchedQueuePayload) {
    this.logger.log(
      `Executing trade: ASK ${data.askOrderId} ↔ BID ${data.bidOrderId} | qty: ${data.matchedQuantity} @ ₹${data.tradePrice}`,
    );

    try {
      await this.executeTrade(data);
    } catch (err) {
      this.logger.error('Execute trade error', err);
    }
  }

  private async executeTrade(data: MarketplaceOrdersMatchedQueuePayload) {
    const {
      potentialMatchId,
      askOrderId,
      bidOrderId,
      assetId,
      matchedQuantity,
    } = data;
    const tradePrice = new Prisma.Decimal(data.tradePrice);

    const [askOrder, bidOrder, asset] = await Promise.all([
      this.prisma.marketplaceListing.findUnique({ where: { id: askOrderId } }),
      this.prisma.marketplaceListing.findUnique({ where: { id: bidOrderId } }),
      this.prisma.asset.findUnique({
        where: { id: assetId },
        select: { assetTitle: true },
      }),
    ]);

    if (!askOrder || !bidOrder) {
      this.logger.error(`Order not found: ASK ${askOrderId} BID ${bidOrderId}`);
      return;
    }

    // Guard — skip if already fulfilled
    if (
      askOrder.status === ListingStatus.Fulfilled ||
      bidOrder.status === ListingStatus.Fulfilled
    ) {
      this.logger.warn('Order already fulfilled — skipping');
      return;
    }

    const totalAmount = tradePrice.mul(matchedQuantity);
    const feePercent = new Prisma.Decimal('0.01'); // 1%
    const fee = totalAmount.mul(feePercent);
    const netAmount = totalAmount;

    const bidTotalLocked = bidOrder.pricePerUnit.mul(matchedQuantity);
    const refundToBuyer = bidTotalLocked.sub(totalAmount);

    // Computed before transaction so step 8 can use them without re-declaring
    const newAskRemaining = askOrder.remainingUnits - matchedQuantity;
    const newBidRemaining = bidOrder.remainingUnits - matchedQuantity;

    const matchConsumed = await this.prisma.$transaction(async (tx) => {
      // ─── 0. ATOMICALLY CONSUME THE APPROVED POTENTIAL MATCH ───
      // Only a match still in `Approved` status can move to `Matched`. This
      // conditional update is what guarantees an approved match is turned
      // into a trade exactly once, even under concurrent/duplicate queue
      // delivery: only one caller's UPDATE ... WHERE status = 'Approved'
      // can ever affect a row.
      const { count } = await tx.marketplacePotentialMatch.updateMany({
        where: { id: potentialMatchId, status: MatchApprovalStatus.Approved },
        data: { status: MatchApprovalStatus.Matched },
      });

      if (count === 0) {
        return false;
      }

      // ─── 1. CREATE TRADE ──────────────────────────
      await tx.marketplaceTrade.create({
        data: {
          assetId,
          listingId: askOrderId,
          buyerId: bidOrder.accountId,
          sellerId: askOrder.accountId,
          tradeType: TradeType.AskFulfilled,
          pricePerUnit: tradePrice,
          units: matchedQuantity,
          totalAmount,
          fee,
          netAmount,
        },
      });

      // ─── 2. UPDATE LISTING STATUS ─────────────────
      await tx.marketplaceListing.update({
        where: { id: askOrderId },
        data: {
          remainingUnits: newAskRemaining,
          status:
            newAskRemaining === 0
              ? ListingStatus.Fulfilled
              : ListingStatus.Partial,
        },
      });

      await tx.marketplaceListing.update({
        where: { id: bidOrderId },
        data: {
          remainingUnits: newBidRemaining,
          status:
            newBidRemaining === 0
              ? ListingStatus.Fulfilled
              : ListingStatus.Partial,
        },
      });

      // ─── 3. UPDATE SELLER HOLDING ─────────────────
      await tx.holding.update({
        where: {
          accountId_assetId: {
            accountId: askOrder.accountId,
            assetId,
          },
        },
        data: {
          lockedQuantity: { decrement: matchedQuantity },
        },
      });

      // ─── 4. UPDATE BUYER HOLDING ──────────────────
      const [buyerHolding, buyerPurchases] = await Promise.all([
        tx.holding.findUnique({
          where: {
            accountId_assetId: {
              accountId: bidOrder.accountId,
              assetId,
            },
          },
        }),

        tx.assetPurchase.findMany({
          where: {
            accountId: bidOrder.accountId,
            assetId: assetId,
          },
        }),
      ]);

      if (buyerHolding) {
        const existingUnits = Number(buyerHolding.availableQuantity);
        const existingAvg = Number(buyerHolding.averageBuyPrice);
        const newTotalUnits = existingUnits + matchedQuantity;
        const newAvgPrice =
          newTotalUnits > 0
            ? (existingUnits * existingAvg +
                matchedQuantity * Number(tradePrice)) /
              newTotalUnits
            : Number(tradePrice);

        await tx.holding.update({
          where: {
            accountId_assetId: {
              accountId: bidOrder.accountId,
              assetId,
            },
          },
          data: {
            availableQuantity: { increment: matchedQuantity },
            averageBuyPrice: parseFloat(newAvgPrice.toFixed(2)),
          },
        });
      } else {
        const purchasedFractions = buyerPurchases.reduce(
          (sum, p) => sum + p.fractions,
          0,
        );

        const purchaseAmt = buyerPurchases.reduce(
          (sum, p) => sum + Number(p.totalAmount),
          0,
        );

        const totalUnits = purchasedFractions + matchedQuantity;
        const avgBuyPrice =
          totalUnits > 0
            ? new Prisma.Decimal(purchaseAmt).add(tradePrice).div(totalUnits)
            : Number(tradePrice);
        await tx.holding.create({
          data: {
            accountId: bidOrder.accountId,
            assetId,
            availableQuantity: totalUnits > 0 ? totalUnits : matchedQuantity,
            lockedQuantity: 0,
            averageBuyPrice: parseFloat(avgBuyPrice.toFixed(2)),
          },
        });
      }

      // ─── 5. UPDATE WALLETS ────────────────────────
      // Seller's netAmount is NOT credited here — it stays locked until a
      // trustee approves the settlement (see TrusteeSecondarySettlementService).
      // Only the buyer's refund of their own over-locked bid funds happens
      // immediately, since that's returning their own money, not a payout.
      if (refundToBuyer.gt(0)) {
        await this.walletService.addBalance(
          bidOrder.accountId,
          refundToBuyer,
          WalletType.Main,
          { tx, context: WalletTransactionContext.BidRefund },
        );
      }

      // ─── 6. UPDATE MARKET STATS ───────────────────
      const existing = await tx.assetMarketStat.findUnique({
        where: { assetId },
      });
      const now = new Date();

      if (!existing) {
        await tx.assetMarketStat.create({
          data: {
            assetId,
            currentPrice: tradePrice,
            openPrice24h: tradePrice,
            highPrice24h: tradePrice,
            lowPrice24h: tradePrice,
            closePrice24h: tradePrice,
            volume24h: totalAmount,
            units24h: matchedQuantity,
            priceChange24h: 0,
            lastResetAt: now,
          },
        });
      } else {
        await tx.assetMarketStat.update({
          where: { assetId },
          data: {
            currentPrice: tradePrice,
            highPrice24h: tradePrice.gt(existing.highPrice24h)
              ? tradePrice
              : existing.highPrice24h,
            lowPrice24h: tradePrice.lt(existing.lowPrice24h)
              ? tradePrice
              : existing.lowPrice24h,
            closePrice24h: tradePrice,
            volume24h: { increment: totalAmount },
            units24h: { increment: matchedQuantity },
            priceChange24h:
              existing.openPrice24h != null && existing.openPrice24h.gt(0)
                ? tradePrice
                    .sub(existing.openPrice24h)
                    .div(existing.openPrice24h)
                    .mul(100)
                : new Prisma.Decimal(0),
          },
        });
      }

      return true;
    }); // ─── END TRANSACTION ──────────────────────────

    if (!matchConsumed) {
      this.logger.warn(
        `Potential match ${potentialMatchId} was not Approved (already processed, rejected, or unknown) — skipping trade execution`,
      );
      return;
    }

    this.logger.log(
      `Trade executed ✅ | qty: ${matchedQuantity} @ ₹${tradePrice} | seller: ${askOrder.accountId} → buyer: ${bidOrder.accountId}`,
    );

    // ─── 7. SEND MATCH NOTIFICATIONS ─────────────────
    const notificationData = {
      assetId,
      assetTitle: asset?.assetTitle ?? 'the asset',
      units: matchedQuantity,
      pricePerUnit: tradePrice.toString(),
      netAmount: netAmount.toFixed(2),
    };

    const trustees = await this.prisma.account.findMany({
      where: { type: AccountType.Trustee },
      select: { id: true },
    });

    await Promise.allSettled([
      this.notificationService._sendNotification({
        code: NotificationCode.ORDER_MATCHED_BID,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: [bidOrder.accountId],
        data: notificationData,
      }),
      this.notificationService._sendNotification({
        code: NotificationCode.ORDER_MATCHED_ASK,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: [askOrder.accountId],
        data: notificationData,
      }),
      ...(trustees.length
        ? [
            this.notificationService._sendNotification({
              code: NotificationCode.REQUEST_FOR_TRUSTEE_APPROVED,
              audience: NotificationAudience.USER,
              type: NotificationType.Informational,
              userIds: trustees.map((t) => t.id),
              data: notificationData,
            }),
          ]
        : []),
    ]);

    // ─── 8. CHECK FOR MORE MATCHES ────────────────────
    if (newAskRemaining > 0) {
      this.logger.log(`ASK ${askOrderId} partially filled — re-queuing`);
      await this.matchEngineService.addOrderToMatchQueue({
        orderId: String(askOrderId),
        assetId: String(assetId),
      });
    }

    if (newBidRemaining > 0) {
      this.logger.log(`BID ${bidOrderId} partially filled — re-queuing`);
      await this.matchEngineService.addOrderToMatchQueue({
        orderId: String(bidOrderId),
        assetId: String(assetId),
      });
    }
  }
}
