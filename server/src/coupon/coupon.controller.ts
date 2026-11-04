import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AccessGuard,
  AuthenticatedRequest,
  JwtAuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '@Common';
import {
  ApplyCouponDto,
  CreateCouponDto,
  GetAllCoupenRequestDto,
  UpdateCouponDto,
} from './dto';

@ApiBearerAuth()
@ApiTags('Coupens')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post()
  async createCoupon(
    @Body() data: CreateCouponDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.couponService.create(
      {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        bonusFractions: data.bonusFractions,
        maxDiscountAmount: data.maxDiscountAmount,
        minPurchaseAmount: data.minPurchaseAmount,
        totalUsageLimit: data.totalUsageLimit,
        perUserLimit: data.perUserLimit ?? 1,
        validFrom: data.validFrom,
        validTill: data.validTill,
      },
      req.user.id,
    );
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get()
  async getUsers(@Query() query: GetAllCoupenRequestDto) {
    return await this.couponService.getAll({
      discountType: query.discountType,
      couponStatus: query.couponStatus,
      search: query.search,
      skip: query.skip,
      take: query.take,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });
  }

  @Get(':id')
  async getCoupenById(@Param('id', ParseIntPipe) id: number) {
    return await this.couponService.getCoupenById(id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Patch(':id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCouponDto,
  ) {
    return this.couponService.updateStatus(id, {
      isActive: data.isActive,
      isDeleted: data.isDeleted,
    });
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Post('apply')
  async applyCoupon(
    @Body() data: ApplyCouponDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req?.user?.id;
    return this.couponService.applyCoupon(data.code, data?.amount, userId);
  }
}
