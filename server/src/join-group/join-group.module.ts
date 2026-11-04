import { Module } from '@nestjs/common';
import { JoinGroupService } from './join-group.services';
import { JoinGroupController } from './join-group.controller';
import { PrismaModule } from '../prisma';
import { AccountsModule } from '../accounts';
import { NotificationModule } from '../notification';

@Module({
  imports: [PrismaModule, AccountsModule, NotificationModule],
  controllers: [JoinGroupController],
  providers: [JoinGroupService],
  exports: [JoinGroupService],
})
export class JoinGroupModule {}
