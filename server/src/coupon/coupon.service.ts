import { BaseService, UtilsService } from '@Common';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { Coupon, Prisma } from '../generated/prisma/client';
import { CouponStatus, DiscountType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma';

@Injectable()
export class CouponService
  extends BaseService
  implements OnApplicationBootstrap
{
  private readonly INTERVAL_MS = 60_000;
  private isRunning = false;
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
  ) {
    super();
  }

  async onApplicationBootstrap() {
    this.utilsService.sleep(10000).then(() => {
      this.logger.info('Coupens Expired processor started');
      this.startProcessorLoop();
    });
  }

  private async startProcessorLoop() {
    while (true) {
      try {
        if (!this.isRunning) {
          this.isRunning = true;
          await this.handleCouponLifecycleProcessor();
        }
      } catch (err) {
        this.logger.error('handle expired coupens loop failed', err);
      } finally {
        this.isRunning = false;
        await this.utilsService.sleep(this.INTERVAL_MS);
      }
    }
  }

  async create(
    data: {
      code: string;
      description?: string;
      discountType: DiscountType;
      discountValue: number;
      bonusFractions?: number;
      maxDiscountAmount: number;
      minPurchaseAmount: number;
      totalUsageLimit: number;
      perUserLimit: number;
      validFrom: string;
      validTill: string;
    },
    adminId: number,
  ) {
    const now = new Date();
    const validFrom = new Date(data.validFrom);
    const validTill = new Date(data.validTill);

    if (
      Number.isNaN(validFrom.getTime()) ||
      Number.isNaN(validTill.getTime())
    ) {
      throw new Error('Invalid date format');
    }

    if (validFrom >= validTill) {
      throw new Error('validFrom must be before validTill');
    }

    const code = data.code?.trim().toUpperCase();

    if (!code) {
      throw new Error('Coupon code is required');
    }

    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }

    if (
      data.discountType === DiscountType.FractionBonus &&
      !data.bonusFractions
    ) {
      throw new Error('bonusFractions required');
    }

    if (
      data.discountType !== DiscountType.FractionBonus &&
      !data.discountValue
    ) {
      throw new Error('discountValue required');
    }

    let computedStatus: CouponStatus;
    let isActive: boolean = false;
    if (now < validFrom) {
      computedStatus = CouponStatus.Scheduled;
    } else if (now > validTill) {
      computedStatus = CouponStatus.Expired;
    } else {
      computedStatus = CouponStatus.Active;
      isActive = true;
    }

    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        bonusFractions: data.bonusFractions,
        maxDiscountAmount: data.maxDiscountAmount,
        couponStatus: computedStatus,
        minPurchaseAmount: data.minPurchaseAmount,
        totalUsageLimit: data.totalUsageLimit,
        perUserLimit: data.perUserLimit ?? 1,
        isActive: isActive ?? false,
        validFrom,
        validTill,
        createdByAdminId: adminId,
      },
    });
  }

  async getAll(options?: {
    discountType?: DiscountType;
    search?: string;
    skip?: number;
    couponStatus?: CouponStatus;
    take?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Coupon[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.CouponWhereInput = {
      isDeleted: false,
    };
    if (options?.couponStatus) {
      where.couponStatus = options.couponStatus;
    }
    const andConditions: Prisma.CouponWhereInput[] = [];
    if (options?.fromDate || options?.toDate) {
      const from = options?.fromDate ? new Date(options.fromDate) : undefined;
      const to = options?.toDate ? new Date(options.toDate) : undefined;

      if (from) {
        andConditions.push({
          validTill: { gte: from },
        });
      }

      if (to) {
        andConditions.push({
          validFrom: { lte: to },
        });
      }
    }
    if (options?.discountType) {
      where.discountType = options?.discountType;
    }
    if (search) {
      const buildSearchFilter = (search: string): Prisma.CouponWhereInput[] => [
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
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

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }
    const totalcoupons = await this.prisma.coupon.count({
      where,
    });
    const coupons = await this.prisma.coupon.findMany({
      where,
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });

    const data = coupons.map((coupon) => ({
      ...coupon,
      usesCount: coupon._count.redemptions,
    }));

    return {
      count: totalcoupons,
      skip: pagination.skip,
      take: pagination.take,
      data: data,
    };
  }

  async getCoupenById(id: number) {
    return await this.prisma.coupon.findUnique({ where: { id } });
  }

  async updateStatus(
    id: number,
    data: {
      isActive?: boolean;
      isDeleted?: boolean;
    },
  ) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    const now = new Date();
    const isWithinValidRange =
      now >= coupon.validFrom && now <= coupon.validTill;

    const updateData: Prisma.CouponUpdateInput = {};
    if (typeof data.isActive === 'boolean') {
      if (data.isActive) {
        if (!isWithinValidRange) {
          throw new Error(
            'Cannot activate coupon. It is either Scheduled or Expired.',
          );
        }
        updateData.isActive = true;
        updateData.couponStatus = 'Active';
      } else {
        updateData.isActive = false;
        updateData.couponStatus = 'InActive';
      }
    }

    if (typeof data.isDeleted === 'boolean') {
      updateData.isDeleted = data.isDeleted;
      if (data.isDeleted) {
        updateData.isActive = false;
        updateData.couponStatus = 'InActive';
      }
    }
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields provided for update');
    }

    return this.prisma.coupon.update({
      where: { id },
      data: updateData,
    });
  }

  async validateAndApplyCoupon(
    tx: Prisma.TransactionClient,
    params: {
      couponCode: string;
      userId: number;
      orderId: number;
      purchaseAmount: Decimal;
      fractions: number;
    },
  ): Promise<{
    discountAmount: Decimal;
    bonusFractions: number;
    couponId: number;
  }> {
    const coupon = await tx.coupon.findFirst({
      where: {
        code: params.couponCode.toUpperCase(),
        isActive: true,
        isDeleted: false,
        validFrom: { lte: new Date() },
        validTill: { gte: new Date() },
      },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    if (!coupon) {
      throw new Error('Invalid or inactive coupon');
    }

    // Global usage limit
    if (
      coupon.totalUsageLimit !== null &&
      coupon._count.redemptions >= coupon.totalUsageLimit
    ) {
      tx.coupon.update({
        where: { id: coupon.id },
        data: {
          couponStatus: CouponStatus.Exceed,
        },
      });
      throw new Error('Coupon usage limit exceeded');
    }

    // Per-user usage limit
    const userRedemptions = await tx.couponRedemption.count({
      where: {
        couponId: coupon.id,
        userId: params.userId,
      },
    });

    if (userRedemptions >= coupon.perUserLimit) {
      throw new Error('Coupon already used by this user');
    }

    // Min purchase amount
    if (
      coupon.minPurchaseAmount &&
      params.purchaseAmount.lt(coupon.minPurchaseAmount)
    ) {
      throw new Error('Purchase amount too low for this coupon');
    }

    let discountAmount = new Decimal(0);
    let bonusFractions = 0;

    switch (coupon.discountType) {
      case DiscountType.Percentage:
        discountAmount = params.purchaseAmount
          .mul(coupon.discountValue!)
          .div(100);
        break;

      case DiscountType.Fixed:
        discountAmount = coupon.discountValue!;
        break;

      case DiscountType.FractionBonus:
        bonusFractions = coupon.bonusFractions!;
        break;
    }

    if (
      coupon.maxDiscountAmount &&
      discountAmount.gt(coupon.maxDiscountAmount)
    ) {
      discountAmount = coupon.maxDiscountAmount;
    }

    // Save redemption
    await tx.couponRedemption.create({
      data: {
        couponId: coupon.id,
        userId: params.userId,
        orderId: params.orderId,
        discountApplied: discountAmount,
      },
    });

    return {
      couponId: coupon.id,
      discountAmount,
      bonusFractions,
    };
  }

  async handleCouponLifecycleProcessor() {
    const now = new Date();

    const activated = await this.prisma.coupon.updateMany({
      where: {
        isDeleted: false,
        couponStatus: CouponStatus.Scheduled,
        validFrom: { lte: now }, // validFrom should be less than of current time
        validTill: { gte: now }, // validTill should be greater than of current time
      },
      data: {
        couponStatus: CouponStatus.Active,
        isActive: true,
      },
    });

    // Expire Active Coupons
    const expired = await this.prisma.coupon.updateMany({
      where: {
        isDeleted: false,
        couponStatus: CouponStatus.Active,
        validTill: { lt: now }, // validTill should be less than of current time
      },
      data: {
        couponStatus: CouponStatus.Expired,
        isActive: false,
      },
    });

    const exceeded = await this.prisma.$executeRawUnsafe(`
    UPDATE coupon c
    SET coupon_status = 'exceed',
        is_active = false
    WHERE c.is_deleted = false
      AND c.coupon_status = 'active'
      AND c.total_usage_limit IS NOT NULL
      AND (
        SELECT COUNT(*)
        FROM coupon_redemption cr
        WHERE cr.coupon_id = c.id
      ) >= c.total_usage_limit
  `);

    if (activated.count > 0) {
      console.log(`Activated ${activated.count} scheduled coupons`);
    }

    if (expired.count > 0) {
      console.log(`Expired ${expired.count} active coupons`);
    }

    if (exceeded > 0) {
      console.log(`Marked ${exceeded} coupons as exceeded`);
    }
  }

  async applyCoupon(code: string, amount?: number, userId?: number) {
    if (!code) throw new Error('Coupon code is required');

    const purchaseAmount = amount ? new Decimal(amount) : null;

    // fetch coupon and user-specific redemptions
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code,
        isActive: true,
        isDeleted: false,
        validFrom: { lte: new Date() },
        validTill: { gte: new Date() },
      },
      include: {
        redemptions: {
          where: { userId }, // only user's redemptions
        },
      },
    });

    if (!coupon) throw new Error('Invalid or expired coupon');

    if (
      purchaseAmount &&
      coupon.minPurchaseAmount &&
      purchaseAmount.lt(coupon.minPurchaseAmount)
    ) {
      throw new Error(
        `Minimum purchase amount ${coupon.minPurchaseAmount} required`,
      );
    }

    // Check per-user limit
    const userRedemptions = coupon.redemptions.length;
    if (userRedemptions >= coupon.perUserLimit) {
      throw new Error('Coupon usage limit reached for this user');
    }

    // Check total usage limit
    if (coupon.totalUsageLimit) {
      const totalRedemptions = await this.prisma.couponRedemption.count({
        where: { couponId: coupon.id },
      });
      if (totalRedemptions >= coupon.totalUsageLimit) {
        throw new Error('Coupon usage limit reached');
      }
    }

    // Calculate discount if amount provided
    let discountAmount: Decimal | null = null;
    let finalAmount: Decimal | null = null;

    if (purchaseAmount) {
      if (coupon.discountType === 'Percentage') {
        discountAmount = purchaseAmount.mul(coupon.discountValue ?? 0).div(100);
        if (
          coupon.maxDiscountAmount &&
          discountAmount.gt(coupon.maxDiscountAmount)
        ) {
          discountAmount = new Decimal(coupon.maxDiscountAmount);
        }
      } else if (coupon.discountType === 'Fixed') {
        discountAmount = new Decimal(coupon.discountValue ?? 0);
        if (discountAmount.gt(purchaseAmount)) discountAmount = purchaseAmount;
      }
      if (discountAmount) {
        finalAmount = purchaseAmount.minus(discountAmount);
      }
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      amount,
      maxDiscountValue: Number(coupon.maxDiscountAmount),
      discountAmount: discountAmount?.toNumber() ?? null,
      finalAmount: finalAmount?.toNumber() ?? null,
      coupon,
      message: 'Coupon is valid',
    };
  }
}
