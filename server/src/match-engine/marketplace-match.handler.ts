import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { NotificationService } from '../notification/notification.service';
import { NotificationAudience, NotificationCode } from '@Common';
import {
  AccountType,
  ListingStatus,
  ListingType,
  MatchApprovalStatus,
  NotificationType,
} from '../generated/prisma/enums';

@Injectable()
export class MarketplaceMatchHandler {
  private readonly logger = new Logger(MarketplaceMatchHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private async getBusyListingIds(assetId: number): Promise<number[]> {
    const inFlight = await this.prisma.marketplacePotentialMatch.findMany({
      where: {
        assetId,
        status: {
          in: [
            MatchApprovalStatus.PendingTrusteeApproval,
            MatchApprovalStatus.Approved,
          ],
        },
      },
      select: { askListingId: true, bidListingId: true },
    });

    return inFlight.flatMap((m) => [m.askListingId, m.bidListingId]);
  }

  private async createPotentialMatch(params: {
    assetId: number;
    askListingId: number;
    bidListingId: number;
    matchedQuantity: number;
    tradePrice: any;
  }) {
    const potentialMatch = await this.prisma.marketplacePotentialMatch.create({
      data: {
        assetId: params.assetId,
        askListingId: params.askListingId,
        bidListingId: params.bidListingId,
        matchedQuantity: params.matchedQuantity,
        tradePrice: params.tradePrice,
        status: MatchApprovalStatus.PendingTrusteeApproval,
      },
      include: { asset: { select: { assetTitle: true } } },
    });

    this.logger.log(
      `Potential match ${potentialMatch.id} created — ASK ${params.askListingId} ↔ BID ${params.bidListingId} — awaiting trustee approval`,
    );

    try {
      const trustees = await this.prisma.account.findMany({
        where: { type: AccountType.Trustee },
        select: { id: true },
      });

      if (trustees.length) {
        await this.notificationService._sendNotification({
          code: NotificationCode.MARKETPLACE_MATCH_PENDING_TRUSTEE_APPROVAL,
          audience: NotificationAudience.USER,
          type: NotificationType.Informational,
          userIds: trustees.map((t) => t.id),
          data: {
            assetId: params.assetId,
            assetTitle: potentialMatch.asset.assetTitle,
            matchedQuantity: params.matchedQuantity,
            tradePrice: params.tradePrice.toString(),
          },
        });
      }
    } catch (err) {
      this.logger.error('Failed to notify trustees of potential match', err);
    }

    return potentialMatch;
  }

  //  Find best ASK for incoming BID
  private async findAskForBid(bidOrder: any, assetId: number) {
    const busyListingIds = await this.getBusyListingIds(assetId);

    if (busyListingIds.includes(bidOrder.id)) {
      this.logger.log(
        `BID ${bidOrder.id} already has a potential match awaiting trustee review — skipping`,
      );
      return;
    }

    const bestAsk = await this.prisma.marketplaceListing.findFirst({
      where: {
        assetId,
        type: ListingType.Ask,
        status: { in: [ListingStatus.Active, ListingStatus.Partial] },
        pricePerUnit: { lte: bidOrder.pricePerUnit }, // ask <= bid
        accountId: { not: bidOrder.accountId }, // no self-match
        id: { notIn: busyListingIds },
      },
      orderBy: [
        { pricePerUnit: 'asc' }, // lowest ask first
        { createdAt: 'asc' }, // oldest first (time priority)
      ],
    });

    if (!bestAsk) {
      this.logger.log(
        `No matching ASK found for BID ${bidOrder.id} @ ₹${bidOrder.pricePerUnit}`,
      );
      return;
    }

    this.logger.log(
      `Potential match: BID ${bidOrder.id} @ ₹${bidOrder.pricePerUnit} ↔ ASK ${bestAsk.id} @ ₹${bestAsk.pricePerUnit}`,
    );

    const matchedQuantity = Math.min(
      bidOrder.remainingUnits,
      bestAsk.remainingUnits,
    );

    await this.createPotentialMatch({
      assetId,
      askListingId: bestAsk.id,
      bidListingId: bidOrder.id,
      matchedQuantity,
      tradePrice: bestAsk.pricePerUnit, // trade at ASK price
    });
  }

  private async findBidForAsk(askOrder: any, assetId: number) {
    const busyListingIds = await this.getBusyListingIds(assetId);

    if (busyListingIds.includes(askOrder.id)) {
      this.logger.log(
        `ASK ${askOrder.id} already has a potential match awaiting trustee review — skipping`,
      );
      return;
    }

    const bestBid = await this.prisma.marketplaceListing.findFirst({
      where: {
        assetId,
        type: ListingType.Bid,
        status: { in: [ListingStatus.Active, ListingStatus.Partial] },
        pricePerUnit: { gte: askOrder.pricePerUnit }, // bid >= ask
        accountId: { not: askOrder.accountId }, // no self-match
        id: { notIn: busyListingIds },
      },
      orderBy: [
        { pricePerUnit: 'desc' }, // highest bid first
        { createdAt: 'asc' }, // oldest first (time priority)
      ],
    });

    if (!bestBid) {
      this.logger.log(
        `No matching BID found for ASK ${askOrder.id} @ ₹${askOrder.pricePerUnit}`,
      );
      return;
    }

    this.logger.log(
      `Potential match: ASK ${askOrder.id} @ ₹${askOrder.pricePerUnit} ↔ BID ${bestBid.id} @ ₹${bestBid.pricePerUnit}`,
    );

    const matchedQuantity = Math.min(
      askOrder.remainingUnits,
      bestBid.remainingUnits,
    );

    await this.createPotentialMatch({
      assetId,
      askListingId: askOrder.id,
      bidListingId: bestBid.id,
      matchedQuantity,
      tradePrice: askOrder.pricePerUnit, // trade at ASK price
    });
  }

  /**
   * FIND MATCH
   */
  @OnEvent('marketplace.order.find-match')
  async findMatch(data: { orderId: number; assetId: number }) {
    const assetId = Number(data.assetId);
    const orderId = Number(data.orderId);
    this.logger.log(`Finding match for order ${orderId} asset ${assetId}`);
    try {
      const currentOrder = await this.prisma.marketplaceListing.findUnique({
        where: { id: orderId },
      });

      if (!currentOrder) {
        this.logger.warn(`Order ${orderId} not found`);
        return;
      }

      if (
        currentOrder.status !== ListingStatus.Active &&
        currentOrder.status !== ListingStatus.Partial
      ) {
        this.logger.warn(`Order ${orderId} is not active`);
        return;
      }

      if (currentOrder.type === ListingType.Ask) {
        // Current is ASK (sell) → find best BID (buy) with price >= ask price
        await this.findBidForAsk(currentOrder, assetId);
      } else {
        // Current is BID (buy) → find best ASK (sell) with price <= bid price
        await this.findAskForBid(currentOrder, assetId);
      }
    } catch (error) {
      this.logger.error(`Find match error for order ${orderId}`, error);
    }
  }
}
