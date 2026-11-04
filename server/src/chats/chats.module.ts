import { Module } from '@nestjs/common';
import { ChartsService } from './chats.service';
import { ChartsGateway } from './chats.gateway';
import { PrismaModule } from '../prisma';
import { ChartsController } from './chats.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ChartsController],
  providers: [ChartsGateway, ChartsService],
})
export class ChartsModule {}
