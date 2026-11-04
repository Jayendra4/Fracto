import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AccessGuard,
  AuthenticatedRequest,
  AuthorizationService,
  BaseController,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  Role,
  Roles,
  RolesGuard,
} from '@Common';
import { GetKycListDto, VerifyCompanyKycDto, VerifyKycDto } from './dto';
import { KycStatus } from '../generated/prisma/enums';

/**
 * This is an internal admin review surface (every query here is scoped to
 * `verifier: 'Admin'` regardless of caller) — previously reachable by any
 * authenticated user, or in a few cases with no auth at all. Locked to
 * Admin + granular `kyc.*` permissions as part of closing that gap.
 */
@ApiTags('Kyc')
@ApiBearerAuth()
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
@Controller('kyc')
export class KycController extends BaseController {
  constructor(
    private readonly kycService: KycService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
  }

  @RequirePermissions('kyc.view')
  @ApiOperation({ summary: 'Get All Kyc List' })
  @Get()
  async getKycList(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetKycListDto,
  ) {
    return this.kycService.getKycList(req.user.id, req.user.type, {
      search: query.search,
      skip: query.skip,
      take: query.take,
      status: query.status,
      userType: query.userType,
    });
  }

  @RequirePermissions('kyc.view')
  @ApiOperation({ summary: 'Get All Company Kyc List' })
  @Get('company')
  async getCompanyKycList(@Query() query: GetKycListDto) {
    return this.kycService.getCompanyKycList({
      search: query.search,
      skip: query.skip,
      take: query.take,
      status: query.status,
    });
  }

  @RequirePermissions('kyc.view')
  @ApiOperation({ summary: 'Get Kyc data By KycId' })
  @Get(':kycId')
  async getKycId(@Param('kycId', ParseIntPipe) kycId: number) {
    return this.kycService.getKycByAccountId(kycId);
  }

  @RequirePermissions('kyc.view')
  @ApiOperation({ summary: 'Get Company Kyc data By KycId' })
  @Get('company/:kycId')
  async getCompanyKycId(@Param('kycId', ParseIntPipe) kycId: number) {
    return this.kycService.getCompanyKycByKycId(kycId);
  }

  @ApiOperation({ summary: 'Verify Kyc By KycId' })
  @Patch(':kycId/verify')
  async verifyKyc(
    @Req() req: AuthenticatedRequest,
    @Param('kycId', ParseIntPipe) kycId: number,
    @Body() data: VerifyKycDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.action === KycStatus.Rejected ? 'kyc.reject' : 'kyc.approve',
    );
    return await this.kycService.verifyKyc(kycId, ctx.user, data);
  }

  @ApiOperation({ summary: 'Verify Company Kyc By KycId' })
  @Patch('company/:kycId/verify')
  async verifyCompanyKyc(
    @Req() req: AuthenticatedRequest,
    @Param('kycId', ParseIntPipe) kycId: number,
    @Body() data: VerifyCompanyKycDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.status === KycStatus.Rejected ? 'kyc.reject' : 'kyc.approve',
    );
    return await this.kycService.verifyCompanyKyc(kycId, ctx.user.id, data);
  }
}
