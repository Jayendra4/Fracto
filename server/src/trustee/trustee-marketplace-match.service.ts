import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { WalletsService } from '../wallets';
import { NotificationService } from '../notification';
import { NotificationAudience, NotificationCode } from '@Common';
import {
  ListingStatus,
  MatchApprovalStatus,
  NotificationType,
  WalletTransactionContext,
  WalletType,
} from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { MarketplaceMatchEngineService } from '../match-engine';

@Injectable()
export class TrusteeMarketplaceMatchService {
  private readonly logger = new Logger(TrusteeMarketplaceMatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletsService,
    private readonly notificationService: NotificationService,
    private readonly matchEngineService: MarketplaceMatchEngineService,
  ) {}

  async listPotentialMatches(options?: {
    status?: MatchApprovalStatus;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.MarketplacePotentialMatchWhereInput = {
      status: options?.status,
    };

    const [count, matches] = await Promise.all([
      this.prisma.marketplacePotentialMatch.count({ where }),
      this.prisma.marketplacePotentialMatch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { select: { id: true, assetTitle: true } },
          askListing: {
            select: {
              id: true,
              accountId: true,
              pricePerUnit: true,
              account: {
                select: { id: true, firstname: true, lastname: true },
              },
            },
          },
          bidListing: {
            select: {
              id: true,
              accountId: true,
              pricePerUnit: true,
              account: {
                select: { id: true, firstname: true, lastname: true },
              },
            },
          },
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const data = matches.map((match) => ({
      id: match.id,
      assetId: match.asset.id,
      assetTitle: match.asset.assetTitle,
      matchedQuantity: match.matchedQuantity,
      tradePrice: match.tradePrice,
      status: match.status,
      ask: {
        listingId: match.askListing.id,
        accountId: match.askListing.accountId,
        pricePerUnit: match.askListing.pricePerUnit,
        seller:
          `${match.askListing.account.firstname} ${match.askListing.account.lastname}`.trim(),
      },
      bid: {
        listingId: match.bidListing.id,
        accountId: match.bidListing.accountId,
        pricePerUnit: match.bidListing.pricePerUnit,
        buyer:
          `${match.bidListing.account.firstname} ${match.bidListing.account.lastname}`.trim(),
      },
      trusteeId: match.trusteeId,
      approvedAt: match.approvedAt,
      rejectedBy: match.rejectedBy,
      rejectedAt: match.rejectedAt,
      rejectionReason: match.rejectionReason,
      createdAt: match.createdAt,
    }));

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  async approveMatch(potentialMatchId: number, trusteeId: number) {
    const potentialMatch =
      await this.prisma.marketplacePotentialMatch.findUnique({
        where: { id: potentialMatchId },
      });

    if (!potentialMatch) {
      throw new NotFoundException('Potential match not found');
    }

    const { count } = await this.prisma.marketplacePotentialMatch.updateMany({
      where: {
        id: potentialMatchId,
        status: MatchApprovalStatus.PendingTrusteeApproval,
      },
      data: {
        status: MatchApprovalStatus.Approved,
        trusteeId,
        approvedAt: new Date(),
      },
    });

    if (count === 0) {
      throw new BadRequestException(
        `Potential match is already ${potentialMatch.status} and cannot be approved`,
      );
    }

    await this.matchEngineService.addMatchedOrderToQueue({
      potentialMatchId: potentialMatch.id,
      askOrderId: potentialMatch.askListingId,
      bidOrderId: potentialMatch.bidListingId,
      assetId: potentialMatch.assetId,
      matchedQuantity: potentialMatch.matchedQuantity,
      tradePrice: potentialMatch.tradePrice,
    });

    return this.prisma.marketplacePotentialMatch.findUnique({
      where: { id: potentialMatchId },
    });
  }

  async rejectMatch(
    potentialMatchId: number,
    trusteeId: number,
    rejectionReason: string,
  ) {
    const potentialMatch =
      await this.prisma.marketplacePotentialMatch.findUnique({
        where: { id: potentialMatchId },
        include: {
          askListing: true,
          bidListing: true,
          asset: { select: { assetTitle: true } },
        },
      });

    if (!potentialMatch) {
      throw new NotFoundException('Potential match not found');
    }

    const { count } = await this.prisma.marketplacePotentialMatch.updateMany({
      where: {
        id: potentialMatchId,
        status: MatchApprovalStatus.PendingTrusteeApproval,
      },
      data: {
        status: MatchApprovalStatus.Rejected,
        rejectedBy: trusteeId,
        rejectedAt: new Date(),
        rejectionReason,
      },
    });

    if (count === 0) {
      throw new BadRequestException(
        `Potential match is already ${potentialMatch.status} and cannot be rejected`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const { askListing, bidListing } = potentialMatch;

      if (
        askListing.status === ListingStatus.Active ||
        askListing.status === ListingStatus.Partial
      ) {
        await tx.marketplaceListing.update({
          where: { id: askListing.id },
          data: { status: ListingStatus.Cancelled },
        });

        await tx.holding.update({
          where: {
            accountId_assetId: {
              accountId: askListing.accountId,
              assetId: askListing.assetId,
            },
          },
          data: {
            lockedQuantity: { decrement: askListing.remainingUnits },
            availableQuantity: { increment: askListing.remainingUnits },
          },
        });
      }

      if (
        bidListing.status === ListingStatus.Active ||
        bidListing.status === ListingStatus.Partial
      ) {
        await tx.marketplaceListing.update({
          where: { id: bidListing.id },
          data: { status: ListingStatus.Cancelled },
        });

        const refundAmount = new Prisma.Decimal(bidListing.pricePerUnit).mul(
          bidListing.remainingUnits,
        );

        if (refundAmount.gt(0)) {
          await this.walletService.addBalance(
            bidListing.accountId,
            refundAmount,
            WalletType.Main,
            { tx, context: WalletTransactionContext.BidRefund },
          );
        }
      }
    });

    try {
      await this.notificationService._sendNotification({
        code: NotificationCode.MARKETPLACE_MATCH_REJECTED,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: [
          potentialMatch.askListing.accountId,
          potentialMatch.bidListing.accountId,
        ],
        createdById: trusteeId,
        data: {
          assetId: potentialMatch.assetId,
          assetTitle: potentialMatch.asset.assetTitle,
          rejectionReason,
        },
      });
    } catch (err) {
      this.logger.error(
        'Failed to notify listing owners of match rejection',
        err,
      );
    }

    return this.prisma.marketplacePotentialMatch.findUnique({
      where: { id: potentialMatchId },
    });
  }
}
