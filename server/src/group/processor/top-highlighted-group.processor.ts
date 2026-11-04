import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { GroupStatus } from '../../generated/prisma/enums';

@Injectable()
export class HighlightedGroupsProcessor
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(HighlightedGroupsProcessor.name);
  private isProcessorIdle = true;
  private isShutDownInProgress = false;

  private readonly TOP_GROUPS_COUNT = 5;

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    setTimeout(() => this.processor(), 10000);
  }

  async onModuleDestroy() {
    this.isShutDownInProgress = true;
  }

  private async processor() {
    if (this.isShutDownInProgress || !this.isProcessorIdle) return;
    this.isProcessorIdle = false;

    try {
      // ✅ Get groups with most members
      const topGroups = await this.prisma.group.findMany({
        where: { groupStatus: GroupStatus.Active },
        include: {
          _count: { select: { groupMember: true } },
        },
        orderBy: {
          groupMember: { _count: 'desc' },
        },
        take: this.TOP_GROUPS_COUNT,
      });

      const topGroupIds = topGroups.map((g) => g.id);

      // ✅ Reset all highlighted first
      await this.prisma.group.updateMany({
        where: { isHighlighted: true },
        data: { isHighlighted: false },
      });

      // ✅ Set top groups as highlighted
      await this.prisma.group.updateMany({
        where: { id: { in: topGroupIds } },
        data: { isHighlighted: true },
      });

      this.logger.log(`Highlighted groups updated: ${topGroupIds.join(', ')}`);
    } catch (err) {
      this.logger.error('HighlightedGroups processor error', err);
    }

    this.isProcessorIdle = true;

    if (!this.isShutDownInProgress) {
      setTimeout(() => this.processor(), 24 * 60 * 60 * 1000);
    }
  }
}
