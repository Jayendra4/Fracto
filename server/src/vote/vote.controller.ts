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
  BaseController,
  JwtAuthGuard,
  AccessGuard,
  PermissionsGuard,
  RequirePermissions,
  RolesGuard,
  Roles,
  Role,
  AuthenticatedRequest,
  SearchableDto,
  SearchablePaginatedDto,
} from '@Common';
import { VoteService } from './vote.service';
import { CreateVoteRequestDto, GetVoteRequestDto } from './dto';

@ApiTags('Vote')
@Controller('vote')
export class VoteController extends BaseController {
  constructor(private readonly voteService: VoteService) {
    super();
  }

  @ApiBearerAuth()
  @RequirePermissions('vote.view')
  @UseGuards(JwtAuthGuard, AccessGuard, PermissionsGuard)
  @Get()
  async getAll(@Query() query: GetVoteRequestDto) {
    return await this.voteService.getAll({
      secondaryClubId: query.secondaryClubId,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('summary/:secondaryClubId')
  async getClubVoteSummary(
    @Param('secondaryClubId', ParseIntPipe) secondaryClubId: number,
  ) {
    return await this.voteService.getClubVoteSummary(secondaryClubId);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @RequirePermissions('vote.asset_voting_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('asset-summary')
  async getAllAssetVoteSummaries(@Query() query: SearchablePaginatedDto) {
    return await this.voteService.getAllAssetVoteSummaries({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @RequirePermissions('vote.asset_voting_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('asset-summary/:assetId')
  async getAssetVoteSummary(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() query: SearchableDto,
  ) {
    return await this.voteService.getAssetVoteSummary(assetId, {
      search: query.search,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('owner-statistics')
  async getOwnerVoteStatistics(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetVoteRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.voteService.getOwnerVoteStatistics(ctx.user.id, {
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Post()
  async create(
    @Body() data: CreateVoteRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return await this.voteService.create({
      accountId: ctx.user.id,
      assetId: data.assetId,
      secondaryClubId: data.secondaryClubId,
      choice: data.choice,
    });
  }
}
