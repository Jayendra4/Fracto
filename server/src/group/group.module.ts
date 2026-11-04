import { Module } from '@nestjs/common';
import { GroupService } from './group.services';
import { GroupController } from './group.controller';
import { PrismaModule } from '../prisma';
import { HighlightedGroupsProcessor } from './processor/top-highlighted-group.processor';
import { NotificationModule } from '../notification';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [GroupController],
  providers: [GroupService, HighlightedGroupsProcessor],
  exports: [GroupService],
})
export class GroupModule {}
