import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { PrismaModule } from '../prisma';
import { SpvModule } from '../spv/spv.module';
import { NotificationModule } from '../notification';

@Module({
  imports: [PrismaModule, SpvModule, NotificationModule],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}
