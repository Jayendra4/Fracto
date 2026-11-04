import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
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
import { MarketplaceService } from './marketplace.services';
import {
  CreateMarketplaceRequestDto,
  GetMarketplaceRequestDto,
  CreateBidMarketplaceRequestDto,
  CreateImmediateSellMarketplaceRequestDto,
  CreateDirectBuyRequestDto,
  CreateDirectSellRequestDto,
  GetMarketplaceImmediateRequestDto,
} from './dto';
import { ListingStatus, ListingType } from '../generated/prisma/enums';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController extends BaseController {
  constructor(private readonly marketplaceService: MarketplaceService) {
    super();
  }

  // 3A - Ask to sell
  @ApiBearerAuth()
  @Roles(Role.Company, Role.AssetOwner, Role.Broker, Role.CorporateInvestor)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post('ask')
  async createAsk(
    @Body() data: CreateMarketplaceRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return await this.marketplaceService.createAskListing({
      accountId: ctx.user.id,
      assetId: data.assetId,
      pricePerUnit: data.pricePerUnit,
      totalUnits: data.totalUnits,
    });
  }

  // 3B - Place bid
  @ApiBearerAuth()
  @Roles(Role.Company, Role.AssetOwner, Role.Broker, Role.CorporateInvestor)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post('bid')
  async placeBid(
    @Body() data: CreateBidMarketplaceRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.marketplaceService.placeBid({
      accountId: req.user.id,
      assetId: data.assetId,
      bidPricePerUnit: data.bidPricePerUnit,
      units: data.units,
    });
  }

  // 3C - Immediate sell
  @ApiBearerAuth()
  @Roles(Role.Company, Role.AssetOwner, Role.Broker, Role.CorporateInvestor)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post('immediate-sell')
  async immediateSell(
    @Body() data: CreateImmediateSellMarketplaceRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.marketplaceService.immediateSell({
      sellerId: req.user.id,
      assetId: data.assetId,
      units: data.units,
      password: data.password,
    });
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
  @RequirePermissions('secondary_marketplace.view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @ApiQuery({
    name: 'type',
    enum: ListingType,
    enumName: 'ListingType',
    required: false,
  })
  @ApiQuery({
    name: 'listingStatus',
    enum: ListingStatus,
    enumName: 'listingStatus',
    required: false,
  })
  @Get(':assetId/listings')
  async getListings(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
    @Query('type') type: ListingType,
    @Query('listingStatus') listingStatus: ListingStatus,
    @Query() query: GetMarketplaceRequestDto,
  ) {
    return await this.marketplaceService.getListings(
      req.user.id,
      assetId,
      type,
      listingStatus,
      query,
    );
  }

  // Get 24h market stats
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
  @Get(':assetId/stats')
  async getMarketStats(@Param('assetId', ParseIntPipe) assetId: number) {
    return await this.marketplaceService.getMarketStats(assetId);
  }

  // My active listings
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
  @Get('my-listings')
  async getMyListings(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetMarketplaceRequestDto,
  ) {
    return await this.marketplaceService.getMyListings(
      req.user.id,
      query.assetId,
      {
        search: query.search,
        skip: query.skip,
        take: query.take,
        type: query.type,
      },
    );
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
  @Get(':assetId/chart')
  async getChart(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query('period') period: '1M' | '3M' | '6M' | '1Y' = '6M',
  ) {
    return await this.marketplaceService.getAssetChartData(assetId, period);
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
  @Get(':assetId/overview')
  async getOverview(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.marketplaceService.getAssetOverview(assetId, req.user.id);
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
  @Get(':assetId/orderbook')
  async getOrderBook(@Param('assetId', ParseIntPipe) assetId: number) {
    return await this.marketplaceService.getOrderBook(assetId);
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
  @Get(':assetId/orders')
  async getOrders(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.marketplaceService.getAssetOrders(assetId, req.user.id);
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
  @Post('direct-buy')
  async directBuy(
    @Body() dto: CreateDirectBuyRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.marketplaceService.directBuy({
      buyerId: req.user.id,
      listingId: dto.listingId, // ASK listing id
      units: dto.units,
    });
  }

  // Direct Sell — seller picks a BID listing and sells
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
  @Post('direct-sell')
  async directSell(
    @Body() dto: CreateDirectSellRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.marketplaceService.directSell({
      sellerId: req.user.id,
      listingId: dto.listingId, // BID listing id
      units: dto.units,
    });
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
  @Get('direct-trade/history')
  async getDirectTradeHistory(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetMarketplaceImmediateRequestDto,
  ) {
    return await this.marketplaceService.getMyTradeHistory(req.user.id, {
      type: query.type,
      assetId: query.assetId,
      search: query.search,
      skip: query.skip,
      take: query.take,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });
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
  @Get('immediate-sell/list')
  async getImmediateSellList(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetMarketplaceImmediateRequestDto,
  ) {
    return await this.marketplaceService.getImmediateSellList(req.user.id, {
      skip: query.skip,
      take: query.take,
      search: query.search,
      assetId: query.assetId,
      tradeType: query.tradeType,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });
  }

  // Cancel listing
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
  @Delete('listings/:listingId')
  async cancelListing(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.marketplaceService.cancelListing(listingId, req.user.id);
  }
}
