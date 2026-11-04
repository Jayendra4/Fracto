import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  AuthorizationService,
  BaseController,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  RolesGuard,
  Roles,
  AccessGuard,
  Role,
  AuthenticatedRequest,
  UserType,
} from '@Common';
import { GroupService } from './group.services';
import {
  CreateGroupRequestDto,
  GetGroupRequestDto,
  UpdateGroupRequestDto,
} from './dto';
import { GroupStatus } from '../generated/prisma/enums';

@ApiTags('Group')
@Controller('group')
export class GroupController extends BaseController {
  constructor(
    private readonly groupService: GroupService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
  }

  @Get()
  async getAll(@Query() query: GetGroupRequestDto) {
    return await this.groupService.getAll({
      search: query.search,
      skip: query.skip,
      take: query.take,
      groupStatus: query.groupStatus,
      accountId: query.accountId,
    });
  }

  @Get('highlighted')
  async getHighlightedGroups(@Query() query: GetGroupRequestDto) {
    return await this.groupService.getTopHighlightedGroup({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @RequirePermissions('primary_group.member_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('group-member/:groupId')
  async getAllMember(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() query: GetGroupRequestDto,
  ) {
    return await this.groupService.getAllMember(groupId, {
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
  @RequirePermissions('primary_group.property_view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get('assets-in-group/:groupId')
  async getAllGroupAsset(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Req() req: AuthenticatedRequest,
    @Query() query: GetGroupRequestDto,
  ) {
    const ctx = this.getContext(req);
    const isAdmin = ctx.user.type === UserType.Admin;
    return await this.groupService.getAllAssets(groupId, ctx.user.id, isAdmin, {
      search: query.search,
      skip: query.skip,
      take: query.take,
      status: query.status,
      assetStatus: query.AssetStatus,
      rwaStatus: query.RwaStatus,
    });
  }
  @ApiBearerAuth()
  @Roles(Role.Company, Role.AssetOwner, Role.Broker, Role.CorporateInvestor)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('/user-groups-asset')
  async getJoinedGroupsWithAssets(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetGroupRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.groupService.getJoinedGroupsWithAssets(ctx.user.id, {
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.Company, Role.AssetOwner, Role.Broker, Role.CorporateInvestor)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Get('/user-in-marketplace')
  async getMarketPlaceAssets(@Query() query: GetGroupRequestDto) {
    return await this.groupService.getMarketPlaceAssets({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @Get(':groupId')
  async getGroupInf(@Param('groupId', ParseIntPipe) groupId: number) {
    return await this.groupService.getIndividualGroupInf(groupId);
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
  @RequirePermissions('group.create')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Post()
  async create(@Body() data: CreateGroupRequestDto) {
    return await this.groupService.create({
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      image: data.image,
    });
  }

  @ApiParam({
    name: 'status',
    enum: GroupStatus,
  })
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
  @Post(':groupId/:status')
  async setStatus(
    @Req() req: AuthenticatedRequest,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('status', new ParseEnumPipe(GroupStatus))
    status: GroupStatus,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      status === GroupStatus.Active ? 'group.activate' : 'group.deactivate',
    );
    await this.groupService.setStatus(groupId, status);
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
  @RequirePermissions('group.edit')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Patch(':groupId')
  async updateGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() data: UpdateGroupRequestDto,
  ) {
    return await this.groupService.update(groupId, {
      title: data.title,
      description: data.description,
      image: data.image,
      categoryId: data.categoryId,
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
  @RequirePermissions('group.delete')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Delete(':groupId')
  async delete(@Param('groupId', ParseIntPipe) groupId: number) {
    await this.groupService.delete(groupId);
    return { status: 'success' };
  }
}
