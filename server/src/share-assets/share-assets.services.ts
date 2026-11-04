import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  AssetInterest,
  AssetStatus,
  InterestPaymentStatus,
  InvoiceDetails,
  NotificationType,
  PaymentMethodType,
  PaymentRequestType,
  // PaymentRequestType,
  Prisma,
  ReferralApprovalStatus,
  RequestStatus,
  SharedAssetStatus,
} from '../generated/prisma/client';
import { MailService } from '../mail';
import { adminConfigFactory } from '@Config';
import { ConfigType } from '@nestjs/config';
import { NotificationService } from '../notification';
import {
  AdminNotificationCode,
  NotificationAudience,
  NotificationCode,
  RazorpayService,
  StorageService,
  UtilsService,
} from '@Common';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class ShareAssetService {
  private paymentScreenshotPath = 'payment/screenshot';
  constructor(
    @Inject(adminConfigFactory.KEY)
    private readonly adminConfig: ConfigType<typeof adminConfigFactory>,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    private readonly razorpayService: RazorpayService,
    private readonly storageService: StorageService,
    private readonly invoiceService: InvoiceService,
    private readonly utilsService: UtilsService,
  ) {}

  private buildPaginationMeta(skip: number, take: number, totalItems: number) {
    const limit = take > 0 ? take : totalItems;
    const page = limit > 0 ? Math.floor(skip / limit) + 1 : 1;
    const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

    return {
      skip: page,
      take: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  getPaymentScreeshotUrl(screenshot: string): string {
    return this.storageService.getFileUrl(
      screenshot,
      this.paymentScreenshotPath,
    );
  }

  private async sendInvoice(data: {
    interest: any;
    razorpayPaymentId: string;
    paidAt: Date;
  }) {
    const { interest, razorpayPaymentId, paidAt } = data;

    const userName = `${interest.account.firstname} ${interest.account.lastname}`;
    const userEmail = interest.account.email;
    const assetTitle = interest.sharedAsset.asset.assetTitle;
    const tokenAmount = Number(interest.tokenAmount);
    const orderId = interest.razorpayOrderId!;
    const userMobile = interest.account.mobile;
    const assetId = interest.sharedAsset.assetId;

    const pdfBuffer = await this.invoiceService.generateInvoicePdf({
      orderId,
      userName,
      userEmail,
      assetTitle,
      tokenAmount,
      paidAt,
      paymentId: razorpayPaymentId,
    });

    const filename = `invoice_${Date.now()}_${orderId}.pdf`;
    const invoiceUrl = await this.storageService.saveFile(
      filename,
      pdfBuffer,
      'invoices',
    );

    console.log(invoiceUrl);
    //send notification
    await this.mailService.send({
      to: userEmail,
      subject: `Payment Confirmation & Invoice – Property Verification Report for ${assetTitle}`,
      mailBodyOrTemplate: {
        name: 'payment-invoice',
        data: {
          name: userName,
          assetTitle: assetTitle,
          amount: tokenAmount,
          orderId: orderId,
          razorpayPaymentId: razorpayPaymentId,
          invoiceUrl,
        },
      },
    });

    try {
      await this.prisma.invoiceDetails.create({
        data: {
          firstName: interest.account.firstname,
          lastName: interest.account.lastname,
          email: userEmail,
          mobile: userMobile,
          assetTitle: assetTitle,
          tokenAmount: tokenAmount,
          orderId: orderId,
          rozarpayPaymentId: razorpayPaymentId,
          paidAt: paidAt,
          assetId: assetId,
          invoiceUrl: invoiceUrl,
        },
      });

      await this.notificationService._sendNotification({
        code: AdminNotificationCode.DOCUMENT_VERIFICATION_CHARGE,
        audience: NotificationAudience.ADMIN,
        type: NotificationType.Transactional,
        data: {
          userName: `${interest.account.firstname} ${interest.account.lastname}`,
          propertyName: assetTitle,
        },
      });
    } catch (error) {
      console.error('Create Invoice details failed', error);
      throw new Error('Create Invoice details', error);
    }
  }

  async reviewAsset(data: {
    title?: string;
    description?: string;
    sharedAssetId: number;
    adminId: number;
    status: SharedAssetStatus;
    rejectNote?: string;
    tokenAmount?: number;
  }) {
    try {
      if (data.status === SharedAssetStatus.Pending) {
        throw new Error('Status must be APPROVED or REJECTED');
      }

      let assetTitle: string = '';
      const reviewAsset = await this.prisma.$transaction(async (tx) => {
        const sharedAsset = await tx.sharedAsset.findUnique({
          where: { assetId: data.sharedAssetId },
        });

        const assetInf = await tx.asset.findFirst({
          where: { id: sharedAsset?.assetId },
          select: {
            assetTitle: true,
          },
        });

        assetTitle = assetInf!.assetTitle;
        if (!sharedAsset) throw new Error('Shared asset not found');
        if (sharedAsset.status !== SharedAssetStatus.Pending) {
          throw new Error('Asset has already been Approved or Rejected');
        }

        await tx.asset.update({
          where: { id: sharedAsset?.assetId },
          data:
            data.status === SharedAssetStatus.Approved
              ? {
                  status: AssetStatus.Reviewed,
                  steps: '2',
                  approvedAt: new Date(),
                  rejectionReason: null,
                  rejectedAt: null,
                }
              : {
                  status: AssetStatus.Rejected,
                  rejectionReason: data.rejectNote,
                  rejectedAt: new Date(),
                },
        });

        const updateSharedStatus = await tx.sharedAsset.update({
          where: { assetId: data.sharedAssetId },
          data: {
            status: data.status,
            approvedBy: data.adminId,
            approvedAt: new Date(),
            tokenAmount:
              data.status === SharedAssetStatus.Approved
                ? data.tokenAmount
                : null,
            rejectNote:
              data.status === SharedAssetStatus.Rejected
                ? data.rejectNote
                : null,
          },
        });

        if (data.status === SharedAssetStatus.Approved) {
          const existingClubForAsset = await tx.secondaryClubs.findFirst({
            where: { assetId: sharedAsset.assetId },
          });
          if (existingClubForAsset) {
            throw new BadRequestException(
              'This asset already has a secondary club',
            );
          }

          await tx.secondaryClubs.create({
            data: {
              title: data.title,
              description: data.description,
              assetId: sharedAsset.assetId,
              status: 'created-group',
            },
          });
          await this.notificationService._sendNotification({
            code: NotificationCode.BASIC_INFORM_APPROVED,
            audience: NotificationAudience.USER,
            type: NotificationType.Informational,
            userIds: [sharedAsset?.sharedById],
            data: {
              groupIds: sharedAsset.submittedToGroupIds[0],
              assetId: sharedAsset.assetId,
              assetTitle: assetTitle,
            },
          });
        } else {
          await this.notificationService._sendNotification({
            code: NotificationCode.BASIC_INFORM_REJECTED,
            audience: NotificationAudience.USER,
            type: NotificationType.Informational,
            userIds: [sharedAsset?.sharedById],
            data: {
              groupIds: sharedAsset.submittedToGroupIds[0],
              assetId: sharedAsset.assetId,
              assetTitle: assetTitle,
            },
          });
        }
        return updateSharedStatus;
      });
      return reviewAsset;
    } catch (error) {
      throw error;
    }
  }

  async shareToGroups(data: { sharedAssetId: number; groupIds: number[] }) {
    const sharedAsset = await this.prisma.sharedAsset.findUnique({
      where: { assetId: data.sharedAssetId },
    });

    if (!sharedAsset) throw new Error('Shared asset not found');
    if (sharedAsset.status !== SharedAssetStatus.Approved) {
      throw new Error('Only approved assets can be shared to groups');
    }

    const shareAssetInGroup = await this.prisma.sharedAssetGroup.createMany({
      data: data.groupIds.map((groupId) => ({
        sharedAssetId: sharedAsset.id,
        sharedBy: 'admin',
        groupId,
      })),
      skipDuplicates: true,
    });

    // Notification send
    try {
      const groupMembers = await this.prisma.groupMember.findMany({
        where: { groupId: { in: data.groupIds } },
      });

      const userIds = groupMembers
        .map((m) => m.accountId)
        .filter((id): id is number => id !== null);

      const findAssetTitle = await this.prisma.asset.findFirst({
        where: { id: sharedAsset.assetId },
        select: { assetTitle: true },
      });
      await this.notificationService._sendNotification({
        code: NotificationCode.ASSET_SHARE_IN_GROUP,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: userIds,
        data: {
          assetId: sharedAsset.assetId,
          propertyName: findAssetTitle?.assetTitle ?? '',
        },
      });
    } catch (notificationError) {
      console.error('Notification failed', notificationError);
    }
    return shareAssetInGroup;
  }

  async getGroupAssets(groupId: number) {
    return await this.prisma.sharedAssetGroup.findMany({
      where: {
        groupId,
        sharedAsset: { status: SharedAssetStatus.Approved },
      },
      include: {
        group: {
          include: {
            _count: {
              select: {
                groupMember: true,
                sharedAssetGroups: true,
              },
            },
            groupMember: {
              select: {
                account: { select: { firstname: true, lastname: true } },
              },
            },
          },
        },
        sharedAsset: {
          include: {
            asset: { include: { meta: true, documents: true, price: true } },
          },
        },
      },
    });
  }

  async getUserOwnAsset(
    accountId: number,
    groupId: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
      assetStatus?: SharedAssetStatus;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const search = options?.search?.trim();
    const pagination = {
      skip: options?.skip || 0,
      take: options?.take || 10,
    };

    const where: Prisma.SharedAssetWhereInput = {
      OR: [
        {
          sharedById: accountId,
          groupShares: {
            some: { groupId },
          },
        },
        {
          asset: {
            accountId: accountId,
            ownerStatus: ReferralApprovalStatus.Approved,
          },
          groupShares: {
            some: { groupId },
          },
        },
      ],

      ...(options?.assetStatus && { status: options.assetStatus }),

      ...(search && {
        asset: {
          OR: [
            {
              assetTitle: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              currentOwnerName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    };
    const [count, data] = await Promise.all([
      this.prisma.sharedAsset.count({ where }),

      this.prisma.sharedAsset.findMany({
        where,
        include: {
          asset: { include: { meta: true, documents: true, price: true } },
          groupShares: {
            where: { groupId },
          },
        },
        orderBy: { id: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return {
      count,
      skip: pagination.skip,
      take: pagination.take,
      data,
    };
  }

  async interest(
    groupId: number,
    data: {
      sharedAssetId: number;
      accountId: number;
      requestType: PaymentRequestType;
      methodType: PaymentMethodType;
    },
  ) {
    try {
      const sharedAsset = await this.prisma.sharedAsset.findUnique({
        where: {
          assetId: data.sharedAssetId,
        },
      });

      if (!sharedAsset) throw new Error('Asset not found');
      if (sharedAsset.status !== SharedAssetStatus.Approved) {
        throw new Error('Asset is not available');
      }
      if (!sharedAsset.tokenAmount) {
        throw new Error('Token amount not set for this asset');
      }
      // console.log('data', sharedAsset);

      const existing = await this.prisma.assetInterest.findUnique({
        where: {
          sharedAssetId_accountId: {
            sharedAssetId: sharedAsset.id,
            accountId: data.accountId,
          },
          groupId: groupId,
        },
      });
      if (existing) {
        if (existing.paymentStatus === InterestPaymentStatus.Paid) {
          throw new Error('Already expressed interest');
        }
        if (existing.razorpayOrderId) {
          return {
            interestId: existing.id,
            orderId: existing.razorpayOrderId,
            amount: Number(sharedAsset.tokenAmount) * 100,
            currency: 'INR',
          };
        }
      }

      const amount = Math.round(Number(sharedAsset.tokenAmount) * 100);

      return this.prisma.$transaction(async (tx) => {
        const interest = existing
          ? existing
          : await tx.assetInterest.update({
              where: {
                sharedAssetId_accountId: {
                  sharedAssetId: sharedAsset.id,
                  accountId: data.accountId,
                },
              },
              data: {
                tokenAmount: Number(sharedAsset.tokenAmount),
                paymentStatus: InterestPaymentStatus.Pending,
              },
            });

        const paymentRequest = await this.prisma.paymentRequest.create({
          data: {
            AccountId: data.accountId,
            requestType: data.requestType,
            methodType: data.methodType,
            amount: Number(sharedAsset.tokenAmount),
            status: RequestStatus.Pending,
          },
        });

        // Step 3: Create Razorpay order
        const order = await this.razorpayService.client.orders.create({
          amount,
          currency: 'INR',
          receipt: `interest_${interest.id}`,
          payment_capture: true,
        });

        // this.notifyAdmin(
        //   data.accountId,
        //   {
        //     amount: paymentRequest.amount,
        //     requestType: data.requestType,
        //   },
        //   tx,
        // ).catch(() => {});

        await tx.paymentRequest.update({
          where: { id: paymentRequest.id },
          data: { gatewayOrderId: order.id },
        });

        await tx.assetInterest.update({
          where: { id: interest.id },
          data: { razorpayOrderId: order.id },
        });

        return {
          interestId: interest.id,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('You have already expressed interest in this asset');
      }

      throw error;
    }
  }

  async interestCount(
    groupId: number,
    data: {
      sharedAssetId: number;
      accountId: number;
    },
  ) {
    try {
      const sharedAsset = await this.prisma.sharedAsset.findUnique({
        where: {
          assetId: data.sharedAssetId,
        },
      });

      if (!sharedAsset) throw new Error('Asset not found');
      if (sharedAsset.status !== SharedAssetStatus.Approved) {
        throw new Error('Asset is not available');
      }
      if (!sharedAsset.tokenAmount) {
        throw new Error('Token amount not set for this asset');
      }
      // console.log('data', sharedAsset);

      const existing = await this.prisma.assetInterest.findUnique({
        where: {
          sharedAssetId_accountId: {
            sharedAssetId: sharedAsset.id,
            accountId: data.accountId,
          },
          groupId: groupId,
        },
      });
      if (existing) {
        if (existing.paymentStatus === InterestPaymentStatus.Pending) {
          throw new Error('Already expressed interest');
        }
        if (existing.razorpayOrderId) {
          return {
            interestId: existing.id,
            orderId: existing.razorpayOrderId,
            amount: Number(sharedAsset.tokenAmount) * 100,
            currency: 'INR',
          };
        }
      }

      return this.prisma.$transaction(async (tx) => {
        const interest = existing
          ? existing
          : await tx.assetInterest.create({
              data: {
                sharedAssetId: sharedAsset.id,
                accountId: data.accountId,
                groupId: groupId,
                tokenAmount: Number(sharedAsset.tokenAmount),
              },
            });

        return interest;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('You have already expressed interest in this asset');
      }

      throw error;
    }
  }

  async verifyInterestPayment(data: {
    accountId: number;
    interestId: number;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const interest = await this.prisma.assetInterest.findUnique({
      where: { id: data.interestId, accountId: data.accountId },
      include: {
        account: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
          },
        },
        sharedAsset: {
          select: {
            assetId: true,
            asset: {
              select: { assetTitle: true },
            },
          },
        },
      },
    });

    if (!interest) throw new Error('Interest record not found');
    if (interest.paymentStatus === InterestPaymentStatus.Paid) {
      throw new Error('Payment already verified');
    }

    // Reuse your existing verifyPaymentSignature
    const isValid = this.razorpayService.verifyPaymentSignature(
      interest!.razorpayOrderId!,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );

    if (!isValid) throw new Error('Invalid payment signature');

    const updatedInterest = await this.prisma.assetInterest.update({
      where: { id: data.interestId },
      data: {
        paymentStatus: InterestPaymentStatus.Paid,
        isPayment: true,
        razorpayPaymentId: data.razorpayPaymentId,
        paidAt: new Date(),
      },
    });

    this.sendInvoice({
      interest,
      razorpayPaymentId: data.razorpayPaymentId,
      paidAt: updatedInterest.paidAt!,
    }).catch((error) => {
      console.error('Invoice send failed', error);
      throw new Error('Invoice send failed', error);
    });
    return updatedInterest;
  }

  async submitManualPayment(
    accountId: number,
    assetId: number,
    data: {
      name: string;
      mobile: string;
      email: string;
      amount: number;
      utrNumber: string;
      screenshot: string;
      consent: boolean;
    },
  ) {
    const sharedAsset = await this.prisma.sharedAsset.findUnique({
      where: { assetId },
      include: {
        asset: {
          select: {
            assetTitle: true,
          },
        },
      },
    });

    if (!sharedAsset) throw new Error('Asset not found');
    if (sharedAsset.status !== SharedAssetStatus.Approved) {
      throw new Error('Asset is not available');
    }
    if (!sharedAsset.tokenAmount) {
      throw new Error('Token amount not set for this asset');
    }

    const existing = await this.prisma.assetInterest.findUnique({
      where: {
        sharedAssetId_accountId: {
          sharedAssetId: sharedAsset.id,
          accountId,
        },
      },
    });

    if (existing?.paymentStatus === InterestPaymentStatus.Paid) {
      throw new Error('Payment already verified');
    }

    const manualPaymentFields = {
      payerName: data.name,
      payerMobile: data.mobile,
      payerEmail: data.email,
      amountPaid: data.amount,
      utrNumber: data.utrNumber,
      paymentScreenshot: data.screenshot,
      consent: data.consent,
      paymentStatus: InterestPaymentStatus.Pending,
      rejectionReason: null,
      reviewedById: null,
      reviewedAt: null,
    };
    return await this.prisma.$transaction(async (tx) => {
      const paymentRequest = await tx.paymentRequest.create({
        data: {
          AccountId: accountId,
          requestType: PaymentRequestType.DirectPayment,
          methodType: PaymentMethodType.Bank,
          name: data.name ?? null,
          email: data.email ?? null,
          mobile: data.mobile ?? null,
          amount: data.amount,
          utrNumber: data.utrNumber ?? null,
          screenshot: data.screenshot ?? null,
          status: RequestStatus.Pending,
        },
      });

      const manualPayment = await tx.assetInterest.upsert({
        where: {
          sharedAssetId_accountId: {
            sharedAssetId: sharedAsset.id,
            accountId,
          },
        },
        create: {
          sharedAssetId: sharedAsset.id,
          accountId,
          tokenAmount: Number(sharedAsset.tokenAmount),
          paymentRequestId: paymentRequest.id,
          ...manualPaymentFields,
        },
        update: {
          paymentRequestId: paymentRequest.id,
          ...manualPaymentFields,
        },
      });

      if (data.screenshot) {
        await this.storageService.move(
          data.screenshot,
          this.paymentScreenshotPath,
        );
      }

      await this.notificationService._sendNotification({
        code: AdminNotificationCode.ADMIN_MANUAL_PAYMENT_FOR_DOCUMENT,
        audience: NotificationAudience.ADMIN,
        type: NotificationType.Transactional,
        data: {
          assetTitle: sharedAsset.asset.assetTitle,
        },
      });

      return manualPayment;
    });
  }

  async reviewManualPayment(
    adminId: number,
    interestId: number,
    data: {
      status: InterestPaymentStatus;
      rejectionReason?: string;
    },
  ) {
    const interest = await this.prisma.assetInterest.findUnique({
      where: { id: interestId },
      include: {
        sharedAsset: {
          select: { assetId: true, asset: { select: { assetTitle: true } } },
        },
      },
    });

    if (!interest) throw new Error('Interest record not found');
    if (interest.paymentStatus === InterestPaymentStatus.Paid) {
      throw new Error('Payment already verified');
    }
    if (!interest.utrNumber) {
      throw new Error('No manual payment submission found for this interest');
    }

    if (data.status === InterestPaymentStatus.Failed && !data.rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    const isApproved = data.status === InterestPaymentStatus.Paid;
    const now = new Date();

    if (!isApproved) {
      return this.prisma.$transaction(async (tx) => {
        if (interest.paymentRequestId) {
          await tx.paymentRequest.update({
            where: { id: interest.paymentRequestId },
            data: {
              status: RequestStatus.Rejected,
              remark: data.rejectionReason,
            },
          });
        }

        return tx.assetInterest.update({
          where: { id: interestId },
          data: {
            paymentStatus: InterestPaymentStatus.Failed,
            rejectionReason: data.rejectionReason,
            reviewedById: adminId,
            reviewedAt: now,
          },
        });
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const assetId = interest.sharedAsset.assetId;

      const club = await tx.secondaryClubs.findFirst({ where: { assetId } });

      if (interest.paymentRequestId) {
        await tx.paymentRequest.update({
          where: { id: interest.paymentRequestId },
          data: {
            status: RequestStatus.Approved,
          },
        });
      }
      const updatePayment = tx.assetInterest.update({
        where: { id: interestId },
        data: {
          paymentStatus: InterestPaymentStatus.Paid,
          isPayment: true,
          paidAt: now,
          reviewedById: adminId,
          reviewedAt: now,
          rejectionReason: null,
          secondaryClubId: club ? club.id : null,
        },
      });
      await this.notificationService._sendNotification({
        code: NotificationCode.ADMIN_MANUAL_PAYMENT_VERIFY_FOR_DOC,
        audience: NotificationAudience.USER,
        userIds: [interest.accountId],
        type: NotificationType.Transactional,
        data: {
          assetTitle: interest.sharedAsset.asset.assetTitle,
          assetId: interest.sharedAsset.assetId,
        },
      });

      return updatePayment;
    });
  }

  async getManualPaymentList(options?: {
    search?: string;
    skip?: number;
    take?: number;
    paymentStatus?: InterestPaymentStatus;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: AssetInterest[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.AssetInterestWhereInput = {
      utrNumber: { not: null },
      ...(options?.paymentStatus && { paymentStatus: options.paymentStatus }),
      ...(search && {
        AND: search
          .split(' ')
          .filter((part) => part.trim())
          .map((part) => ({
            OR: [
              { payerName: { contains: part.trim(), mode: 'insensitive' } },
              { payerEmail: { contains: part.trim(), mode: 'insensitive' } },
              { payerMobile: { contains: part.trim(), mode: 'insensitive' } },
              { utrNumber: { contains: part.trim(), mode: 'insensitive' } },
            ],
          })),
      }),
    };

    const [count, payments] = await Promise.all([
      this.prisma.assetInterest.count({ where }),
      this.prisma.assetInterest.findMany({
        where,
        include: {
          account: {
            select: {
              firstname: true,
              lastname: true,
              email: true,
              mobile: true,
            },
          },
          sharedAsset: {
            select: {
              assetId: true,
              tokenAmount: true,
              asset: {
                select: {
                  assetTitle: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: Prisma.SortOrder.desc },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const response = await this.utilsService.batchable(
      payments,
      async (payment) => {
        return {
          ...payment,
          paymentScreenshot: payment.paymentScreenshot
            ? this.getPaymentScreeshotUrl(payment.paymentScreenshot)
            : null,
        };
      },
    );

    return {
      count,
      skip: pagination.skip,
      take: pagination.take,
      data: response,
    };
  }

  async getPaidAssets(options?: {
    search?: string;
    skip?: number;
    take?: number;
    memberSkip?: number;
    memberTake?: number;
  }) {
    const { search, skip, take, memberSkip, memberTake } = options ?? {};

    const paidInterests = await this.prisma.assetInterest.findMany({
      where: { paymentStatus: InterestPaymentStatus.Paid },
      select: { sharedAssetId: true },
      distinct: ['sharedAssetId'],
      orderBy: { paidAt: 'desc' },
    });

    const paidSharedAssetIds = paidInterests.map((p) => p.sharedAssetId);

    // Every created secondary club must be surfaced here, even one with
    // zero investors so far — a club's existence isn't gated on investment,
    // so we can't derive the id list purely from paid AssetInterest rows.
    const clubs = await this.prisma.secondaryClubs.findMany({
      select: { assetId: true },
    });
    const clubAssetIds = clubs
      .map((c) => c.assetId)
      .filter((id): id is number => id != null);

    const clubbedSharedAssets = clubAssetIds.length
      ? await this.prisma.sharedAsset.findMany({
          where: { assetId: { in: clubAssetIds } },
          select: { id: true },
        })
      : [];
    const clubbedIds = new Set(clubbedSharedAssets.map((sa) => sa.id));

    // paid shared assets that have a club, in their existing paid-first
    // order, followed by clubbed shared assets with no paid investor yet
    const paidClubbedIds = paidSharedAssetIds.filter((id) =>
      clubbedIds.has(id),
    );
    const seenIds = new Set(paidClubbedIds);
    const zeroInvestorClubbedIds = [...clubbedIds].filter(
      (id) => !seenIds.has(id),
    );
    const allSharedAssetIds = [...paidClubbedIds, ...zeroInvestorClubbedIds];

    if (allSharedAssetIds.length === 0) {
      return {
        count: 0,
        data: [],
        pagination: this.buildPaginationMeta(skip ?? 0, take ?? 10, 0),
      };
    }

    // outer pagination: slice the id list first so `count` reflects the
    // total number of distinct paid shared assets, not just the current page
    const start = skip ?? 0;
    const end = take != null ? start + take : undefined;
    const paginatedSharedAssetIds = allSharedAssetIds.slice(start, end);

    const sharedAssets = await this.prisma.sharedAsset.findMany({
      where: {
        id: { in: paginatedSharedAssetIds },
        ...(search && {
          asset: { assetTitle: { contains: search, mode: 'insensitive' } },
        }),
      },
      include: {
        asset: { select: { assetTitle: true } },
        sharedBy: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
          },
        },
      },
    });

    // `id: { in: [...] }` doesn't preserve array order, so re-order to match
    // paginatedSharedAssetIds
    const sharedAssetMap = new Map(sharedAssets.map((sa) => [sa.id, sa]));
    const orderedSharedAssets = paginatedSharedAssetIds
      .map((id) => sharedAssetMap.get(id))
      .filter((sa): sa is (typeof sharedAssets)[number] => !!sa);

    const data = await Promise.all(
      orderedSharedAssets.map(async (sharedAsset) => {
        // inner pagination: members within this specific shared asset
        const [totalMembers, members, secondaryClub] = await Promise.all([
          this.prisma.assetInterest.count({
            where: {
              sharedAssetId: sharedAsset.id,
              paymentStatus: InterestPaymentStatus.Paid,
            },
          }),
          this.prisma.assetInterest.findMany({
            where: {
              sharedAssetId: sharedAsset.id,
              paymentStatus: InterestPaymentStatus.Paid,
            },
            include: {
              account: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  mobile: true,
                },
              },
            },
            orderBy: { paidAt: Prisma.SortOrder.desc },
            skip: memberSkip,
            take: memberTake,
          }),
          this.prisma.secondaryClubs.findFirst({
            where: { assetId: sharedAsset.assetId },
          }),
        ]);

        return {
          assetId: sharedAsset.assetId,
          assetDetails: {
            asset: sharedAsset.asset,
            createdAt: sharedAsset.createdAt,
            sharedBy: sharedAsset.sharedBy,
            status: !!secondaryClub,
            secondaryClubName: secondaryClub?.title ?? null,
            startDate: secondaryClub?.startDate,
            endDate: secondaryClub?.endDate,
          },
          totalMembers,
          members,
          memberPagination: this.buildPaginationMeta(
            memberSkip ?? 0,
            memberTake ?? 10,
            totalMembers,
          ),
        };
      }),
    );

    return {
      count: allSharedAssetIds.length,
      data,
      pagination: this.buildPaginationMeta(
        start,
        take ?? allSharedAssetIds.length,
        allSharedAssetIds.length,
      ),
    };
  }

  async getPaidInterestMembers(
    assetId: number,
    options?: { memberSkip?: number; memberTake?: number },
  ) {
    const memberSkip = options?.memberSkip ?? 0;
    const memberTake = options?.memberTake ?? 10;

    const sharedAsset = await this.prisma.sharedAsset.findUnique({
      where: { assetId: assetId },
      include: {
        asset: { select: { assetTitle: true } },
        sharedBy: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
          },
        },
      },
    });

    if (!sharedAsset) throw new Error('Shared asset not found');

    const memberWhere: Prisma.AssetInterestWhereInput = {
      sharedAssetId: sharedAsset.id,
      paymentStatus: InterestPaymentStatus.Paid,
    };

    const [totalMembers, members] = await Promise.all([
      this.prisma.assetInterest.count({ where: memberWhere }),
      this.prisma.assetInterest.findMany({
        where: memberWhere,
        include: {
          account: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              mobile: true,
            },
          },
        },
        orderBy: { paidAt: Prisma.SortOrder.desc },
        skip: memberSkip,
        take: memberTake,
      }),
    ]);

    return {
      totalMembers,
      skip: memberSkip,
      take: memberTake,
      assetId: sharedAsset.assetId,
      assetDetails: {
        asset: sharedAsset.asset.assetTitle,
        sharedBy: sharedAsset.sharedBy,
      },
      members,
      // memberPagination: this.buildPaginationMeta(
      //   memberSkip,
      //   memberTake,
      //   totalMembers,
      // ),
    };
  }

  async createGroupFromPaidMembers(
    assetId: number,
    data: {
      title: string;
      description?: string;
      startDate: string;
      endDate: string;
    },
  ) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const sharedAsset = await this.prisma.sharedAsset.findUnique({
      where: { assetId },
      include: { asset: { select: { assetTitle: true, accountId: true } } },
    });

    if (!sharedAsset) throw new NotFoundException('Shared asset not found');

    const paidInterests = await this.prisma.assetInterest.findMany({
      where: {
        sharedAssetId: sharedAsset.id,
        paymentStatus: InterestPaymentStatus.Paid,
      },
      select: { accountId: true },
    });

    if (paidInterests.length === 0) {
      throw new BadRequestException('No paid members found for this asset');
    }

    // Notification audience is broader than club membership — every
    // investor who paid or merely registered interest gets notified, not
    // just the paid subset that actually joins the club.
    const interestedAccounts = await this.prisma.assetInterest.findMany({
      where: { sharedAssetId: sharedAsset.id },
      select: { accountId: true },
      distinct: ['accountId'],
    });
    const existingGroup = await this.prisma.secondaryClubs.findFirst({
      where: {
        title: data.title,
      },
    });
    if (existingGroup) {
      throw new BadRequestException(
        `Group ${existingGroup.title} already exists`,
      );
    }
    const existingClubForAsset = await this.prisma.secondaryClubs.findFirst({
      where: { assetId },
    });
    if (existingClubForAsset) {
      throw new BadRequestException('This asset already has a secondary club');
    }
    return await this.prisma.$transaction(async (tx) => {
      const group = await tx.secondaryClubs.create({
        data: {
          title: data.title,
          description: data.description,
          startDate,
          endDate,
          assetId,
          status: 'created-group',
        },
      });
      await tx.assetInterest.updateMany({
        where: {
          sharedAssetId: sharedAsset.id,
          paymentStatus: InterestPaymentStatus.Paid,
        },
        data: {
          secondaryClubId: group.id,
        },
      });

      await this.notificationService._sendNotification({
        code: NotificationCode.INFORM_TO_ASSET_OWNER,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: [
          sharedAsset.asset.accountId!,
          ...new Set(interestedAccounts.map((i) => i.accountId)),
        ],
        data: {
          groupId: group.id,
          assetId: assetId,
          assetTitle: sharedAsset.asset.assetTitle,
        },
      });
      return {
        group,
        totalMembers: paidInterests.length,
      };
    });
  }

  async getPendingSecondaryClubAssets(
    accountId: number,
    options?: { skip?: number; take?: number },
  ) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.AssetInterestWhereInput = {
      accountId,
      paymentStatus: InterestPaymentStatus.Paid,
      secondaryClubId: null,
    };

    const [totalItems, interests] = await Promise.all([
      this.prisma.assetInterest.count({ where }),
      this.prisma.assetInterest.findMany({
        where,
        include: {
          sharedAsset: {
            include: {
              asset: { select: { id: true, assetTitle: true } },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    const data = interests.map((interest) => ({
      assetId: interest.sharedAsset.assetId,
      assetTitle: interest.sharedAsset.asset.assetTitle,
      paymentStatus: 'Completed',
      verificationStatus: 'Verified',
      status: 'Waiting for Secondary Club Creation',
      paymentVerifiedAt: interest.reviewedAt ?? interest.paidAt,
    }));

    return {
      count: totalItems,
      skip: pagination.skip,
      take: pagination.take,
      data,
    };
  }

  async getMySecondaryClubs(
    accountId: number,
    options?: { skip?: number; take?: number },
  ) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const interests = await this.prisma.assetInterest.findMany({
      where: {
        accountId,
        secondaryClubId: { not: null },
      },
      select: { secondaryClubId: true },
      distinct: ['secondaryClubId'],
      orderBy: { updatedAt: 'desc' },
    });

    const allClubIds = interests
      .map((i) => i.secondaryClubId)
      .filter((id): id is number => id !== null);

    if (allClubIds.length === 0) {
      return {
        count: 0,
        skip: pagination.skip,
        take: pagination.take,
        data: [],
      };
    }

    const clubIds = allClubIds.slice(
      pagination.skip,
      pagination.skip + pagination.take,
    );

    const clubs = await this.prisma.secondaryClubs.findMany({
      where: { id: { in: clubIds } },
      include: {
        asset: {
          select: { assetTitle: true, totalFractions: true, status: true },
        },
      },
    });

    // `id: { in: [...] }` doesn't preserve array order, so re-order to match
    // clubIds, which reflects the recency of the user's own interest/activity
    const clubMap = new Map(clubs.map((c) => [c.id, c]));
    const orderedClubs = clubIds
      .map((id) => clubMap.get(id))
      .filter((c): c is (typeof clubs)[number] => !!c);

    const data = await Promise.all(
      orderedClubs.map(async (club) => {
        const [membersCount, votesCount, myVote] = await Promise.all([
          this.prisma.assetInterest.count({
            where: { secondaryClubId: club.id },
          }),
          this.prisma.vote.count({ where: { secondaryClubId: club.id } }),
          this.prisma.vote.findUnique({
            where: {
              secondaryClubId_accountId: {
                secondaryClubId: club.id,
                accountId,
              },
            },
          }),
        ]);

        return {
          id: club.id,
          title: club.title,
          description: club.description,
          assetId: club.assetId,
          assetTitle: club.asset?.assetTitle ?? null,
          status: club.asset?.status,
          isFractionalized: (club.asset?.totalFractions ?? 0) > 0,
          startDate: club.startDate,
          endDate: club.endDate,
          membersCount,
          votesCount,
          hasVoted: !!myVote,
          choice: myVote?.choice,
        };
      }),
    );

    return {
      count: allClubIds.length,
      skip: pagination.skip,
      take: pagination.take,
      data,
    };
  }

  async getGroupsbyAsset(assetId: number) {
    try {
      return await this.prisma.sharedAsset.findFirstOrThrow({
        where: { assetId },
        select: {
          id: true,
          assetId: true,
          groupShares: {
            select: { groupId: true },
          },
        },
      });
    } catch (error) {
      throw new Error('Shared asset not found', error);
    }
  }

  async getInterestPeople(
    groupId: number,
    assetId: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: AssetInterest[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.AssetInterestWhereInput = {
      // paymentStatus: InterestPaymentStatus.Paid,
      sharedAsset: {
        assetId: assetId,
      },

      ...(search && {
        AND: search
          .split(' ')
          .filter((part) => part.trim())
          .map((part) => ({
            account: {
              OR: [
                { firstname: { contains: part.trim(), mode: 'insensitive' } },
                { lastname: { contains: part.trim(), mode: 'insensitive' } },
                { email: { contains: part.trim(), mode: 'insensitive' } },
                { mobile: { contains: part.trim(), mode: 'insensitive' } },
              ],
            },
          })),
      }),
    };

    const [totalInterest, interests] = await Promise.all([
      this.prisma.assetInterest.count({ where }),
      this.prisma.assetInterest.findMany({
        where,
        include: {
          account: {
            select: {
              firstname: true,
              lastname: true,
              email: true,
              mobile: true,
              type: true,
            },
          },
          sharedAsset: {
            select: {
              assetId: true,
              tokenAmount: true,
              asset: {
                select: {
                  assetTitle: true,
                },
              },
            },
          },
        },
        orderBy: { id: Prisma.SortOrder.desc },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);
    return {
      count: totalInterest,
      skip: pagination.skip,
      take: pagination.take,
      data: interests,
    };
  }

  async getInvoiceData(
    assetId: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: InvoiceDetails[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.InvoiceDetailsWhereInput = {
      assetId,
    };
    if (search) {
      const buildSearchFilter = (
        search: string,
      ): Prisma.InvoiceDetailsWhereInput[] => [
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
      const parts = search.split(' ');
      if (parts.length !== 0) {
        where.AND = [];
        for (const part of parts) {
          if (part.trim()) {
            where.AND.push({
              OR: buildSearchFilter(part.trim()),
            });
          }
        }
      }
    }

    const [totalInterest, interests] = await Promise.all([
      this.prisma.invoiceDetails.count({ where }),
      this.prisma.invoiceDetails.findMany({
        where,
        // include: {
        //   account: {
        //     select: {
        //       firstname: true,
        //       lastname: true,
        //       email: true,
        //       mobile: true,
        //       type: true,
        //     },
        //   },
        //   sharedAsset: {
        //     select: {
        //       assetId: true,
        //       tokenAmount: true,
        //       asset: {
        //         select: {
        //           assetTitle: true,
        //         },
        //       },
        //     },
        //   },
        // },
        orderBy: { id: Prisma.SortOrder.desc },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);
    return {
      count: totalInterest,
      skip: pagination.skip,
      take: pagination.take,
      data: interests,
    };
  }
}
