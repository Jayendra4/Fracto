import { Module } from '@nestjs/common';
import { ClubMembershipService } from './club-membership.service';
import { ClubMembershipController } from './club-membership.controller';
import { PrismaModule } from '../prisma';
import { SpvModule } from '../spv/spv.module';
import { NotificationModule } from '../notification';

@Module({
  imports: [PrismaModule, SpvModule, NotificationModule],
  controllers: [ClubMembershipController],
  providers: [ClubMembershipService],
  exports: [ClubMembershipService],
})
export class ClubMembershipModule {}
