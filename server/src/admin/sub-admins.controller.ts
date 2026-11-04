import {
  Body,
  Controller,
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
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  Role,
  Roles,
  RolesGuard,
} from '@Common';
import { AdminService } from './admin.service';
import {
  AssignAdminRoleRequestDto,
  CreateSubAdminRequestDto,
  GetAllSubAdminsList,
} from './dto';
import { AdminStatus } from '../generated/prisma/client';

@ApiTags('Sub-Admin')
@ApiBearerAuth()
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
@Controller('sub-admin')
export class SubAdminsController extends BaseController {
  constructor(private readonly adminService: AdminService) {
    super();
  }

  @RequirePermissions('sub-admins.view')
  @Get()
  async getAdmins(@Query() query: GetAllSubAdminsList) {
    return await this.adminService.listAdmins({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @RequirePermissions('sub-admins.view')
  @Get(':adminId')
  async getAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return await this.adminService.getAdminById(adminId);
  }

  @RequirePermissions('sub-admins.create')
  @Post()
  async createSubAdmin(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateSubAdminRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.adminService.createSubAdmin(ctx.user, data);
  }

  @RequirePermissions('roles.assign', 'sub-admins.edit')
  @Patch(':adminId/role')
  async assignRole(
    @Req() req: AuthenticatedRequest,
    @Param('adminId', ParseIntPipe) adminId: number,
    @Body() data: AssignAdminRoleRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.adminService.assignRole(ctx.user, adminId, data.roleId);
  }

  @ApiParam({ name: 'status', enum: AdminStatus })
  @RequirePermissions('sub-admins.delete')
  @Post(':adminId/:status')
  async setAdminStatus(
    @Req() req: AuthenticatedRequest,
    @Param('adminId', ParseIntPipe) adminId: number,
    @Param('status', new ParseEnumPipe(AdminStatus)) status: AdminStatus,
  ) {
    const ctx = this.getContext(req);
    await this.adminService.setAdminStatusGuarded(ctx.user, adminId, status);
    return { status: 'success' };
  }
}
