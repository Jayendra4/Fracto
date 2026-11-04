import { Module } from '@nestjs/common';
import { ShareAssetService } from './share-assets.services';
import { ShareAssetController } from './share-asset.controller';
import { PrismaModule } from '../prisma';
import { MailModule } from '../mail';
import { PaymentRequestModule } from '../payment-request/payment-request.module';
import { NotificationModule } from '../notification';
import { InvoiceService } from '../invoice/invoice.service';

@Module({
  imports: [PrismaModule, MailModule, PaymentRequestModule, NotificationModule],
  controllers: [ShareAssetController],
  providers: [ShareAssetService, InvoiceService],
  exports: [ShareAssetService],
})
export class ShareAssetModule {}
