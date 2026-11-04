import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { TrusteeService } from './trustee.service';
import { TrusteeDashboardService } from './trustee-dashboard.service';
import { TrusteeSecondarySettlementService } from './trustee-secondary-settlement.service';
import { TrusteeMarketplaceMatchService } from './trustee-marketplace-match.service';
import { CreateTrusteeDto } from './dto/create-trustee.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  AccessGuard,
  Roles,
  RolesGuard,
  Role,
  AuthenticatedRequest,
} from '@Common';
import {
  GetMarketplaceMatchesDto,
  GetVerifierTrackerRequestDto,
  RejectMarketplaceMatchDto,
  ReviewRwaDto,
} from './dto';

@ApiTags('Trustee')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('trustee')
export class TrusteeController {
  constructor(
    private readonly trusteeService: TrusteeService,
    private readonly dashboardService: TrusteeDashboardService,
    private readonly secondarySettlementService: TrusteeSecondarySettlementService,
    private readonly marketplaceMatchService: TrusteeMarketplaceMatchService,
  ) {}

  @Roles(Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('dashboard')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getDashboard(req.user.id);
  }

  @Roles(Role.Admin, Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('verifier-tracker')
  async getVerifierTracker(@Query() query: GetVerifierTrackerRequestDto) {
    return await this.trusteeService.getVerifierTracker({
      search: query.search,
      rwaStatus: query.rwaStatus,
      skip: query.skip,
      take: query.take,
    });
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Post()
  async createTrustee(@Body() dto: CreateTrusteeDto) {
    return this.trusteeService.createTrustee(dto);
  }

  @Roles(Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Patch(':assetId/review')
  async reviewAsset(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
    @Body() data: ReviewRwaDto,
  ) {
    return await this.trusteeService.assetReview(assetId, req.user.id, {
      status: data.status,
      rejectionReason: data.rejectionReason,
      trusteeComment: data.trusteeComment,
    });
  }

  @Roles(Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('secondary-settlements')
  async getSecondarySettlements(@Query() query: GetVerifierTrackerRequestDto) {
    return await this.secondarySettlementService.listSettlements({
      search: query.search,
      status: query.status,
      skip: query.skip,
      take: query.take,
    });
  }

  @Roles(Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Patch('secondary-settlements/:tradeId/approve')
  async approveSecondarySettlement(
    @Param('tradeId', ParseIntPipe) tradeId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.secondarySettlementService.approveSettlement(
      tradeId,
      req.user.id,
    );
  }

  @Roles(Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('marketplace-matches')
  async getMarketplaceMatches(@Query() query: GetMarketplaceMatchesDto) {
    return await this.marketplaceMatchService.listPotentialMatches({
      status: query.status,
      skip: query.skip,
      take: query.take,
    });
  }

  @Roles(Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Patch('marketplace-matches/:matchId/approve')
  async approveMarketplaceMatch(
    @Param('matchId', ParseIntPipe) matchId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.marketplaceMatchService.approveMatch(
      matchId,
      req.user.id,
    );
  }

  @Roles(Role.Trustee)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Patch('marketplace-matches/:matchId/reject')
  async rejectMarketplaceMatch(
    @Param('matchId', ParseIntPipe) matchId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RejectMarketplaceMatchDto,
  ) {
    return await this.marketplaceMatchService.rejectMatch(
      matchId,
      req.user.id,
      dto.rejectionReason,
    );
  }
}
