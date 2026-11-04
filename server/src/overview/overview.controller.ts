import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  AccessGuard,
  AuthenticatedRequest,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  Role,
  Roles,
  RolesGuard,
  SearchablePaginatedDto,
} from '@Common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OverviewService } from './overview.service';

@Controller('overview')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @ApiBearerAuth()
  @Roles(
    Role.Admin,
    Role.Company,
    Role.AssetOwner,
    Role.Broker,
    Role.CorporateInvestor,
    Role.Trustee,
  )
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get()
  getDashboard(@Req() req: AuthenticatedRequest) {
    return this.overviewService.getOverview(req.user.id);
  }

  @ApiBearerAuth()
  @Roles(
    Role.Admin,
    Role.Company,
    Role.AssetOwner,
    Role.Broker,
    Role.CorporateInvestor,
    Role.Trustee,
  )
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('assets')
  getAllAssets(@Req() req: AuthenticatedRequest) {
    return this.overviewService.getAllAssetsWithUserData(req.user.id);
  }

  @ApiBearerAuth()
  @Roles(
    Role.Admin,
    Role.Company,
    Role.AssetOwner,
    Role.Broker,
    Role.CorporateInvestor,
    Role.Trustee,
  )
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('marketplace')
  getMarketplaceOverview(@Req() req: AuthenticatedRequest) {
    return this.overviewService.getMarketplaceOverview(req.user.id);
  }

  @ApiBearerAuth()
  @Roles(
    Role.Admin,
    Role.Company,
    Role.AssetOwner,
    Role.Broker,
    Role.CorporateInvestor,
    Role.Trustee,
  )
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @ApiQuery({
    name: 'period',
    enum: ['24h', '7d', '30d'],
    required: false,
    description: 'Period for asset appreciation and realized P&L',
  })
  @Get('portfolio')
  getPortfolioOverview(
    @Req() req: AuthenticatedRequest,
    @Query('period') period: '24h' | '7d' | '30d' = '24h',
  ) {
    return this.overviewService.getPortfolioOverview(req.user.id, period);
  }

  @ApiBearerAuth()
  @Roles(Role.AssetOwner, Role.Company)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('business')
  getAssetOwnerOverview(@Req() req: AuthenticatedRequest) {
    return this.overviewService.getAssetOwnerOverview(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('activity-widgets')
  getInvestorActivityWidgets(@Req() req: AuthenticatedRequest) {
    return this.overviewService.getInvestorActivityWidgets(req.user.id);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @RequirePermissions('overview.view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('admin')
  getAdminDashboard(@Query() query: SearchablePaginatedDto) {
    return this.overviewService.getAdminDashboard({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }
}
