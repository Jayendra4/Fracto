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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AssetsService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
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
  SearchablePaginatedDto,
} from '@Common';
import { AccountType, AssetStatus } from '../generated/prisma/enums';
import {
  AdminAssetReviewDto,
  FinalizeListingDto,
  FractionalizeAssetDto,
  GetAllAssetRequestDto,
  GetAssetDocumentsDto,
  GetAssetListByAdminDto,
  GetAssetListDto,
  GetMyAssetDto,
  SaveAssetDto,
  UpdateAssetDto,
  UpdateAssetPriceDto,
  UpdateRwaStatusDto,
} from './dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController extends BaseController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  async createAsset(
    @Body() createAssetDto: CreateAssetDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return this.assetsService.createAsset(
      ctx.user.id,
      ctx.user.type,
      createAssetDto,
    );
  }

  @Patch()
  @ApiOperation({ summary: 'Update RWA' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  async approveAssetByOwner(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateRwaStatusDto,
  ) {
    const ctx = this.getContext(req);
    return this.assetsService.updateRwaRequestStatusByOwner(
      ctx.user.id,
      data.assetId,
      data.status,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my assets' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  async getAssets(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetMyAssetDto,
  ) {
    const ctx = this.getContext(req);
    return this.assetsService.getAssets(ctx.user.id, {
      skip: query.skip,
      take: query.take,
      search: query.search,
      filters: {
        assetStatus: query.assetStatus,
        rwaStatus: query.rwaStatus,
        assetownerStatus: query.assetOwnerStatus,
      },
    });
  }

  @Get('me/documents/due-diligence')
  @ApiOperation({
    summary:
      'Get my asset documents pending or rejected in due-diligence review',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  async getMyAssetDocumentsByDueDiligenceStatus(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetAssetDocumentsDto,
  ) {
    const ctx = this.getContext(req);
    return this.assetsService.getMyAssetDocumentsByDueDiligenceStatus(
      ctx.user.id,
      {
        status: query.status,
        search: query.search,
        sortBy: query.sortBy,
        order: query.order,
        skip: query.skip,
        take: query.take,
      },
    );
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all assets' })
  async getAllAssets(@Query() query: GetAssetListDto) {
    return this.assetsService.getAllAssets(query);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets' })
  @ApiResponse({ status: 200, description: 'List of all assets' })
  async getAllAssetsList(@Query() query: GetAllAssetRequestDto) {
    return this.assetsService.getAllAssetsList({
      skip: query.skip,
      take: query.take,
      search: query.search,
      filters: {
        assetStatus: query.assetStatus,
        isVisible: query.isVisible,
        assetType: query.assetType,
        rwaStatus: query.rwaStatus,
        fractionalizationStatus: query.fractionalizationStatus,
        newlyAdded: query.newlyAdded,
        steps: query.steps,
        assetSubType: query.assetSubType,
        trusteeId: query.trusteeId,
        fromDate: query.fromDate,
        toDate: query.toDate,
        groupId: query.groupId,
        accountId: query.accountId,
      },
    });
  }

  @Get('favourites')
  @ApiOperation({ summary: 'Get my favourite assets' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  async myFavourites(
    @Req() req: AuthenticatedRequest,
    @Query() query: SearchablePaginatedDto,
  ) {
    const ctx = this.getContext(req);
    return this.assetsService.getMySavedAssets(ctx.user.id, query);
  }

  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('asset.view')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({
    summary: 'List assets by admin based accountId',
  })
  @Get('admin')
  async getAssetsByAdmin(@Query() query: GetAssetListByAdminDto) {
    return this.assetsService.getAllAssetsByAdmin({
      skip: query.skip,
      take: query.take,
      search: query.search,
      newlyAdded: query.newlyAdded,
      accountId: Number(query.accountId),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by Id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  async getAssetById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const ctx = this.getContext(req);
    return this.assetsService.getAssetById(
      ctx.user.type as AccountType,
      ctx.user.id,
      id,
    );
  }

  @Roles(Role.Admin)
  @RequirePermissions('asset.price_update')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Patch(':id/price')
  @ApiOperation({ summary: 'Update asset current price per fraction' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 12,
    description: 'Asset ID',
  })
  @ApiBody({ type: UpdateAssetPriceDto })
  async updateAssetPrice(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAssetPriceDto,
  ) {
    return this.assetsService.updateAssetPrice(
      id,
      data.currentPricePerFraction,
    );
  }

  @Roles(Role.Admin)
  @RequirePermissions('asset.fractionalize')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Post(':assetId/fractionalize')
  @ApiOperation({
    summary: 'Create fractions for asset and set initial price',
  })
  async fractionalizeAsset(
    @Req() req: AuthenticatedRequest,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Body() data: FractionalizeAssetDto,
  ) {
    return await this.assetsService.fractionalizeAsset(
      assetId,
      req.user.id,
      data.totalFractions,
      data.pricePerFraction,
    );
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Patch(':assetId/admin-review')
  async reviewAsset(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
    @Body() data: AdminAssetReviewDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.status === AssetStatus.Rejected
        ? 'asset.review_reject'
        : 'asset.review_approve',
    );
    return await this.assetsService.assetReviewByAdmin(assetId, req.user.id, {
      status: data.status,
      rejectionReason: data.rejectionReason,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Patch(':assetId/request-listing')
  @ApiOperation({
    summary:
      'Asset owner requests final admin approval to go live, after trustee review is complete',
  })
  async requestListing(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return await this.assetsService.requestListing(assetId, ctx.user.id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Patch(':assetId/finalize-listing')
  @ApiOperation({
    summary:
      'Final admin approval after trustee review — sets listing amount and goes live',
  })
  async finalizeListing(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
    @Body() data: FinalizeListingDto,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      'asset.finalize',
    );
    return await this.assetsService.finalizeListing(assetId, req.user.id, {
      name: data.name,
      secondaryClubId: data.secondaryClubId,
      totalFractions: data.totalFractions,
      pricePerFraction: data.pricePerFraction,
      status: data.status,
      listingAmount: data.listingAmount,
      rejectionReason: data.rejectionReason,
    });
  }

  @Post('save')
  @ApiOperation({ summary: 'Save / Unsave asset (favourite)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  async saveAsset(
    @Req() req: AuthenticatedRequest,
    @Body() data: SaveAssetDto,
  ) {
    const ctx = this.getContext(req);
    return this.assetsService.saveOrUnsaveAsset(ctx.user.id, data);
  }

  @Patch(':assetId')
  @ApiOperation({ summary: 'Update asset' })
  @ApiBearerAuth()
  @RequirePermissions('asset.update')
  @UseGuards(JwtAuthGuard, AccessGuard, PermissionsGuard)
  async updateAsset(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Body() data: UpdateAssetDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { user } = this.getContext(req);

    return this.assetsService.updateAsset(assetId, user.id, user.type, data);
  }

  @Roles(Role.Admin)
  @RequirePermissions('secondary_marketplace.asset_enable')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Patch(':assetId/switch-to-marketplace')
  async switchToMarketPlace(@Param('assetId', ParseIntPipe) assetId: number) {
    return this.assetsService.switchToMarketPlace(assetId);
  }
}
