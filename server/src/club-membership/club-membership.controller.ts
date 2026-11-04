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
  AccessGuard,
  PermissionsGuard,
  RequirePermissions,
  RolesGuard,
  Roles,
  Role,
  AuthenticatedRequest,
} from '@Common';
import { ClubMembershipService } from './club-membership.service';
import { GetMembershipRequestsDto, ReviewMembershipRequestDto } from './dto';
import { MembershipStatus } from '../generated/prisma/enums';

@ApiTags('Club-membership')
@Controller('club-membership')
export class ClubMembershipController extends BaseController {
  constructor(
    private readonly clubMembershipService: ClubMembershipService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Post(':secondaryClubId/accept-nda')
  async acceptNda(
    @Param('secondaryClubId', ParseIntPipe) secondaryClubId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return await this.clubMembershipService.acceptNda(
      ctx.user.id,
      secondaryClubId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get('my-status/:secondaryClubId')
  async getMyStatus(
    @Param('secondaryClubId', ParseIntPipe) secondaryClubId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return await this.clubMembershipService.getMyMembershipStatus(
      ctx.user.id,
      secondaryClubId,
    );
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @RequirePermissions('nda_consent.view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get()
  async getAll(@Query() query: GetMembershipRequestsDto) {
    return await this.clubMembershipService.getAll({
      secondaryClubId: query.secondaryClubId,
      status: query.status,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Post(':requestId/review')
  async review(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() data: ReviewMembershipRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      data.status === MembershipStatus.Rejected
        ? 'nda_consent.review_reject'
        : 'nda_consent.review_approve',
    );
    return await this.clubMembershipService.review(ctx.user.id, requestId, {
      status: data.status,
      rejectionReason: data.rejectionReason,
    });
  }
}
