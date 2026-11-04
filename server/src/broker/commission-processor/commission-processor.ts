import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BaseService, UtilsService } from '@Common';
import {
  CommissionStatus,
  WalletTransactionContext,
  WalletType,
} from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma';
import { WalletsService } from '../../wallets';

@Injectable()
export class CommissionPayoutProcessor
  extends BaseService
  implements OnApplicationBootstrap
{
  private readonly BATCH_SIZE = 50;
  private readonly INTERVAL_MS = 60_000;
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
    private readonly utilsService: UtilsService,
  ) {
    super();
  }

  async onApplicationBootstrap() {
    this.utilsService.sleep(10000).then(() => {
      this.logger.info('Commission payout processor started');
      this.startProcessorLoop();
    });
  }

  private async startProcessorLoop() {
    while (true) {
      try {
        if (!this.isRunning) {
          this.isRunning = true;
          await this.processPendingCommissions();
        }
      } catch (err) {
        this.logger.error('Commission processor loop failed', err);
      } finally {
        this.isRunning = false;
        await this.utilsService.sleep(this.INTERVAL_MS);
      }
    }
  }

  private async processPendingCommissions() {
    this.logger.debug('Running commission payout batch');

    let pendingCommissions: { id: number }[] = [];

    try {
      pendingCommissions = await this.prisma.referralCommission.findMany({
        where: { status: CommissionStatus.Pending },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
        take: this.BATCH_SIZE,
      });
    } catch (err) {
      this.logger.error('Failed to fetch pending commissions', err);
      return;
    }
    if (!pendingCommissions.length) return;
    for (const { id } of pendingCommissions) {
      try {
        await this.processSingleCommission(id);
      } catch (err) {
        this.logger.error(`Failed to process commissionId=${id}`, err);
      }
    }
  }

  private async processSingleCommission(commissionId: number) {
    await this.prisma.$transaction(async (tx) => {
      const commission = await tx.referralCommission.findUnique({
        where: { id: commissionId },
      });

      if (!commission) return;
      if (commission.status !== CommissionStatus.Pending) return;

      await this.walletsService.addBalance(
        commission.ownerId,
        commission.commissionAmount,
        WalletType.Commission,
        {
          tx,
          context: WalletTransactionContext.ReferralCommissionCredit,
          entityId: BigInt(commission.id),
          meta: {
            commissionId: commission.id,
            campaignId: commission.campaignId,
            referralUsesType: commission.referralUsesType,
            referredUserId: commission.referredUserId ?? null,
            assetId: commission.assetId ?? null,
          },
        },
      );

      await tx.referralCommission.update({
        where: { id: commission.id },
        data: { status: CommissionStatus.Confirmed },
      });

      await tx.commissionLedger.create({
        data: {
          commissionId: commission.id,
          fromStatus: CommissionStatus.Pending,
          toStatus: CommissionStatus.Paid,
          amount: commission.commissionAmount,
          reason: 'Commission credited to broker commission wallet',
          metadata: {
            processor: 'CommissionPayoutProcessor',
          },
        },
      });
    });
  }
}
