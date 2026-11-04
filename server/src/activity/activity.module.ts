import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { PrismaModule } from '../prisma';
import { ActivityController } from './activity.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
