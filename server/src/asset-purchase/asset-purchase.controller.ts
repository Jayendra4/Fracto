import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedRequest, BaseController, JwtAuthGuard } from '@Common';
import {
  CreateAssetPurchaseDto,
  CreateSignConsentDto,
  GetAssetPurchaseHistory,
  MyAssetPortfolioQueryDto,
} from './dto';
import { AssetPurchaseService } from './asset-purchase.service';
import { FractionFilterDto } from './dto/get-asset-fractions-list.dto';

@ApiTags('Asset Purchase')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asset-purchase')
export class AssetPurchaseController extends BaseController {
  constructor(private readonly assetPurchaseService: AssetPurchaseService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Purchase asset fractions' })
  @ApiResponse({
    status: 201,
    description: 'Asset purchased successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient balance / Invalid asset',
  })
  async purchaseAsset(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateAssetPurchaseDto,
  ) {
    const ctx = this.getContext(req);
    return this.assetPurchaseService.purchaseAsset(ctx.user.id, {
      assetId: data.assetId,
      fractions: data.fractions,
      couponCode: data.couponCode,
    });
  }

  @Post('sign-consent')
  async signOnFractionsConsent(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateSignConsentDto,
  ) {
    const ctx = this.getContext(req);
    return this.assetPurchaseService.signOnFractionsConsent(ctx.user.id, {
      assetId: data.assetId,
      buyerConsent: data.buyerConsent,
      rejectionReason: data.rejectionReason,
    });
  }

  @Get('me')
  @ApiOperation({
    summary:
      'Get asset fraction purchases for current user. Admin can pass accountId to view specific user data',
  })
  async getAllFractions(
    @Query() query: FractionFilterDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    const accountId = query.accountId ?? ctx.user.id;
    return this.assetPurchaseService.getAllFractions(accountId, {
      assetId: query.assetId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      skip: query.skip ? Number(query.skip) : undefined,
      take: query.take ? Number(query.take) : undefined,
    });
  }

  @Get('me/portfolio')
  @ApiOperation({
    summary:
      'Returns full asset details with meta, price, investment summary, profit/loss and sorting support',
  })
  async getMyPortfolio(
    @Req() req: AuthenticatedRequest,
    @Query() query: MyAssetPortfolioQueryDto,
  ) {
    const userId = req.user.id;
    return this.assetPurchaseService.getMyAssetPortfolioDetailed(userId, {
      skip: query.skip,
      take: query.take,
      search: query.search,
      sortBy: query.sortBy,
      order: query.order,
    });
  }

  @Get(':assetId/purchase-history')
  async getPurchaseHistory(
    @Param('assetId') assetId: string,
    @Query() query: GetAssetPurchaseHistory,
  ) {
    return this.assetPurchaseService.getAssetPurchaseHistory(Number(assetId), {
      skip: Number(query.skip) || 0,
      take: Number(query.take) || 10,
    });
  }
}
