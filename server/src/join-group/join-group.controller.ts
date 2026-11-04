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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { JoinGroupService } from './join-group.services';
import {
  CreateJoinGroupRequestDto,
  GetJoinGroupRequestDto,
  ExitGroupRequestDto,
} from './dto';

@ApiTags('Join-group')
@Controller('join-group')
export class JoinGroupController extends BaseController {
  constructor(private readonly joinGroupService: JoinGroupService) {
    super();
  }

  @Get()
  async getAll(@Query() query: GetJoinGroupRequestDto) {
    return await this.joinGroupService.getAll({
      search: query.search,
      skip: query.skip,
      take: query.take,
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
  @Get(':accountId')
  async getGroupInf(@Param('accountId', ParseIntPipe) accountId: number) {
    return await this.joinGroupService.getUserGroups(accountId);
  }

  @ApiBearerAuth()
  @Roles(Role.Company, Role.AssetOwner, Role.Broker, Role.CorporateInvestor)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get(':accountId/joined-group')
  async getJoinedGroups(@Param('accountId', ParseIntPipe) accountId: number) {
    return await this.joinGroupService.getJoinedGroups(accountId);
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
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateJoinGroupRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.joinGroupService.create({
      accountId: ctx.user.id,
      groupIds: data.groupIds,
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
  @RequirePermissions('primary_group.member_remove')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Delete(':groupId/member/:accountId')
  async removeMember(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    await this.joinGroupService.removeMember(groupId, accountId);
    return { status: 'success' };
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
  @Delete(':groupId/exit-group')
  async exitGroupByUser(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Req() req: AuthenticatedRequest,
    @Body() data: ExitGroupRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.joinGroupService.exitGroupByUser(groupId, ctx.user.id, {
      password: data.password,
    });
    return { status: 'success' };
  }
}
