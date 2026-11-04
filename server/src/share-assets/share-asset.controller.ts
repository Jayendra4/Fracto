import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AuthorizationService,
  BaseController,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  RolesGuard,
  Roles,
  AccessGuard,
  Role,
  AuthenticatedRequest,
} from '@Common';
import { ShareAssetService } from './share-assets.services';
import {
  CreateReviewAssetRequestDto,
  ShareAssetInGroupRequestDto,
  CreateInterestRequestDto,
  GetShareAssetRequestDto,
  VerifyPaymentRequestDto,
  SubmitManualInterestPaymentDto,
  ReviewManualInterestPaymentDto,
  GetManualInterestPaymentListRequestDto,
  CreateGroupFromPaidMembersDto,
} from './dto';
import { InterestPaymentStatus } from '../generated/prisma/enums';

@ApiTags('Share-asset')
@Controller('share-asset')
export class ShareAssetController extends BaseController {
  constructor(
    private readonly shareAssetService: ShareAssetService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('my-secondary-clubs')
  async getMySecondaryClubs(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetShareAssetRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.shareAssetService.getMySecondaryClubs(ctx.user.id, {
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('pending-secondary-club')
  async getPendingSecondaryClubAssets(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetShareAssetRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.shareAssetService.getPendingSecondaryClubAssets(
      ctx.user.id,
      { skip: query.skip, take: query.take },
    );
  }

  @Get(':groupId')
  async getAll(@Param('groupId', ParseIntPipe) groupId: number) {
    return await this.shareAssetService.getGroupAssets(groupId);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post()
  async reviewAsset(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateReviewAssetRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.shareAssetService.reviewAsset({
      adminId: ctx.user.id,
      title: data.title,
      description: data.description,
      sharedAssetId: data.sharedAssetId,
      status: data.status,
      rejectNote: data.rejectNote,
      tokenAmount: data.tokenAmount,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post('in-group')
  async shareToGroups(@Body() data: ShareAssetInGroupRequestDto) {
    return await this.shareAssetService.shareToGroups({
      sharedAssetId: data.sharedAssetId,
      groupIds: data.groupIds,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Post('apply-interest/:groupId')
  async createInterest(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateInterestRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.shareAssetService.interestCount(groupId, {
      sharedAssetId: data.sharedAssetId,
      accountId: ctx.user.id,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Post('interest/:groupId')
  async interestInAsset(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateInterestRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.shareAssetService.interest(groupId, {
      sharedAssetId: data.sharedAssetId,
      accountId: ctx.user.id,
      methodType: data.status,
      requestType: data.requestType,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Post('verify-payment')
  async verifyPayment(
    @Req() req: AuthenticatedRequest,
    @Body() data: VerifyPaymentRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.shareAssetService.verifyInterestPayment({
      accountId: ctx.user.id,
      interestId: data.interest_id,
      razorpayPaymentId: data.razorpay_order_id,
      razorpaySignature: data.razorpay_signature,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @RequirePermissions('secondary_group.manual_payment_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('interest/manual-payment/list')
  async getManualPaymentList(
    @Query() query: GetManualInterestPaymentListRequestDto,
  ) {
    return await this.shareAssetService.getManualPaymentList({
      search: query.search,
      skip: query.skip,
      take: query.take,
      paymentStatus: query.paymentStatus,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('interest/all-paid-assets')
  async getAllPaidAssets(@Query() query: GetShareAssetRequestDto) {
    return await this.shareAssetService.getPaidAssets({
      search: query.search,
      skip: query.skip,
      take: query.take,
      memberSkip: query.memberSkip,
      memberTake: query.memberTake,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Post('interest/:assetId/manual-payment')
  async submitManualPayment(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
    @Body() data: SubmitManualInterestPaymentDto,
  ) {
    const ctx = this.getContext(req);
    return await this.shareAssetService.submitManualPayment(
      ctx.user.id,
      assetId,
      {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        amount: data.amount,
        utrNumber: data.utrNumber,
        screenshot: data.screenshot,
        consent: data.consent,
      },
    );
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Post('interest/:interestId/manual-payment/review')
  async reviewManualPayment(
    @Param('interestId', ParseIntPipe) interestId: number,
    @Req() req: AuthenticatedRequest,
    @Body() data: ReviewManualInterestPaymentDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.status === InterestPaymentStatus.Failed
        ? 'secondary_group.manual_payment_reject'
        : 'secondary_group.manual_payment_approve',
    );
    return await this.shareAssetService.reviewManualPayment(
      ctx.user.id,
      interestId,
      {
        status: data.status,
        rejectionReason: data.rejectionReason,
      },
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get(':accountId/user-own-asset/:groupId')
  async userAssetListInGroup(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() query: GetShareAssetRequestDto,
  ) {
    return await this.shareAssetService.getUserOwnAsset(accountId, groupId, {
      search: query.search,
      skip: query.skip,
      take: query.take,
      assetStatus: query.AssetStatus,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get(':groupId/interest-list/:assetId')
  async assetInterestList(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() query: GetShareAssetRequestDto,
  ) {
    return await this.shareAssetService.getInterestPeople(groupId, assetId, {
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('invoice-list/:assetId')
  async assetInvoiceList(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() query: GetShareAssetRequestDto,
  ) {
    return await this.shareAssetService.getInvoiceData(assetId, {
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('group-list/:assetId')
  async getGroupsbyAsset(@Param('assetId', ParseIntPipe) assetId: number) {
    return await this.shareAssetService.getGroupsbyAsset(assetId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('interest/:assetId/paid-members')
  async getPaidInterestMembers(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() query: GetShareAssetRequestDto,
  ) {
    return await this.shareAssetService.getPaidInterestMembers(assetId, {
      memberSkip: query.memberSkip,
      memberTake: query.memberTake,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @RequirePermissions('secondary_group.club_create')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Post('interest/:assetId/create-group')
  async createGroupFromPaidMembers(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Body() data: CreateGroupFromPaidMembersDto,
  ) {
    return await this.shareAssetService.createGroupFromPaidMembers(assetId, {
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  }
}
