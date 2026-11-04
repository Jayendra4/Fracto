import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bidSellConfigFactory } from '@Config';
import { PrismaService } from '../prisma';
import { AccountsService } from '../accounts';
import { WalletsService } from '../wallets';
import { Prisma } from '../generated/prisma/client';
import {
  ListingStatus,
  ListingType,
  NotificationType,
  TradeType,
  WalletTransactionContext,
  WalletType,
} from '../generated/prisma/enums';
import { ConfigType } from '@nestjs/config';
import { MarketplaceMatchEngineService } from '../match-engine';
import { NotificationService } from '../notification';
import { AdminNotificationCode, NotificationAudience } from '@Common';

@Injectable()
export class MarketplaceService {
  constructor(
    @Inject(bidSellConfigFactory.KEY)
    private readonly config: ConfigType<typeof bidSellConfigFactory>,
    private readonly prisma: PrismaService,
    private readonly accountService: AccountsService,
    private readonly walletService: WalletsService,
    private readonly matchEngineService: MarketplaceMatchEngineService,
    private readonly notificationService: NotificationService,
  ) {}

  private getTimeAgo(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  }
  // ─── 3A: Ask to Sell ──────────────────────────────────
  async createAskListing(data: {
    accountId: number;
    assetId: number;
    pricePerUnit: number;
    totalUnits: number;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      // Check holding first
      let holding = await tx.holding.findUnique({
        where: {
          accountId_assetId: {
            accountId: data.accountId,
            assetId: data.assetId,
          },
        },
      });

      let availableUnits = 0;

      if (holding) {
        //  Holding exists — use it
        availableUnits = Number(holding.availableQuantity);
      } else {
        //  No holding — check AssetPurchase
        const purchases = await tx.assetPurchase.findMany({
          where: {
            accountId: data.accountId,
            assetId: data.assetId,
          },
          select: { fractions: true, totalAmount: true },
        });

        if (!purchases.length) {
          throw new BadRequestException(
            'You do not own any units of this asset',
          );
        }

        const totalFractions = purchases.reduce(
          (sum, p) => sum + p.fractions,
          0,
        );
        const totalInvested = purchases.reduce(
          (sum, p) => sum + Number(p.totalAmount),
          0,
        );
        const avgBuyPrice =
          totalFractions > 0 ? totalInvested / totalFractions : 0;

        availableUnits = totalFractions;

        //  Create holding from AssetPurchase
        holding = await tx.holding.create({
          data: {
            accountId: data.accountId,
            assetId: data.assetId,
            availableQuantity: totalFractions,
            lockedQuantity: 0,
            averageBuyPrice: parseFloat(avgBuyPrice.toFixed(2)),
          },
        });
      }

      //  CHECK AVAILABLE QUANTITY
      if (availableUnits < data.totalUnits) {
        throw new BadRequestException(
          `Insufficient units. Available: ${availableUnits}`,
        );
      }

      //  CHECK DUPLICATE ACTIVE ASK
      const existingAsk = await tx.marketplaceListing.findFirst({
        where: {
          accountId: data.accountId,
          assetId: data.assetId,
          type: ListingType.Ask,
          status: {
            in: [ListingStatus.Active, ListingStatus.Partial],
          },
        },
      });

      if (existingAsk) {
        throw new BadRequestException('You already have an active ask listing');
      }

      //  LOCK HOLDINGS
      await tx.holding.update({
        where: {
          accountId_assetId: {
            accountId: data.accountId,
            assetId: data.assetId,
          },
        },
        data: {
          availableQuantity: { decrement: data.totalUnits },
          lockedQuantity: { increment: data.totalUnits },
        },
      });

      //  CREATE ASK LISTING
      const listing = await tx.marketplaceListing.create({
        data: {
          assetId: data.assetId,
          accountId: data.accountId,
          type: ListingType.Ask,
          pricePerUnit: data.pricePerUnit,
          totalUnits: data.totalUnits,
          remainingUnits: data.totalUnits,
          status: ListingStatus.Active,
        },
      });

      //  ADD TO MATCH QUEUE
      await this.matchEngineService.addOrderToMatchQueue({
        orderId: listing.id.toString(),
        assetId: listing.assetId.toString(),
      });

      return listing;
    });
  }

  // ─── 3B: Place Bid ────────────────────────────────────
  async placeBid(data: {
    accountId: number;
    assetId: number;
    bidPricePerUnit: number;
    units: number;
  }) {
    const totalBidAmount = new Prisma.Decimal(
      data.bidPricePerUnit * data.units,
    );

    const walletAmount = await this.walletService.getBalanceOf(
      data.accountId,
      WalletType.Main,
    );

    const walletBalance = new Prisma.Decimal(walletAmount);

    if (walletBalance.lt(totalBidAmount)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    return await this.prisma.$transaction(async (tx) => {
      await this.walletService.subtractBalance(
        data.accountId,
        totalBidAmount,
        WalletType.Main,
        {
          tx,
          context: WalletTransactionContext.BidLock,
        },
      );

      const listing = await tx.marketplaceListing.create({
        data: {
          assetId: data.assetId,
          accountId: data.accountId,
          type: ListingType.Bid,
          pricePerUnit: data.bidPricePerUnit,
          totalUnits: data.units,
          remainingUnits: data.units,
          status: ListingStatus.Active,
        },
      });

      /**
       * ADD TO MATCH QUEUE
       */
      await this.matchEngineService.addOrderToMatchQueue({
        orderId: listing.id.toString(),

        assetId: listing.assetId.toString(),
      });

      return listing;
    });
  }

  // ─── 3C: Immediate Sell (Market Price) ────────────────
  // async immediateSell(data: {
  //   sellerId: number;
  //   assetId: number;
  //   units: number;
  //   password: string;
  // }) {
  //   const feePercent = Number(this.config.bidSell);
  //   console.log('feePercent', feePercent);

  //   const user = await this.accountService.getById(data.sellerId);
  //   const checkPassword = await this.accountService.validateCredentials(
  //     user.email,
  //     data.password,
  //   );
  //   if (!checkPassword) {
  //     throw new Error('Password is incorrect');
  //   }
  //   // ✅ Check seller holding
  //   const sellerHolding = await this.prisma.holding.findUnique({
  //     where: {
  //       accountId_assetId: {
  //         accountId: data.sellerId,
  //         assetId: data.assetId,
  //       },
  //     },
  //   });

  //   // ✅ Fallback to AssetPurchase if holding not found
  //   let availableUnits = 0;
  //   if (sellerHolding) {
  //     availableUnits = Number(sellerHolding.availableQuantity);
  //   } else {
  //     const purchases = await this.prisma.assetPurchase.findMany({
  //       where: { accountId: data.sellerId, assetId: data.assetId },
  //       select: { fractions: true },
  //     });
  //     availableUnits = purchases.reduce((sum, p) => sum + p.fractions, 0);
  //   }

  //   if (availableUnits < data.units) {
  //     throw new BadRequestException(
  //       `Insufficient units. Available: ${availableUnits}`,
  //     );
  //   }

  //   // Find best ask listings (lowest price first)
  //   const asks = await this.prisma.marketplaceListing.findMany({
  //     where: {
  //       assetId: data.assetId,
  //       type: ListingType.Ask,
  //       status: ListingStatus.Active,
  //       accountId: { not: data.sellerId },
  //     },
  //     orderBy: { pricePerUnit: 'asc' },
  //   });

  //   if (!asks.length) {
  //     throw new BadRequestException('No buyers available at market price');
  //   }

  //   const marketPrice = asks[0].pricePerUnit;
  //   const totalAmount = marketPrice.mul(data.units);
  //   const fee = totalAmount.mul(new Prisma.Decimal(feePercent).div(100));
  //   const netAmount = totalAmount.sub(fee);

  //   return await this.prisma.$transaction(async (tx) => {
  //     const bestAsk = asks[0];

  //     // Update listing status
  //     await tx.marketplaceListing.update({
  //       where: { id: bestAsk.id },
  //       data: {
  //         remainingUnits: { decrement: data.units },
  //         status:
  //           bestAsk.remainingUnits - data.units <= 0
  //             ? ListingStatus.Fulfilled
  //             : ListingStatus.Active,
  //       },
  //     });

  //     // Create trade record
  //     const trade = await tx.marketplaceTrade.create({
  //       data: {
  //         assetId: data.assetId,
  //         listingId: bestAsk.id,
  //         buyerId: bestAsk.accountId,
  //         sellerId: data.sellerId,
  //         tradeType: TradeType.MarketSell,
  //         pricePerUnit: marketPrice,
  //         units: data.units,
  //         totalAmount,
  //         fee,
  //         netAmount,
  //       },
  //     });

  //     // ✅ Update seller holding — deduct units
  //     if (sellerHolding) {
  //       await tx.holding.update({
  //         where: {
  //           accountId_assetId: {
  //             accountId: data.sellerId,
  //             assetId: data.assetId,
  //           },
  //         },
  //         data: {
  //           availableQuantity: { decrement: data.units },
  //         },
  //       });
  //     } else {
  //       // Fallback — update AssetPurchase
  //       await tx.assetPurchase.updateMany({
  //         where: { accountId: data.sellerId, assetId: data.assetId },
  //         data: { fractions: { decrement: data.units } },
  //       });
  //     }

  //     // ✅ Update buyer holding — add units with avg buy price calculation
  //     const buyerHolding = await tx.holding.findUnique({
  //       where: {
  //         accountId_assetId: {
  //           accountId: bestAsk.accountId,
  //           assetId: data.assetId,
  //         },
  //       },
  //     });

  //     if (buyerHolding) {
  //       // ✅ Recalculate average buy price
  //       const existingUnits = Number(buyerHolding.availableQuantity);
  //       const existingAvgPrice = Number(buyerHolding.averageBuyPrice);
  //       const newTotalUnits = existingUnits + data.units;
  //       const newAvgPrice =
  //         newTotalUnits > 0
  //           ? (existingUnits * existingAvgPrice +
  //               data.units * Number(marketPrice)) /
  //             newTotalUnits
  //           : Number(marketPrice);

  //       await tx.holding.update({
  //         where: {
  //           accountId_assetId: {
  //             accountId: bestAsk.accountId,
  //             assetId: data.assetId,
  //           },
  //         },
  //         data: {
  //           availableQuantity: { increment: data.units },
  //           averageBuyPrice: parseFloat(newAvgPrice.toFixed(2)),
  //         },
  //       });
  //     } else {
  //       // ✅ Create holding for buyer if not exists
  //       await tx.holding.create({
  //         data: {
  //           accountId: bestAsk.accountId,
  //           assetId: data.assetId,
  //           availableQuantity: data.units,
  //           lockedQuantity: 0,
  //           averageBuyPrice: Number(marketPrice),
  //         },
  //       });
  //     }

  //     // Credit seller wallet
  //     await this.walletService.addBalance(
  //       data.sellerId,
  //       netAmount,
  //       WalletType.Main,
  //       { tx, context: WalletTransactionContext.MarketSell },
  //     );

  //     // ✅ Update AssetMarketStat
  //     await tx.assetMarketStat.upsert({
  //       where: { assetId: data.assetId },
  //       update: {
  //         currentPrice: marketPrice,
  //         volume24h: { increment: totalAmount },
  //         units24h: { increment: data.units },
  //       },
  //       create: {
  //         assetId: data.assetId,
  //         currentPrice: marketPrice,
  //         volume24h: totalAmount,
  //         units24h: data.units,
  //         highPrice24h: marketPrice,
  //         lowPrice24h: marketPrice,
  //         priceChange24h: 0,
  //       },
  //     });

  //     return { trade, marketPrice, netAmount, fee };
  //   });
  // }

  async immediateSell(data: {
    sellerId: number;
    assetId: number;
    units: number;
    password: string;
  }) {
    const user = await this.accountService.getById(data.sellerId);
    const firstName = user.firstname;
    const lastName = user.lastname;
    const checkPassword = await this.accountService.validateCredentials(
      user.email,
      data.password,
    );
    if (!checkPassword) throw new Error('Password is incorrect');

    //  Check seller holding
    const sellerHolding = await this.prisma.holding.findUnique({
      where: {
        accountId_assetId: {
          accountId: data.sellerId,
          assetId: data.assetId,
        },
      },
    });

    let availableUnits = 0;
    if (sellerHolding) {
      availableUnits = Number(sellerHolding.availableQuantity);
    } else {
      const purchases = await this.prisma.assetPurchase.findMany({
        where: { accountId: data.sellerId, assetId: data.assetId },
        select: { fractions: true },
      });
      availableUnits = purchases.reduce((sum, p) => sum + p.fractions, 0);
    }

    if (availableUnits < data.units) {
      throw new BadRequestException(
        `Insufficient units. Available: ${availableUnits}`,
      );
    }

    //  Get asset current price for admin buy case
    const asset = await this.prisma.asset.findUnique({
      where: { id: data.assetId },
      include: { price: true },
    });

    if (!asset) throw new NotFoundException('Asset not found');

    const title = asset.assetTitle;

    // admin buys with 15% fee deduction
    return await this.executeAdminBuy({
      sellerHolding,
      data,
      asset,
      firstName,
      lastName,
      title,
    });
  }

  //  Admin Buys with 15% Fee ───────────────
  private async executeAdminBuy(params: {
    sellerHolding: any;
    data: { sellerId: number; assetId: number; units: number };
    asset: any;
    firstName: string;
    lastName: string;
    title?: string;
  }) {
    const { sellerHolding, data, asset, firstName, lastName, title } = params;
    const feePercent = Number(this.config.bidSell); // 15%

    // Use current market price or asset price
    const marketStat = await this.prisma.assetMarketStat.findUnique({
      where: { assetId: data.assetId },
    });

    const marketPrice = new Prisma.Decimal(
      marketStat
        ? marketStat.currentPrice
        : (asset.price?.currentPricePerFraction ?? 0),
    );

    const totalAmount = marketPrice.mul(data.units);
    // ✅ 15% fee deducted when admin buys
    const adminFee = totalAmount.mul(new Prisma.Decimal(feePercent).div(100));
    const sellerReceives = totalAmount.sub(adminFee);

    const result = await this.prisma.$transaction(async (tx) => {
      // ✅ Create admin purchase record
      const adminTrade = await tx.marketplaceTrade.create({
        data: {
          assetId: data.assetId,
          listingId: null, // no listing — admin direct buy
          buyerId: null, // 0 = admin
          sellerId: data.sellerId,
          tradeType: TradeType.MarketSell,
          pricePerUnit: marketPrice,
          units: data.units,
          totalAmount,
          fee: adminFee, // ✅ 15% fee
          netAmount: sellerReceives,
          buyerRole: 'admin',
        },
      });

      // Update seller holding
      await this.updateSellerHolding(tx, sellerHolding, data);

      // ✅ Credit seller with 15% deducted
      await this.walletService.addBalance(
        data.sellerId,
        sellerReceives,
        WalletType.Main,
        { tx, context: WalletTransactionContext.MarketSell },
      );

      // Update market stats
      await this.updateMarketStats(
        tx,
        data.assetId,
        marketPrice,
        data.units,
        totalAmount,
      );

      return {
        adminTrade,
        marketPrice,
        totalAmount,
        adminFee,
        sellerReceives,
        soldTo: 'ADMIN',
      };
    });

    await this.notificationService._sendNotification({
      code: AdminNotificationCode.IMMEDIATE_SELL,
      audience: NotificationAudience.ADMIN,
      type: NotificationType.Informational,
      data: {
        userName: `${firstName} ${lastName}`,
        propertyName: title,
      },
    });

    return result;
  }

  // ─── Shared Helpers ───────────────────────────────────
  private async updateSellerHolding(
    tx: Prisma.TransactionClient,
    sellerHolding: any,
    data: { sellerId: number; assetId: number; units: number },
  ) {
    if (sellerHolding) {
      await tx.holding.update({
        where: {
          accountId_assetId: {
            accountId: data.sellerId,
            assetId: data.assetId,
          },
        },
        data: {
          availableQuantity: { decrement: data.units },
        },
      });
    } else {
      await tx.assetPurchase.updateMany({
        where: { accountId: data.sellerId, assetId: data.assetId },
        data: { fractions: { decrement: data.units } },
      });
    }
  }

  private async updateMarketStats(
    tx: Prisma.TransactionClient,
    assetId: number,
    tradePrice: Prisma.Decimal,
    units: number,
    totalAmount: Prisma.Decimal,
  ) {
    const existing = await tx.assetMarketStat.findUnique({
      where: { assetId },
    });

    const now = new Date();

    if (!existing) {
      // First ever trade — initialize all OHLC with trade price
      await tx.assetMarketStat.create({
        data: {
          assetId,
          currentPrice: tradePrice,
          openPrice24h: tradePrice, // first trade = open
          highPrice24h: tradePrice,
          lowPrice24h: tradePrice,
          closePrice24h: tradePrice,
          volume24h: totalAmount,
          units24h: units,
          priceChange24h: 0,
          lastResetAt: now,
        },
      });
      return;
    }

    // Update OHLC in real time
    await tx.assetMarketStat.update({
      where: { assetId },
      data: {
        currentPrice: tradePrice,

        // High — update if new trade is higher
        highPrice24h: tradePrice.gt(existing.highPrice24h)
          ? tradePrice
          : existing.highPrice24h,

        // Low — update if new trade is lower
        lowPrice24h: tradePrice.lt(existing.lowPrice24h)
          ? tradePrice
          : existing.lowPrice24h,

        // Close — always latest trade price
        closePrice24h: tradePrice,

        // Open stays same — only set at reset
        // openPrice24h: unchanged

        volume24h: { increment: totalAmount },
        units24h: { increment: units },

        // Price change % from open
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

  // ─── Get Marketplace Listings ──────────────────────────
  async getListings(
    accountId: number,
    assetId: number,
    type: ListingType,
    listingStatus?: ListingStatus,
    options?: { search?: string; skip?: number; take?: number },
  ) {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.MarketplaceListingWhereInput = {
      assetId,
      type,
      status: listingStatus,
      accountId: { not: accountId },

      // ✅ Search by firstname or lastname
      ...(search && {
        account: {
          OR: [
            {
              firstname: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastname: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    };

    const [count, listings] = await Promise.all([
      this.prisma.marketplaceListing.count({ where }),
      this.prisma.marketplaceListing.findMany({
        where,
        include: {
          account: {
            select: { id: true, firstname: true, lastname: true },
          },
        },
        orderBy: {
          pricePerUnit: type === ListingType.Ask ? 'asc' : 'desc',
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return { count, ...pagination, data: listings };
  }

  // ─── Get 24h Market Stats ──────────────────────────────
  async getMarketStats(assetId: number) {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [stat, recentTrades] = await Promise.all([
      this.prisma.assetMarketStat.findUnique({ where: { assetId } }),
      this.prisma.marketplaceTrade.findMany({
        where: { assetId, tradedAt: { gte: since24h } },
        orderBy: { tradedAt: 'desc' },
        take: 50,
        select: {
          pricePerUnit: true,
          units: true,
          totalAmount: true,
          tradedAt: true,
        },
      }),
    ]);

    if (!stat) {
      return {
        openPrice: 0,
        highPrice: 0,
        lowPrice: 0,
        closePrice: 0,
        currentPrice: 0,
        volume24h: 0,
        priceChange24h: 0,
        isPositive: true,
        recentTrades,
      };
    }

    return {
      openPrice: Number(stat.openPrice24h),
      highPrice: Number(stat.highPrice24h),
      lowPrice: Number(stat.lowPrice24h),
      closePrice: Number(stat.closePrice24h),
      currentPrice: Number(stat.currentPrice),
      volume24h: Number(stat.volume24h),
      priceChange24h: Number(stat.priceChange24h),
      isPositive: Number(stat.priceChange24h) >= 0,
      recentTrades,
    };
  }

  // ─── Cancel Listing ────────────────────────────────────
  async cancelListing(listingId: number, accountId: number) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) throw new BadRequestException('Listing not found');
    if (listing.accountId !== accountId) {
      throw new NotFoundException('Not your listing');
    }
    if (listing.status !== ListingStatus.Active) {
      throw new BadRequestException('Listing is not active');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.marketplaceListing.update({
        where: { id: listingId },
        data: { status: ListingStatus.Cancelled },
      });

      // Refund locked funds for BID cancellation
      if (listing.type === ListingType.Bid) {
        const refundAmount = new Prisma.Decimal(listing.pricePerUnit).mul(
          listing.remainingUnits,
        );
        await this.walletService.addBalance(
          accountId,
          refundAmount,
          WalletType.Main,
          { tx, context: WalletTransactionContext.BidRefund },
        );
      }

      return { success: true };
    });
  }

  // ─── User's Active Listings ────────────────────────────
  async getMyListings(
    accountId: number,
    assetId?: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
      type?: ListingType;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.MarketplaceListingWhereInput = {
      accountId,
      // status: ListingStatus.Active,
      ...(assetId && { assetId }),
    };
    if (options?.type) {
      where.type = options.type;
    }
    const totalMarketplaces = await this.prisma.marketplaceListing.count({
      where,
    });

    const marketplace = await this.prisma.marketplaceListing.findMany({
      where,
      include: {
        asset: { select: { assetTitle: true } },
      },
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });
    return {
      count: totalMarketplaces,
      skip: pagination.skip,
      take: pagination.take,
      data: marketplace,
    };
  }

  // ─── TAB 1: Chart Data ────────────────────────────────
  async getAssetChartData(assetId: number, period: '1M' | '3M' | '6M' | '1Y') {
    const periodDays = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
    const days = periodDays[period];

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    fromDate.setHours(0, 0, 0, 0);

    // Get asset current price
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { price: true },
    });

    if (!asset) throw new NotFoundException('Asset not found');

    const currentPrice = Number(asset.price?.currentPricePerFraction ?? 0);

    // Get trades for price history
    const trades = await this.prisma.marketplaceTrade.findMany({
      where: {
        assetId,
        tradedAt: { gte: fromDate },
      },
      orderBy: { tradedAt: 'asc' },
      select: {
        pricePerUnit: true,
        tradedAt: true,
        units: true,
        totalAmount: true,
      },
    });

    // Group by date for price history
    const priceByDate = new Map<string, { price: number; volume: number }>();
    for (const trade of trades) {
      const dateStr = trade.tradedAt.toISOString().split('T')[0];
      const existing = priceByDate.get(dateStr);
      priceByDate.set(dateStr, {
        price: Number(trade.pricePerUnit),
        volume: (existing?.volume ?? 0) + Number(trade.totalAmount),
      });
    }

    // Fill all days
    const priceHistory: { date: string; price: number }[] = [];
    const volumeHistory: { date: string; volume: number }[] = [];
    let lastPrice = currentPrice;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (priceByDate.has(dateStr)) {
        lastPrice = priceByDate.get(dateStr)!.price;
      }

      priceHistory.push({ date: dateStr, price: lastPrice });
      volumeHistory.push({
        date: dateStr,
        volume: priceByDate.get(dateStr)?.volume ?? 0,
      });
    }

    // OHLC for selected period
    const marketStat = await this.prisma.assetMarketStat.findUnique({
      where: { assetId },
    });

    const startPrice = priceHistory[0]?.price ?? currentPrice;
    const changeAmount = currentPrice - startPrice;
    const changePercent =
      startPrice > 0
        ? parseFloat(((changeAmount / startPrice) * 100).toFixed(2))
        : 0;

    return {
      assetId,
      currentPrice,
      changePercent,
      opening: marketStat ? Number(marketStat.openPrice24h) : 0,
      high: marketStat ? Number(marketStat.highPrice24h) : 0,
      low: marketStat ? Number(marketStat.lowPrice24h) : 0,
      close: marketStat ? Number(marketStat.currentPrice) : 0,
      priceHistory,
      volumeHistory, // ✅ transaction volume chart
    };
  }

  // ─── TAB 2: Overview Data ─────────────────────────────
  async getAssetOverview(assetId: number, accountId: number) {
    const [asset, holding, marketStat, checkDocumentPayment] =
      await Promise.all([
        this.prisma.asset.findUnique({
          where: { id: assetId },
          include: { price: true, meta: true },
        }),
        // ✅ Try holding first
        this.prisma.holding.findUnique({
          where: { accountId_assetId: { accountId, assetId } },
        }),
        this.prisma.assetMarketStat.findUnique({ where: { assetId } }),
        this.prisma.assetInterest.findUnique({
          where: {
            sharedAssetId_accountId: {
              accountId: accountId,
              sharedAssetId: assetId,
            },
          },
        }),
      ]);

    if (!asset) throw new NotFoundException('Asset not found');
    const isOwner = asset.accountId === accountId;

    const currentPrice = marketStat
      ? Number(marketStat.currentPrice)
      : Number(asset.price?.currentPricePerFraction ?? 0);

    let unitsOwned = 0;
    let avgBuyPrice = 0;

    if (holding) {
      // ✅ Use holding if exists
      unitsOwned = Number(holding.availableQuantity);
      avgBuyPrice = Number(holding.averageBuyPrice);
    } else {
      // ✅ Fallback to AssetPurchase
      const purchases = await this.prisma.assetPurchase.findMany({
        where: { accountId, assetId },
        select: { fractions: true, totalAmount: true },
      });

      unitsOwned = purchases.reduce((sum, p) => sum + p.fractions, 0);
      const totalInvested = purchases.reduce(
        (sum, p) => sum + Number(p.totalAmount),
        0,
      );
      avgBuyPrice = unitsOwned > 0 ? totalInvested / unitsOwned : 0;
    }

    const currentValue = currentPrice * unitsOwned;
    const investedAmount = avgBuyPrice * unitsOwned;
    const totalPnL = currentValue - investedAmount;
    const returnPercent =
      investedAmount > 0
        ? parseFloat(((totalPnL / investedAmount) * 100).toFixed(2))
        : 0;

    const ownershipPercent =
      asset.totalFractions > 0
        ? parseFloat(((unitsOwned / asset.totalFractions) * 100).toFixed(2))
        : 0;

    const metaMap = new Map(asset.meta.map((m) => [m.metaKey, m.metaValue]));
    const rentalIncome = Number(metaMap.get('rentalIncomeMonthly') ?? 0);
    const yieldPA =
      currentValue > 0
        ? parseFloat((((rentalIncome * 12) / currentValue) * 100).toFixed(2))
        : 0;

    return {
      assetId,
      asset,
      // P&L section
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      returnPercent,
      isPositive: totalPnL >= 0,
      currentValue: parseFloat(currentValue.toFixed(2)),
      investedAmount: parseFloat(investedAmount.toFixed(2)),
      // Holdings
      unitsOwned,
      ownershipPercent,
      yieldPA,
      pricePerUnit: currentPrice,
      isPayment: isOwner || checkDocumentPayment?.paymentStatus ? true : false,
      // Property details
      propertyDetails: {
        totalUnits: asset.totalFractions,
        assetTitle: asset.assetTitle,
        assetSubType: metaMap.get('assetSubType') ?? 'N/A',
        country: metaMap.get('country') ?? 'N/A',
        state: metaMap.get('state') ?? 'N/A',
        city: metaMap.get('city') ?? 'N/A',
        pincode: metaMap.get('pincode') ?? 'N/A',
        currentOwnerName: asset.currentOwnerName,
        propertyType: asset.assetType,
        yearBuilt: metaMap.get('yearOfConstruction') ?? 'N/A',
        expectedHolding: metaMap.get('expectedHolding') ?? '5+ Years',
        roi5Y: metaMap.get('roi5Y') ?? 'N/A',
      },
    };
  }

  // ─── TAB 3: Order Book ────────────────────────────────
  async getOrderBook(assetId: number) {
    const [asset, marketStat, sellOrders, buyOrders, recentTrades] =
      await Promise.all([
        this.prisma.asset.findUnique({
          where: { id: assetId },
          include: { price: true },
        }),
        this.prisma.assetMarketStat.findUnique({ where: { assetId } }),

        // ✅ ASK orders — lowest price first (sellers)
        this.prisma.marketplaceListing.findMany({
          where: {
            assetId,
            type: ListingType.Ask,
          },
          orderBy: { pricePerUnit: 'asc' },
          take: 10,
          select: { pricePerUnit: true, remainingUnits: true },
        }),

        // ✅ BID orders — highest price first (buyers)
        this.prisma.marketplaceListing.findMany({
          where: {
            assetId,
            type: ListingType.Bid,
          },
          orderBy: { pricePerUnit: 'desc' },
          take: 10,
          select: { pricePerUnit: true, remainingUnits: true },
        }),

        // ✅ Recent trades from MarketplaceTrade
        this.prisma.marketplaceTrade.findMany({
          where: { assetId },
          orderBy: { tradedAt: 'desc' },
          take: 10,
          select: {
            pricePerUnit: true,
            units: true,
            tradeType: true,
            tradedAt: true,
          },
        }),
      ]);

    if (!asset) throw new NotFoundException('Asset not found');

    const currentPrice = marketStat
      ? Number(marketStat.currentPrice)
      : Number(asset.price?.currentPricePerFraction ?? 0);

    return {
      assetId,
      marketPrice: currentPrice,
      changePercent: marketStat ? Number(marketStat.priceChange24h) : 0,
      isPositive: marketStat ? Number(marketStat.priceChange24h) >= 0 : true,
      sellOrders: sellOrders.map((o) => ({
        price: Number(o.pricePerUnit),
        units: o.remainingUnits,
      })),
      buyOrders: buyOrders.map((o) => ({
        price: Number(o.pricePerUnit),
        units: o.remainingUnits,
      })),
      recentTrades: recentTrades.map((t) => ({
        price: Number(t.pricePerUnit),
        units: t.units,
        type: t.tradeType,
        tradedAt: t.tradedAt,
        timeAgo: this.getTimeAgo(t.tradedAt),
      })),
    };
  }

  // ─── TAB 4: Orders ────────────────────────────────────
  async getAssetOrders(assetId: number, accountId: number) {
    const [myListings, availableToBuy] = await Promise.all([
      // ✅ My active listings (both ASK and BID)
      this.prisma.marketplaceListing.findMany({
        where: {
          assetId,
          accountId,
          status: ListingStatus.Active,
        },
        include: {
          asset: { select: { assetTitle: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // ✅ Other people's ASK listings — user can BUY from these
      this.prisma.marketplaceListing.findMany({
        where: {
          assetId,
          type: ListingType.Ask,
          status: ListingStatus.Active,
          accountId: { not: accountId }, // exclude own listings
        },
        include: {
          asset: {
            include: { meta: true },
          },
        },
        orderBy: { pricePerUnit: 'asc' },
      }),
    ]);

    return {
      assetId,
      // ✅ My Active Listings section
      myActiveListings: myListings.map((l) => ({
        id: l.id,
        assetTitle: l.asset.assetTitle,
        type: l.type, // ASK or BID
        pricePerUnit: Number(l.pricePerUnit),
        totalUnits: l.totalUnits,
        remainingUnits: l.remainingUnits,
        status: l.status,
        createdAt: l.createdAt,
      })),
      // ✅ Available to Buy section (ASK listings from others)
      availableToBuy: availableToBuy.map((l) => {
        const metaMap = new Map(
          l.asset.meta.map((m) => [m.metaKey, m.metaValue]),
        );
        return {
          listingId: l.id,
          assetTitle: l.asset.assetTitle,
          location: metaMap.get('city') ?? 'N/A',
          pricePerUnit: Number(l.pricePerUnit),
          unitsAvailable: l.remainingUnits,
          totalValue: parseFloat(
            (Number(l.pricePerUnit) * l.remainingUnits).toFixed(2),
          ),
        };
      }),
    };
  }

  // ─── DIRECT BUY ───────────────────────────────────────
  // Buyer directly buys from an existing ASK listing
  async directBuy(data: { buyerId: number; listingId: number; units: number }) {
    // Get the ASK listing
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: data.listingId },
      include: { asset: { include: { price: true } } },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.type !== ListingType.Ask) {
      throw new BadRequestException('This listing is not a sell order');
    }
    if (
      listing.status !== ListingStatus.Active &&
      listing.status !== ListingStatus.Partial
    ) {
      throw new BadRequestException('Listing is not active');
    }
    if (listing.accountId === data.buyerId) {
      throw new BadRequestException('Cannot buy your own listing');
    }
    if (listing.remainingUnits < data.units) {
      throw new BadRequestException(
        `Insufficient units available. Available: ${listing.remainingUnits}`,
      );
    }
    const totalAmount = listing.pricePerUnit.mul(data.units);

    // ✅ Check buyer wallet balance
    const walletBalance = await this.walletService.getBalanceOf(
      data.buyerId,
      'Main',
    );
    if (new Prisma.Decimal(walletBalance).lt(totalAmount)) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required: ₹${totalAmount}`,
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // ─── 1. DEDUCT BUYER WALLET ────────────────────
      await this.walletService.subtractBalance(
        data.buyerId,
        totalAmount,
        WalletType.Main,
        { tx, context: WalletTransactionContext.DirectBuy },
      );

      // ─── 2. CREDIT SELLER WALLET ───────────────────
      await this.walletService.addBalance(
        listing.accountId,
        totalAmount,
        WalletType.Main,
        { tx, context: WalletTransactionContext.DirectSell },
      );

      // ─── 3. UPDATE LISTING ─────────────────────────
      const newRemaining = listing.remainingUnits - data.units;
      await tx.marketplaceListing.update({
        where: { id: data.listingId },
        data: {
          remainingUnits: newRemaining,
          status:
            newRemaining === 0
              ? ListingStatus.Fulfilled
              : ListingStatus.Partial,
        },
      });

      // ─── 4. UPDATE SELLER HOLDING ──────────────────
      // Units were already locked when ASK was created
      // Just decrement locked quantity
      await tx.holding.update({
        where: {
          accountId_assetId: {
            accountId: listing.accountId,
            assetId: listing.assetId,
          },
        },
        data: {
          lockedQuantity: { decrement: data.units }, // ✅ release lock
          // availableQuantity already decremented when ASK was created
        },
      });

      // ─── 5. UPDATE BUYER HOLDING ───────────────────
      const buyerHolding = await tx.holding.findUnique({
        where: {
          accountId_assetId: {
            accountId: data.buyerId,
            assetId: listing.assetId,
          },
        },
      });

      if (buyerHolding) {
        const existingUnits = Number(buyerHolding.availableQuantity);
        const existingAvg = Number(buyerHolding.averageBuyPrice);
        const newTotalUnits = existingUnits + data.units;
        const newAvgPrice =
          newTotalUnits > 0
            ? (existingUnits * existingAvg +
                data.units * Number(listing.pricePerUnit)) /
              newTotalUnits
            : Number(listing.pricePerUnit);

        await tx.holding.update({
          where: {
            accountId_assetId: {
              accountId: data.buyerId,
              assetId: listing.assetId,
            },
          },
          data: {
            availableQuantity: { increment: data.units }, // ✅ increase units
            averageBuyPrice: parseFloat(newAvgPrice.toFixed(2)),
          },
        });
      } else {
        // Create holding for buyer
        await tx.holding.create({
          data: {
            accountId: data.buyerId,
            assetId: listing.assetId,
            availableQuantity: data.units,
            lockedQuantity: 0,
            averageBuyPrice: Number(listing.pricePerUnit),
          },
        });
      }

      // ─── 6. CREATE TRADE RECORD ────────────────────
      const trade = await tx.marketplaceTrade.create({
        data: {
          assetId: listing.assetId,
          listingId: listing.id,
          buyerId: data.buyerId,
          sellerId: listing.accountId,
          tradeType: TradeType.AskFulfilled,
          pricePerUnit: listing.pricePerUnit,
          units: data.units,
          totalAmount,
          fee: new Prisma.Decimal(0), // no fee for direct buy
          netAmount: totalAmount,
        },
      });

      // ─── 7. UPDATE MARKET STATS ────────────────────
      await tx.assetMarketStat.upsert({
        where: { assetId: listing.assetId },
        update: {
          currentPrice: listing.pricePerUnit,
          volume24h: { increment: totalAmount },
          units24h: { increment: data.units },
        },
        create: {
          assetId: listing.assetId,
          currentPrice: listing.pricePerUnit,
          openPrice24h: listing.pricePerUnit,
          highPrice24h: listing.pricePerUnit,
          lowPrice24h: listing.pricePerUnit,
          closePrice24h: listing.pricePerUnit,
          volume24h: totalAmount,
          units24h: data.units,
          priceChange24h: 0,
          lastResetAt: new Date(),
        },
      });

      return {
        trade,
        pricePerUnit: Number(listing.pricePerUnit),
        units: data.units,
        totalAmount: Number(totalAmount),
        buyerId: data.buyerId,
        sellerId: listing.accountId,
      };
    });
  }

  // ─── DIRECT SELL ──────────────────────────────────────
  // Seller directly sells to an existing BID listing
  async directSell(data: {
    sellerId: number;
    listingId: number;
    units: number;
  }) {
    // Get the BID listing
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: data.listingId },
      include: { asset: { include: { price: true } } },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.type !== ListingType.Bid) {
      throw new BadRequestException('This listing is not a buy order');
    }
    if (
      listing.status !== ListingStatus.Active &&
      listing.status !== ListingStatus.Partial
    ) {
      throw new BadRequestException('Listing is not active');
    }
    if (listing.accountId === data.sellerId) {
      throw new BadRequestException('Cannot sell to your own listing');
    }
    if (listing.remainingUnits < data.units) {
      throw new BadRequestException(
        `Buyer only wants ${listing.remainingUnits} units`,
      );
    }

    // ✅ Check seller holding
    const sellerHolding = await this.prisma.holding.findUnique({
      where: {
        accountId_assetId: {
          accountId: data.sellerId,
          assetId: listing.assetId,
        },
      },
    });

    let availableUnits = 0;
    let sellerAvgBuyPrice = 0;

    if (sellerHolding) {
      availableUnits = Number(sellerHolding.availableQuantity);
      sellerAvgBuyPrice = Number(sellerHolding.averageBuyPrice);
    } else {
      // Fallback to AssetPurchase
      const purchases = await this.prisma.assetPurchase.findMany({
        where: { accountId: data.sellerId, assetId: listing.assetId },
        select: { fractions: true, totalAmount: true },
      });

      if (!purchases.length) {
        throw new BadRequestException('You do not own any units of this asset');
      }

      const totalFractions = purchases.reduce((sum, p) => sum + p.fractions, 0);
      const totalInvested = purchases.reduce(
        (sum, p) => sum + Number(p.totalAmount),
        0,
      );

      availableUnits = totalFractions;
      sellerAvgBuyPrice =
        totalFractions > 0 ? totalInvested / totalFractions : 0;
    }

    if (availableUnits < data.units) {
      throw new BadRequestException(
        `Insufficient units. Available: ${availableUnits}`,
      );
    }

    const totalAmount = listing.pricePerUnit.mul(data.units);

    return await this.prisma.$transaction(async (tx) => {
      // ─── 1. DEDUCT SELLER HOLDING ──────────────────
      if (sellerHolding) {
        await tx.holding.update({
          where: {
            accountId_assetId: {
              accountId: data.sellerId,
              assetId: listing.assetId,
            },
          },
          data: {
            availableQuantity: { decrement: data.units },
          },
        });
      } else {
        await tx.holding.create({
          data: {
            accountId: data.sellerId,
            assetId: listing.assetId,
            availableQuantity: availableUnits - data.units,
            lockedQuantity: 0,
            averageBuyPrice: parseFloat(sellerAvgBuyPrice.toFixed(2)),
          },
        });
      }

      // ─── 2. UPDATE BUYER HOLDING ───────────────────
      // Buyer funds already locked in wallet when BID was created
      const buyerHolding = await tx.holding.findUnique({
        where: {
          accountId_assetId: {
            accountId: listing.accountId,
            assetId: listing.assetId,
          },
        },
      });

      if (buyerHolding) {
        const existingUnits = Number(buyerHolding.availableQuantity);
        const existingAvg = Number(buyerHolding.averageBuyPrice);
        const newTotalUnits = existingUnits + data.units;
        const newAvgPrice =
          newTotalUnits > 0
            ? (existingUnits * existingAvg +
                data.units * Number(listing.pricePerUnit)) /
              newTotalUnits
            : Number(listing.pricePerUnit);

        await tx.holding.update({
          where: {
            accountId_assetId: {
              accountId: listing.accountId,
              assetId: listing.assetId,
            },
          },
          data: {
            availableQuantity: { increment: data.units }, // ✅ increase units
            lockedQuantity: { decrement: data.units }, // ✅ release locked
            averageBuyPrice: parseFloat(newAvgPrice.toFixed(2)),
          },
        });
      } else {
        await tx.holding.create({
          data: {
            accountId: listing.accountId,
            assetId: listing.assetId,
            availableQuantity: data.units,
            lockedQuantity: 0,
            averageBuyPrice: Number(listing.pricePerUnit),
          },
        });
      }

      // ─── 3. UPDATE LISTING ─────────────────────────
      const newRemaining = listing.remainingUnits - data.units;
      await tx.marketplaceListing.update({
        where: { id: data.listingId },
        data: {
          remainingUnits: newRemaining,
          status:
            newRemaining === 0
              ? ListingStatus.Fulfilled
              : ListingStatus.Partial,
        },
      });

      // ─── 4. CREDIT SELLER WALLET ───────────────────
      // Buyer wallet already locked when BID created
      // Just transfer from locked to seller
      await this.walletService.addBalance(
        data.sellerId,
        totalAmount,
        WalletType.Main,
        { tx, context: WalletTransactionContext.DirectSell },
      );

      // ─── 5. CREATE TRADE RECORD ────────────────────
      const trade = await tx.marketplaceTrade.create({
        data: {
          assetId: listing.assetId,
          listingId: listing.id,
          buyerId: listing.accountId,
          sellerId: data.sellerId,
          tradeType: TradeType.BidFulfilled,
          pricePerUnit: listing.pricePerUnit,
          units: data.units,
          totalAmount,
          fee: new Prisma.Decimal(0), // no fee for direct sell
          netAmount: totalAmount,
        },
      });

      // ─── 6. UPDATE MARKET STATS ────────────────────
      await tx.assetMarketStat.upsert({
        where: { assetId: listing.assetId },
        update: {
          currentPrice: listing.pricePerUnit,
          volume24h: { increment: totalAmount },
          units24h: { increment: data.units },
        },
        create: {
          assetId: listing.assetId,
          currentPrice: listing.pricePerUnit,
          openPrice24h: listing.pricePerUnit,
          highPrice24h: listing.pricePerUnit,
          lowPrice24h: listing.pricePerUnit,
          closePrice24h: listing.pricePerUnit,
          volume24h: totalAmount,
          units24h: data.units,
          priceChange24h: 0,
          lastResetAt: new Date(),
        },
      });

      return {
        trade,
        pricePerUnit: Number(listing.pricePerUnit),
        units: data.units,
        totalAmount: Number(totalAmount),
        buyerId: listing.accountId,
        sellerId: data.sellerId,
      };
    });
  }

  async getImmediateSellList(
    accountId: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
      assetId?: number;
      fromDate?: string;
      toDate?: string;
      tradeType?: TradeType;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.MarketplaceTradeWhereInput = {
      // sellerId: accountId, //  current user's sells
      tradeType: options?.tradeType, //  only immediate sells

      ...(options?.assetId && {
        assetId: options.assetId,
      }),

      ...(options?.fromDate || options?.toDate
        ? {
            tradedAt: {
              ...(options.fromDate && { gte: new Date(options.fromDate) }),
              ...(options.toDate && { lte: new Date(options.toDate) }),
            },
          }
        : {}),

      ...(search && {
        asset: {
          assetTitle: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    };

    const [count, trades] = await Promise.all([
      this.prisma.marketplaceTrade.count({ where }),
      this.prisma.marketplaceTrade.findMany({
        where,
        include: {
          asset: {
            select: {
              id: true,
              assetTitle: true,
              assetType: true,
            },
          },
          buyer: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
        },
        orderBy: { tradedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const data = trades.map((trade) => {
      const isAdminBuy = trade.buyerId === null; // null = admin bought (no buyer found)

      return {
        id: trade.id,
        asset: {
          id: trade.asset.id,
          assetTitle: trade.asset.assetTitle,
          assetType: trade.asset.assetType,
        },
        pricePerUnit: Number(trade.pricePerUnit),
        units: trade.units,
        fee: Number(trade.fee),
        totalAmount: Number(trade.totalAmount),
        netAmount: Number(trade.netAmount), //  what seller received
        soldTo: isAdminBuy ? 'ADMIN' : 'BUYER', //  who bought
        buyer: isAdminBuy
          ? { id: 0, name: 'admin' }
          : {
              id: trade.buyer?.id,
              name: `${trade.buyer?.firstname} ${trade.buyer?.lastname}`,
              email: trade.buyer?.email,
            },
        tradedAt: trade.tradedAt,
      };
    });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }

  // ─── Get User Trade History (Buy + Sell) ────────────
  async getMyTradeHistory(
    accountId: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
      assetId?: number;
      fromDate?: string;
      toDate?: string;
      type?: ListingType; // ALL returns both
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const tradeType = options?.type || 'ALL';

    // Base filter for date range and asset
    const baseWhere = {
      ...(options?.assetId && { assetId: options.assetId }),
      ...(options?.fromDate || options?.toDate
        ? {
            tradedAt: {
              ...(options.fromDate && { gte: new Date(options.fromDate) }),
              ...(options.toDate && { lte: new Date(options.toDate) }),
            },
          }
        : {}),
      ...(search && {
        asset: {
          assetTitle: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    };

    // Build OR conditions for buyer or seller
    const tradeWhere: any = {
      OR: [],
      ...baseWhere,
    };

    if (tradeType === ListingType.Bid || tradeType === 'ALL') {
      tradeWhere.OR.push({ buyerId: accountId });
    }

    if (tradeType === ListingType.Ask || tradeType === 'ALL') {
      tradeWhere.OR.push({ sellerId: accountId });
    }

    const [count, trades] = await Promise.all([
      this.prisma.marketplaceTrade.count({ where: tradeWhere }),
      this.prisma.marketplaceTrade.findMany({
        where: tradeWhere,
        include: {
          asset: {
            select: {
              id: true,
              assetTitle: true,
              assetType: true,
            },
          },
          buyer: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
        },
        orderBy: { tradedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const data = trades.map((trade) => {
      const isBuy = trade.buyerId === accountId;
      // const isSell = trade.sellerId === accountId;
      // const isAdminBuy = trade.buyerId === null;

      return {
        id: trade.id,
        tradeType: isBuy ? 'BUY' : 'SELL', // From current user's perspective
        asset: {
          id: trade.asset.id,
          assetTitle: trade.asset.assetTitle,
          assetType: trade.asset.assetType,
        },
        pricePerUnit: Number(trade.pricePerUnit),
        units: trade.units,
        totalAmount: Number(trade.totalAmount),
        fee: Number(trade.fee),
        netAmount: Number(trade.netAmount),
        //  From user's perspective
        // counterparty: isBuy
        //   ? // I'm buying, so show the seller
        //     {
        //       type: 'SELLER',
        //       user: {
        //         id: trade.seller.id,
        //         name: `${trade.seller.firstname} ${trade.seller.lastname}`,
        //         email: trade.seller.email,
        //       },
        //     }
        //   : // I'm selling, so show the buyer
        //     isAdminBuy
        //     ? { type: 'BUYER', user: { id: 0, name: 'Admin', email: null } }
        //     : {
        //         type: 'BUYER',
        //         user: {
        //           id: trade.buyer?.id,
        //           name: `${trade.buyer?.firstname} ${trade.buyer?.lastname}`,
        //           email: trade.buyer?.email,
        //         },
        //       },
        tradedAt: trade.tradedAt,
        //  Show if it's a direct trade or market trade
        transactionType: trade.tradeType, // ASK_FULFILLED, BID_FULFILLED, or MARKET_SELL
      };
    });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }
}
