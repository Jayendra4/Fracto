import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  AccountType,
  NotificationType,
  PaymentMethodType,
  PaymentRequestType,
  RequestStatus,
  WalletTransactionContext,
  WalletType,
} from '../generated/prisma/enums';
import { PaymentRequestFilterDto, VerifyPaymentDto } from './dto';
import {
  AdminNotificationCode,
  AuthenticatedUser,
  AuthorizationService,
  NotificationAudience,
  NotificationCode,
  RazorpayService,
  StorageService,
  UserType,
  UtilsService,
} from '@Common';
import { WalletsService } from '../wallets';
import { NotificationService } from '../notification';
import { Prisma } from '../generated/prisma/client';
import { Decimal } from '../generated/prisma/internal/prismaNamespaceBrowser';

@Injectable()
export class PaymentRequestService {
  private paymentScreenshotPath = 'payment/screenshot';
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly walletservice: WalletsService,
    private readonly utilsService: UtilsService,
    private readonly storageService: StorageService,
    private readonly razorpayService: RazorpayService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  getPaymentScreeshotUrl(screenshot: string): string {
    return this.storageService.getFileUrl(
      screenshot,
      this.paymentScreenshotPath,
    );
  }

  private async validateActivePaymentMethod(
    accountId: number,
    data: {
      methodType: PaymentMethodType;
      bankAccountId?: number;
      upiAccountId?: number;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const prismaClient = tx ?? this.prisma;
    switch (data.methodType) {
      case PaymentMethodType.Bank: {
        if (!data.bankAccountId) {
          throw new Error('Bank account is required');
        }

        const bankAccount = await prismaClient.bankAccount.findFirst({
          where: {
            id: data.bankAccountId,
            paymentOwner: {
              ownerId: accountId,
            },
            isActive: true,
            isDeleted: false,
          },
          select: { id: true },
        });

        if (!bankAccount) {
          throw new Error('Invalid or inactive bank account');
        }

        return;
      }

      case PaymentMethodType.Upi: {
        if (!data.upiAccountId) {
          throw new Error('UPI account is required');
        }

        const upiAccount = await prismaClient.upiAccount.findFirst({
          where: {
            id: data.upiAccountId,
            paymentOwner: {
              ownerId: accountId,
            },
            isActive: true,
            isDeleted: false,
          },
          select: { id: true },
        });

        if (!upiAccount) {
          throw new Error('Invalid or inactive UPI account');
        }

        return;
      }

      default:
        throw new Error('Unsupported payment method type');
    }
  }

  private async notifyAdmin(
    accountId: number,
    paymentRequest: {
      amount: Prisma.Decimal;
      requestType: PaymentRequestType;
    },
  ) {
    const user = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { firstname: true },
    });

    const code =
      paymentRequest.requestType === PaymentRequestType.Deposit
        ? AdminNotificationCode.DEPOSIT_REQUEST_RAISED
        : AdminNotificationCode.WITHDRAWAL_REQUEST_RAISED;

    await this.notificationService._sendNotification({
      code,
      audience: NotificationAudience.ADMIN,
      type: NotificationType.Transactional,
      data: {
        amount: paymentRequest.amount,
        userName: user?.firstname ?? 'User',
      },
      createdById: accountId,
    });
  }

  async create(
    accountId: number,
    data: {
      requestType: PaymentRequestType;
      methodType: PaymentMethodType;
      amount: number;
      bankAccountId?: number;
      upiAccountId?: number;
      utrNumber?: string;
      screenshot?: string;
      gatewayOrderId?: string;
      name?: string;
      email?: string;
      mobile?: string;
    },
    tx?: Prisma.TransactionClient,
  ) {
    if (data.amount <= 0) {
      throw new Error('Invalid amount');
    }

    // await this.validateActivePaymentMethod(accountId, data);
    const paymentRequest = await this.prisma.$transaction(async (tx) => {
      const paymentRequest = await tx.paymentRequest.create({
        data: {
          AccountId: accountId,
          requestType: data.requestType,
          methodType: PaymentMethodType.Bank,
          name: data.name ?? null,
          email: data.email ?? null,
          mobile: data.mobile ?? null,
          amount: data.amount,
          utrNumber: data.utrNumber ?? null,
          screenshot: data.screenshot ?? null,
          gatewayOrderId: data.gatewayOrderId ?? null,
          status: RequestStatus.Pending,
        },
      });

      if (data.screenshot) {
        await this.storageService.move(
          data.screenshot,
          this.paymentScreenshotPath,
        );
      }

      return paymentRequest;
    });

    try {
      await this.notifyAdmin(accountId, {
        amount: paymentRequest.amount,
        requestType: data.requestType,
      });
    } catch (err) {
      console.error('Failed to notify admin of payment request', err);
    }

    return paymentRequest;
  }

  async createDepositRequest(
    accountId: number,
    data: {
      methodType: PaymentMethodType;
      amount: number;
      bankAccountId?: number;
      upiAccountId?: number;
    },
  ) {
    if (data.amount <= 0) {
      throw new Error('Invalid deposit amount');
    }
    const amount: number = Math.round(data.amount * 100);

    return this.prisma.$transaction(async (tx) => {
      await this.validateActivePaymentMethod(accountId, data, tx);
      const paymentRequest = await this.create(
        accountId,
        {
          requestType: PaymentRequestType.Deposit,
          methodType: data.methodType,
          bankAccountId: data.bankAccountId,
          upiAccountId: data.upiAccountId,
          amount: data.amount,
        },
        tx,
      );

      // create razorpay order
      const order = await this.razorpayService.client.orders.create({
        amount: amount,
        currency: 'INR',
        receipt: `deposit_${paymentRequest.id}`,
        payment_capture: true,
      });

      // attach gateway order id
      await tx.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: { gatewayOrderId: order.id },
      });

      return {
        requestId: paymentRequest.id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    });
  }

  async createManualDepositRequest(
    accountId: number,
    data: {
      name: string;
      email: string;
      mobile: string;
      amount: number;
      bankAccountId?: number;
      upiAccountId?: number;
      utrNumber: string;
      screenshot: string;
      // methodType: PaymentMethodType;
    },
  ) {
    if (data.amount <= 0) {
      throw new Error('Invalid deposit amount');
    }

    return this.create(accountId, {
      requestType: PaymentRequestType.Deposit,
      amount: data.amount,
      methodType: PaymentMethodType.Bank,
      utrNumber: data.utrNumber,
      screenshot: data.screenshot,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
    });
  }

  async findAll(
    paymentOwnerId: number,
    type: string,
    query: PaymentRequestFilterDto,
    accountId?: number,
  ) {
    const {
      skip = 0,
      take = 10,
      search,
      status,
      requestType,
      fromDate,
      toDate,
    } = query;

    const where: any = {
      // paymentOwnerId,
    };
    if (type === UserType.Admin || type === AccountType.Trustee) {
      if (accountId) {
        where.AccountId = accountId;
      }
    } else {
      where.AccountId = paymentOwnerId;
    }
    if (status) {
      where.status = status;
    }

    if (requestType) {
      where.requestType = requestType;
    }

    if (fromDate || toDate) {
      where.createdAt = {};

      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(24, 59, 59, 999); // include full day
        where.createdAt.lte = endDate;
      }
    }

    if (search) {
      const parts = search.trim().split(/\s+/);

      where.AND = parts.map((part) => ({
        OR: [
          {
            utrNumber: {
              contains: part,
              mode: 'insensitive',
            },
          },
          {
            remark: {
              contains: part,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: part,
              mode: 'insensitive',
            },
          },

          // bank account search
          {
            bankAccount: {
              OR: [
                {
                  bankName: {
                    contains: part,
                    mode: 'insensitive',
                  },
                },
                {
                  accountNumber: {
                    contains: part,
                    mode: 'insensitive',
                  },
                },
                {
                  accountHolderName: {
                    contains: part,
                    mode: 'insensitive',
                  },
                },
                {
                  ifscCode: {
                    contains: part,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },

          // upi account search
          {
            upiAccount: {
              upiId: {
                contains: part,
                mode: 'insensitive',
              },
            },
          },
        ],
      }));
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.paymentRequest.findMany({
        where: {
          ...where,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          bankAccount: true,
          upiAccount: true,
          account: {
            select: {
              firstname: true,
              lastname: true,
              email: true,
              mobile: true,
            },
          },
        },
      }),
      this.prisma.paymentRequest.count({ where }),
    ]);

    const response = await this.utilsService.batchable(
      data,
      async (paymentRequest) => {
        return {
          ...paymentRequest,
          screenshot: paymentRequest.screenshot
            ? this.getPaymentScreeshotUrl(paymentRequest.screenshot)
            : null,
        };
      },
    );

    return {
      data: response,
      total,
      skip,
      take,
    };
  }

  /**
   * `requestType` doesn't distinguish "manual" from online deposits at the
   * DB level — a manual deposit is just a DEPOSIT request submitted via
   * `deposit/manual` with UTR/screenshot proof. DIRECTPAYMENT (group direct
   * payments) is folded into the Deposit Requests permission too — it's
   * still money coming in, and a standalone "Manual Payments" module would
   * just duplicate what `secondary_group.manual_payment_*` already covers
   * for share-asset interest payments. WITHDRAW maps to Withdrawal Requests.
   */
  private permissionModuleForRequestType(type: PaymentRequestType): string {
    if (type === PaymentRequestType.Withdraw) return 'withdrawal_request';
    return 'deposit_request';
  }

  async updateStatus(
    actingUser: AuthenticatedUser,
    id: number,
    status: RequestStatus,
    remark?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.paymentRequest.findUnique({
        where: { id },
      });

      if (!request) {
        throw new Error('Payment request not found');
      }

      if (request.status !== RequestStatus.Pending) {
        throw new Error('Payment request has already been processed');
      }

      await this.authorizationService.assertPermission(
        actingUser,
        `${this.permissionModuleForRequestType(request.requestType)}.${
          status === RequestStatus.Rejected ? 'reject' : 'approve'
        }`,
      );

      if (status === RequestStatus.Approved) {
        if (request.requestType === PaymentRequestType.Deposit) {
          await this.walletservice.addBalance(
            request.AccountId,
            request.amount,
            WalletType.Main,
            {
              tx,
              context: WalletTransactionContext.Deposit,
              entityId: BigInt(request.id),
              meta: { reference: request.utrNumber },
            },
          );

          await this.notificationService._sendNotification({
            code: NotificationCode.DEPOSIT_REQUEST_APPROVED,
            audience: NotificationAudience.USER,
            type: NotificationType.Informational,
            userIds: [request.AccountId],
          });
        }

        if (request.requestType === PaymentRequestType.Withdraw) {
          await this.walletservice.subtractBalance(
            request.AccountId,
            request.amount,
            WalletType.Main,
            {
              tx,
              context: WalletTransactionContext.Withdrawal,
              entityId: BigInt(request.id),
              meta: { reference: request.id },
            },
          );

          await this.notificationService._sendNotification({
            code: NotificationCode.WITHDRAWAL_REQUEST_APPROVED,
            audience: NotificationAudience.USER,
            type: NotificationType.Informational,
            userIds: [request.AccountId],
          });
        }
      }

      if (status === RequestStatus.Rejected) {
        if (request.requestType === PaymentRequestType.Deposit) {
          await this.notificationService._sendNotification({
            code: NotificationCode.DEPOSIT_REQUEST_REJECTED,
            audience: NotificationAudience.USER,
            type: NotificationType.Informational,
            userIds: [request.AccountId],
          });
        }
        if (request.requestType === PaymentRequestType.Withdraw) {
          await this.notificationService._sendNotification({
            code: NotificationCode.WITHDRAWAL_REQUEST_REJECTED,
            audience: NotificationAudience.USER,
            type: NotificationType.Informational,
            userIds: [request.AccountId],
          });
        }
      }
      const updateRequest = await tx.paymentRequest.update({
        where: { id },
        data: {
          status,
          remark,
        },
      });
      return updateRequest;
    });
  }

  async getOrCreateOwner(ownerType: string, ownerId: number) {
    let owner = await this.prisma.paymentOwner.findFirst({
      where: { ownerType, ownerId },
    });

    if (!owner) {
      owner = await this.prisma.paymentOwner.create({
        data: {
          ownerType,
          ownerId,
        },
      });
    }

    return owner;
  }

  private async verifyPaymentSignature(
    paymentRequest: { gatewayOrderId: string | null },
    data: VerifyPaymentDto,
  ): Promise<boolean> {
    if (!paymentRequest.gatewayOrderId) return false;

    return this.razorpayService.verifyPaymentSignature(
      paymentRequest.gatewayOrderId,
      data.razorpay_payment_id,
      data.razorpay_signature,
    );
  }

  async verifyClientPayment(accountId: number, data: VerifyPaymentDto) {
    const paymentRequest = await this.prisma.paymentRequest.findUnique({
      where: { id: data.purchase_payment_id },
    });

    if (!paymentRequest) {
      throw new Error('Payment request not found');
    }

    if (paymentRequest.AccountId !== accountId) {
      throw new Error('Unauthorized payment verification');
    }

    if (paymentRequest.status === RequestStatus.Completed) {
      return {
        message: 'Payment already verified via webhook',
        status: true,
      };
    }

    const isValid = await this.verifyPaymentSignature(paymentRequest, data);

    if (!isValid) {
      await this.prisma.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: {
          status: RequestStatus.Failed,
          failedAt: new Date(),
        },
      });

      throw new Error('Payment signature verification failed');
    }

    await this.prisma.paymentRequest.update({
      where: { id: paymentRequest.id },
      data: {
        status: RequestStatus.Processing,
        gatewayPaymentId: data.razorpay_payment_id,
      },
    });

    return {
      message: 'Payment acknowledged. Waiting for confirmation.',
      status: true,
    };
  }

  async payoutRequest(
    accountId: number,
    data: {
      amount: number;
      methodType: PaymentMethodType;
      walletType?: WalletType;
      fundAccountId?: string;
      bankAccountId?: number;
      upiAccountId?: number;
    },
  ) {
    // try {
    if (data.amount <= 0) {
      throw new Error('Invalid withdraw amount');
    }
    if (!data.fundAccountId) {
      throw new Error('fund account required');
    }

    const amount = new Decimal(data.amount);

    const findUser = await this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
      select: { firstname: true, lastname: true },
    });

    // Transaction: Deduct + Create PaymentRequest
    const paymentRequest = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findFirst({
        where: { accountId, type: data.walletType },
      });

      if (!wallet) throw new Error('Account not found');

      if (wallet.amount.lt(amount)) {
        throw new Error('Insufficient balance');
      }

      // Prevent multiple pending withdraw
      const existingPending = await tx.paymentRequest.findFirst({
        where: {
          AccountId: accountId,
          requestType: PaymentRequestType.Withdraw,
          status: RequestStatus.Pending,
        },
      });

      if (existingPending) {
        throw new Error('Withdraw already pending');
      }

      // Create PaymentRequest
      return tx.paymentRequest.create({
        data: {
          AccountId: accountId,
          requestType: PaymentRequestType.Withdraw,
          methodType: data.methodType,
          bankAccountId: data.bankAccountId,
          upiAccountId: data.upiAccountId,
          fundAccountId: data.fundAccountId,
          amount: data.amount,
          status: RequestStatus.Pending,
        },
      });
    });

    await this.notificationService._sendNotification({
      code: AdminNotificationCode.WITHDRAWAL_REQUEST_RAISED,
      audience: NotificationAudience.ADMIN,
      type: NotificationType.Informational,
      data: {
        amount: data.amount,
        userName: findUser?.firstname ?? 'User',
      },
    });
    // Call Razorpay OUTSIDE transaction
    // try {
    //   const payout = await this.razorpayService.createPayout({
    //     fundAccountId: String(data.fundAccountId),
    //     amount: data.amount,
    //     referenceId: paymentRequest.id.toString(),
    //   });

    //   // Save payout ID
    //   await this.prisma.paymentRequest.update({
    //     where: { id: paymentRequest.id },
    //     data: {
    //       gatewayPayoutId: payout.id,
    //       status: RequestStatus.Processing,
    //     },
    //   });

    return paymentRequest;
    // } catch (error) {
    // Refund wallet in NEW transaction
    // console.log('error', error);
    // await this.prisma.$transaction(async (tx) => {
    //   await this.walletservice.addBalance(
    //     accountId,
    //     new Decimal(data.amount),
    //     WalletType.Main,
    //     {
    //       tx,
    //       context: WalletTransactionContext.WithdrawalRefund,
    //     },
    //   );

    //   await tx.paymentRequest.update({
    //     where: { id: paymentRequest.id },
    //     data: {
    //       status: RequestStatus.Failed,
    //       failedAt: new Date(),
    //       remark: 'Payout API failed',
    //     },
    //   });
    // });

    // throw new Error('Withdraw failed');
    // }
  }
}
