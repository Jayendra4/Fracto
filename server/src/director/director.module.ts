import { Module } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorController } from './director.controller';
import { PrismaModule } from '../prisma';
import { NotificationModule } from '../notification';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [DirectorController],
  providers: [DirectorService],
})
export class DirectorModule {}
