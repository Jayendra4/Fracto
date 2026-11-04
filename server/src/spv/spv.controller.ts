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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AuthorizationService,
  BaseController,
  JwtAuthGuard,
  AccessGuard,
  PermissionsGuard,
  RequirePermissions,
  RolesGuard,
  Roles,
  Role,
  AuthenticatedRequest,
  SearchablePaginatedDto,
} from '@Common';
import { SpvService } from './spv.service';
import {
  CreateSpvRequestDto,
  GetSpvsRequestDto,
  UpdateSpvStatusDto,
} from './dto';
import { SpvStatus } from '../generated/prisma/enums';

@ApiTags('Spv')
@Controller('spv')
export class SpvController extends BaseController {
  constructor(
    private readonly spvService: SpvService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
  }

  @Get('eligible-users/:secondaryClubId')
  async getEligibleUsers(
    @Param('secondaryClubId', ParseIntPipe) secondaryClubId: number,
    @Query() query: SearchablePaginatedDto,
  ) {
    return await this.spvService.getEligibleUsers(secondaryClubId, {
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @RequirePermissions('spv.create')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Post()
  async create(
    @Body() data: CreateSpvRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return await this.spvService.create(ctx.user.id, {
      name: data.name,
      secondaryClubId: data.secondaryClubId,
      accountIds: data.accountIds,
    });
  }

  @ApiBearerAuth()
  @RequirePermissions('spv.view')
  @UseGuards(JwtAuthGuard, AccessGuard, PermissionsGuard)
  @Get()
  async getAll(@Query() query: GetSpvsRequestDto) {
    return await this.spvService.getAll({
      search: query.search,
      accountId: query.accountId,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('assets-with-members')
  async getAllAssetsWithSpvMembers(@Query() query: SearchablePaginatedDto) {
    return await this.spvService.getAllAssetsWithSpvMembers({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('my')
  async getMySpvs(
    @Req() req: AuthenticatedRequest,
    @Query() query: SearchablePaginatedDto,
  ) {
    const ctx = this.getContext(req);
    return await this.spvService.getAll({
      accountId: ctx.user.id,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('my-assets-summary')
  async getMyAssetsSpvSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: SearchablePaginatedDto,
  ) {
    const ctx = this.getContext(req);
    return await this.spvService.getMyAssetsWithSpv(ctx.user.id, {
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  // NOTE: literal-segment routes below must stay registered before the
  // `:id` route further down, otherwise Express would match e.g.
  // `/spv/shareholder-register` as `:id` = "shareholder-register" and fail
  // the ParseIntPipe validation on `getById`.
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('spv.governance_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('shareholder-register')
  async getShareholderRegister(@Query() query: SearchablePaginatedDto) {
    return await this.spvService.getShareholderRegister({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('spv.governance_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('voting-status')
  async getVotingStatus(@Query() query: SearchablePaginatedDto) {
    return await this.spvService.getVotingStatus({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('spv.governance_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('exit-liquidation-tracker')
  async getExitLiquidationTracker(@Query() query: SearchablePaginatedDto) {
    return await this.spvService.listExitTracker({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('spv.governance_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('assets/documents')
  async getSpvAssetDocuments(@Query() query: SearchablePaginatedDto) {
    return await this.spvService.getSpvAssetDocuments({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.spvService.getById(id);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('spv.members_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get(':id/members')
  async getSpvMembers(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: SearchablePaginatedDto,
  ) {
    return await this.spvService.getSpvMembers(id, {
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Patch(':id/status')
  async setStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateSpvStatusDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.status === SpvStatus.Disabled ? 'spv.disable' : 'spv.enable',
    );
    return await this.spvService.setStatus(id, data.status);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post(':id/voting/reminder')
  async sendVotingReminder(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    const data = await this.spvService.sendVotingReminder(id, ctx.user.id);

    return {
      message:
        data.nonVoters === 0
          ? 'All eligible SPV members have already voted'
          : 'Voting reminders sent successfully',
      data,
    };
  }

  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('spv.governance_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get(':spvId/assets/:assetId/documents')
  async getSpvAssetDocumentsPage(
    @Param('spvId', ParseIntPipe) spvId: number,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() query: SearchablePaginatedDto,
  ) {
    return await this.spvService.getSpvAssetDocumentsPage(spvId, assetId, {
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('asset/:assetId/members')
  async getAssetSpvMembers(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return await this.spvService.getAssetSpvMembers(ctx.user.id, assetId);
  }
}
