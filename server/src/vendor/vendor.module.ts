import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { PrismaModule } from '../prisma';
import { MailModule } from '../mail';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
