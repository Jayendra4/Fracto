import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma';

@Injectable()
export class MarketStatResetProcessor
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(MarketStatResetProcessor.name);
  private isProcessorIdle = true;
  private isShutDownInProgress = false;

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    // ✅ Calculate ms until next midnight IST
    const msUntilMidnight = this.getMsUntilMidnightIST();
    this.logger.log(
      `Market stat reset scheduled in ${Math.round(msUntilMidnight / 60000)} minutes`,
    );
    setTimeout(() => this.processor(), msUntilMidnight);
  }

  async onModuleDestroy() {
    this.isShutDownInProgress = true;
  }

  private async processor() {
    if (this.isShutDownInProgress || !this.isProcessorIdle) return;
    this.isProcessorIdle = false;

    this.logger.log('🔄 Daily market stat reset started');

    try {
      // Get all active market stats
      const stats = await this.prisma.assetMarketStat.findMany();

      for (const stat of stats) {
        if (this.isShutDownInProgress) break;

        await this.prisma.assetMarketStat.update({
          where: { assetId: stat.assetId },
          data: {
            // Yesterday's close becomes today's open
            openPrice24h: stat.closePrice24h,

            // Reset high/low to current price (first trade will update)
            highPrice24h: stat.closePrice24h!,
            lowPrice24h: stat.closePrice24h!,

            //  Close stays as last known price
            closePrice24h: stat.closePrice24h,

            // Reset 24h volume
            volume24h: new Prisma.Decimal(0),
            units24h: 0,

            // Reset change % to 0
            priceChange24h: new Prisma.Decimal(0),

            //  Track reset time
            lastResetAt: new Date(),
          },
        });

        this.logger.log(
          `Reset asset ${stat.assetId}: open=₹${stat.closePrice24h}`,
        );
      }

      this.logger.log(' Daily market stat reset completed');
    } catch (err) {
      this.logger.error('Market stat reset error', err);
    }

    this.isProcessorIdle = true;

    if (!this.isShutDownInProgress) {
      //  Schedule next reset at next midnight IST (24 hours)
      setTimeout(() => this.processor(), 24 * 60 * 60 * 1000);
    }
  }

  //  Calculate milliseconds until next midnight IST (UTC+5:30)
  private getMsUntilMidnightIST(): number {
    const now = new Date();

    // IST offset = UTC + 5:30 = 330 minutes
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

    // Current time in IST
    const nowIST = new Date(now.getTime() + IST_OFFSET_MS);

    // Next midnight in IST
    const nextMidnightIST = new Date(nowIST);
    nextMidnightIST.setUTCHours(0, 0, 0, 0);
    nextMidnightIST.setUTCDate(nextMidnightIST.getUTCDate() + 1);

    // Convert back to UTC ms
    const nextMidnightUTC = new Date(nextMidnightIST.getTime() - IST_OFFSET_MS);

    return nextMidnightUTC.getTime() - now.getTime();
  }
}
