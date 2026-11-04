import { Module } from '@nestjs/common';
import { OverviewService } from './overview.service';
import { OverviewController } from './overview.controller';
import { PrismaModule } from '../prisma';
import { NotificationModule } from '../notification';
import { VoteModule } from '../vote/vote.module';

@Module({
  imports: [PrismaModule, NotificationModule, VoteModule],
  controllers: [OverviewController],
  providers: [OverviewService],
})
export class OverviewModule {}
