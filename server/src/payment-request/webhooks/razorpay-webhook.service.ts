import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import {
  // InterestPaymentStatus,
  PaymentGateway,
  PaymentRequestType,
  RequestStatus,
  WalletTransactionContext,
  WalletType,
} from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma';
import { WalletsService } from '../../wallets';

@Injectable()
export class RazorpayWebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletservice: WalletsService,
  ) {}

  private async handleCaptured(payment: {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: number;
  }) {
    if (
      !payment?.id ||
      !payment?.order_id ||
      typeof payment.amount !== 'number' ||
      payment.currency !== 'INR' ||
      payment.status !== 'captured'
    ) {
      return;
    }

    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;
    const amountInRupees = new Prisma.Decimal(payment.amount).div(100);

    await this.prisma.$transaction(async (tx) => {
      const paymentRequest = await tx.paymentRequest.findUnique({
        where: { gatewayOrderId: razorpayOrderId },
      });

      if (!paymentRequest) return;

      if (paymentRequest.status === RequestStatus.Completed) {
        return;
      }

      if (paymentRequest.status !== RequestStatus.Pending) {
        return;
      }

      if (paymentRequest.requestType === PaymentRequestType.DirectPayment) {
        // await tx.paymentRequest.update({
        //   where: { id: paymentRequest.id },
        //   data: {
        //     status: RequestStatus.Completed,
        //     gatewayPaymentId: razorpayPaymentId,
        //     paidAt: new Date(payment.created_at * 1000),
        //   },
        // });

        // await tx.assetInterest.updateMany({
        //   where: { razorpayOrderId: razorpayOrderId },
        //   data: {
        //     paymentStatus: InterestPaymentStatus.Paid,
        //     razorpayPaymentId: razorpayPaymentId,
        //     paidAt: new Date(payment.created_at * 1000),
        //   },
        // });

        return;
      }

      await this.walletservice.addBalance(
        paymentRequest.AccountId,
        amountInRupees,
        WalletType.Main,
        {
          tx,
          context: WalletTransactionContext.Deposit,
          entityId: BigInt(paymentRequest.id),
          meta: { reference: razorpayPaymentId },
        },
      );

      await tx.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: {
          status: RequestStatus.Completed,
          gatewayPaymentId: razorpayPaymentId,
          paidAt: new Date(payment.created_at * 1000),
        },
      });
    });
  }

  async process(event: any) {
    if (!event || !event.event) {
      throw new Error('Invalid webhook payload');
    }

    const paymentId = event?.payload?.payment?.entity?.id ?? 'unknown';
    const eventId = `${event.event}_${event.created_at}_${paymentId}`;

    // console.log('data evet evemnt', paymentId, event);
    await this.prisma.$transaction(async (tx) => {
      const exists = await tx.paymentWebhookEvent.findUnique({
        where: { eventId },
      });

      if (exists) {
        console.log('Webhook already processed:', eventId);
        return;
      }
      // console.log('data event', exists);

      await tx.paymentWebhookEvent.create({
        data: {
          gateway: PaymentGateway.Razorpay,
          eventId,
          eventType: event.event,
          payload: event,
        },
      });

      switch (event.event) {
        case 'payment.captured': {
          const paymentEntity = event?.payload?.payment?.entity;
          if (!paymentEntity || !paymentEntity.id) {
            console.error('Invalid payment entity in webhook');
            return;
          }
          // console.log('data payementEnoity', paymentEntity);

          await this.handleCaptured(paymentEntity);
          break;
        }

        case 'payout.processed':
          await this.handlePayoutSuccess(tx, event.payload.payout.entity);
          break;

        case 'payout.failed':
        case 'payout.reversed':
          await this.handlePayoutFailed(tx, event.payload.payout.entity);
          break;

        default:
          console.log('Unhandled webhook event:', event.event);
      }
    });
  }

  private async handlePayoutSuccess(
    tx: Prisma.TransactionClient,
    payout: { id: string; status: string },
  ) {
    if (!payout?.id || payout.status !== 'processed') return;

    const withdrawal = await tx.paymentRequest.findFirst({
      where: {
        gatewayPayoutId: payout.id,
        status: RequestStatus.Processing,
      },
    });

    if (!withdrawal) return;

    await tx.paymentRequest.update({
      where: { id: withdrawal.id },
      data: {
        status: RequestStatus.Completed,
      },
    });
  }

  private async handlePayoutFailed(
    tx: Prisma.TransactionClient,
    payout: { id: string },
  ) {
    if (!payout?.id) return;

    const withdrawal = await tx.paymentRequest.findFirst({
      where: {
        gatewayPayoutId: payout.id,
        status: {
          in: [RequestStatus.Pending, RequestStatus.Processing],
        },
      },
    });

    if (!withdrawal) return;

    const amount = new Prisma.Decimal(withdrawal.amount);

    await this.walletservice.addBalance(
      withdrawal.AccountId,
      amount,
      WalletType.Main,
      {
        tx,
        context: WalletTransactionContext.WithdrawalRefund,
      },
    );

    await tx.paymentRequest.update({
      where: { id: withdrawal.id },
      data: {
        status: RequestStatus.Failed,
        failedAt: new Date(),
      },
    });
  }
}
