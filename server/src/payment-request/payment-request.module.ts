import { Module } from '@nestjs/common';
import { PaymentRequestService } from './payment-request.service';
import { PaymentRequestController } from './payment-request.controller';
import { PrismaModule } from '../prisma';
import { WalletsModule } from '../wallets';
import { NotificationModule } from '../notification';
import { RazorpayWebhookController, RazorpayWebhookService } from './webhooks';

@Module({
  imports: [PrismaModule, WalletsModule, NotificationModule],
  controllers: [PaymentRequestController, RazorpayWebhookController],
  providers: [PaymentRequestService, RazorpayWebhookService],
  exports: [PaymentRequestService],
})
export class PaymentRequestModule {}
