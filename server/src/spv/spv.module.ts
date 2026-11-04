import { Module } from '@nestjs/common';
import { SpvService } from './spv.service';
import { SpvController } from './spv.controller';
import { PrismaModule } from '../prisma';
import { NotificationModule } from '../notification';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [SpvController],
  providers: [SpvService],
  exports: [SpvService],
})
export class SpvModule {}
