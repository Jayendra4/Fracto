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
import { BrokerService } from './broker.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AccessGuard,
  AuthenticatedRequest,
  AuthorizationService,
  BaseController,
  JwtAuthGuard,
  // PermissionsGuard,
  // RequirePermissions,
  Role,
  Roles,
  RolesGuard,
} from '@Common';
import {
  ApproveCommissionContractDto,
  CreateCommissionContractDto,
  CreateCommissionRequestDto,
  GetAllBrokerLeads,
  GetAllCommissionPayoutRequest,
  GetAllCommissionSummaryDto,
  GetAllInviteAsset,
  GetOwnerApprovalAssetsDto,
  InviteAssetOwnerDto,
} from './dto';
import { ReviewStatusDto, reviewStatus } from './dto/update-review-status.dto';
import { AccountType, ReferralApprovalStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';

@ApiTags('Broker')
@ApiBearerAuth()
@Controller('broker')
export class BrokerController extends BaseController {
  constructor(
    private readonly brokerService: BrokerService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
  }

  @Roles(Role.Broker)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post('commission-request')
  async createCommissionContract(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateCommissionContractDto,
  ) {
    if (req.user.type !== AccountType.Broker) {
      throw new Error('Only broker can create commission contract');
    }

    return this.brokerService.createCommissionContract({
      brokerId: req.user.id,
      assetId: data.assetId,
      proposedCommissionPct: data.proposedCommissionPct,
      brokerNote: data.brokerNote,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('commissions/:id/approve')
  async reviewContractByAssetOwner(
    @Req() req: AuthenticatedRequest,
    @Param('id') contractId: number,
    @Body() data: ApproveCommissionContractDto,
  ) {
    return this.brokerService.reviewContractByAssetOwner(
      contractId,
      req.user.id,
      data.status,
      data.assetOwnerNote,
    );
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard) //, PermissionsGuard)
  @Patch('contract/:id/admin-approve')
  async adminReviewCommissionContract(
    @Req() req: AuthenticatedRequest,
    @Param('id') contractId: number,
    @Body() data: ApproveCommissionContractDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.status === ReferralApprovalStatus.Rejected
        ? 'broker.commission_percentage_reject'
        : 'broker.commission_percentage_approve',
    );
    return this.brokerService.adminReviewCommissionContract(
      contractId,
      data.status,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('invite')
  async inviteAssetOwner(
    @Req() req: AuthenticatedRequest,
    @Body() data: InviteAssetOwnerDto,
  ) {
    if (req.user.type !== AccountType.Broker) {
      throw new Error('Only broker can invite asset owner');
    }

    return this.brokerService.inviteAssetOwner(req.user.id, data);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  // @RequirePermissions('broker.lead_view')
  // @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard) //, PermissionsGuard)
  @Get('invite-owners')
  async getAssetOwnerInvitesList(@Query() query: GetAllInviteAsset) {
    return this.brokerService.getAssetOwnerInvitesList({
      search: query.search,
      skip: query.skip,
      take: query.take,
      adminStatus: query.adminStatus,
      brokerId: query.brokerId,
      isAssetOnBording: query.isAssetOnBording,
    });
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('owner-approval-assets')
  async getAssetsforOwnerApproval(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetOwnerApprovalAssetsDto,
  ) {
    const ctx = this.getContext(req);
    return this.brokerService.getAssetsforOwnerApproval(ctx.user.id, {
      ownerStatus: query.ownerStatus,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  // @Roles(Role.Admin)
  // @RequirePermissions('broker.lead_view')
  // @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard) //, PermissionsGuard)
  @Get('leads')
  async leads(@Query() query: GetAllBrokerLeads) {
    return this.brokerService.getBrokerLeadsList({
      search: query.search,
      skip: query.skip,
      take: query.take,
      brokerId: query.brokerId,
      type: query.type,
    });
  }

  @ApiBearerAuth()
  // @Roles(Role.Admin)
  // @RequirePermissions('broker.lead_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard) //, PermissionsGuard)
  @Get('lead/:id')
  async getLeadById(@Param('id', ParseIntPipe) id: number) {
    return await this.brokerService.getBrokerLeadById(id);
  }

  @ApiBearerAuth()
  // @Roles(Role.Admin)
  // @RequirePermissions('broker.commission_view')
  // @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard) //, PermissionsGuard)
  @Get('commissions')
  async getBrokerCommissionHistory(@Query() query: GetAllBrokerLeads) {
    return this.brokerService.getBrokerCommissionHistory({
      search: query.search,
      skip: query.skip,
      take: query.take,
      brokerId: query.brokerId,
      type: query.type,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  // @RequirePermissions('broker.commission_view')
  // @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard) //, PermissionsGuard)
  @Get('commission/:id')
  async getCommissionById(@Param('id') id: string) {
    return await this.brokerService.getBrokerCommissionById({
      commissionId: Number(id),
    });
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard) //, PermissionsGuard)
  @ApiOperation({
    summary: 'Approve or Reject Commission Pct by Admin',
  })
  @Patch(':assetOwnerInviteId/approve-commission')
  async approveCommissionByAdmin(
    @Req() req: AuthenticatedRequest,
    @Param('assetOwnerInviteId', ParseIntPipe) assetOwnerInviteId: number,
    @Body() data: ReviewStatusDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.status === reviewStatus.Rejected
        ? 'broker.commission_percentage_reject'
        : 'broker.commission_percentage_approve',
    );
    await this.brokerService.approveCommissionByAdmin(
      assetOwnerInviteId,
      req.user.id,
      {
        status: data.status,
        remarks: data.remarks,
      },
    );
    return { status: 'success' };
  }

  @Roles(Role.Broker)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('dashboard')
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const brokerId = req.user.id;

    return this.brokerService.getBrokerDashboard(brokerId);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('commission-summary')
  async getCommissionSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetAllCommissionSummaryDto,
  ) {
    const brokerId = req.user.id;

    return this.brokerService.getBrokerCommissionSummary(brokerId, {
      fromDate: query.fromDate,
      toDate: query.toDate,
    });
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('locks-commission')
  async getCommissionLocks(@Req() req: AuthenticatedRequest) {
    const brokerId = req.user.id;

    return this.brokerService.getCommissionLocks(brokerId);
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Post('commission/payout-request')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateCommissionRequestDto,
  ) {
    return await this.brokerService.requestCommissionPayout(
      req.user.id,
      new Prisma.Decimal(data.amount),
    );
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('commission-payout-requests')
  async getUsers(@Query() query: GetAllCommissionPayoutRequest) {
    return await this.brokerService.getCommissionPayoutRequests({
      search: query.search,
      skip: query.skip,
      take: query.take,
      brokerId: query.brokerId,
      status: query.status,
    });
  }

  @ApiOperation({
    summary: 'Approve or Reject Commission Payout Request by Admin',
  })
  @Roles(Role.Admin, Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard) //, RolesGuard) //, PermissionsGuard)
  @Patch(':requestId/payout-review')
  async commissionPayoutRequestByAdmin(
    @Req() req: AuthenticatedRequest,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() data: ReviewStatusDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.status === reviewStatus.Rejected
        ? 'broker.commission_withdrawal_reject'
        : 'broker.commission_withdrawal_approve',
    );
    await this.brokerService.reviewCommissionPayout({
      requestId,
      reviewerId: req.user.id,
      status: data.status,
      remarks: data.remarks,
    });
    return { status: 'success' };
  }
}
