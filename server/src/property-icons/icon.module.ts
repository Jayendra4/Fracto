import { Module } from '@nestjs/common';
import { IconService } from './icon.service';
import { IconController } from './icon.controller';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [IconController],
  providers: [IconService],
  exports: [IconService],
})
export class IconModule {}
