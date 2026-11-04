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
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
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
import { RolesService } from './roles.service';
import {
  CreateRoleRequestDto,
  DeleteRoleRequestDto,
  UpdateRoleRequestDto,
  GetAllPermissionListDto,
} from './dto';
import { RoleStatus } from '../generated/prisma/client';

@ApiTags('Roles')
@ApiBearerAuth()
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
@Controller()
export class RolesController extends BaseController {
  constructor(private readonly rolesService: RolesService) {
    super();
  }

  @RequirePermissions('roles.view')
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Filter by module name/label (e.g. "category")',
  })
  @Get('permissions')
  async getPermissions(@Query() query: GetAllPermissionListDto) {
    return await this.rolesService.getPermissionCatalog({
      search: query.search,
    });
  }

  @RequirePermissions('roles.view')
  @Get('roles')
  async getRoles(@Query() query: GetAllPermissionListDto) {
    return await this.rolesService.listRoles({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @RequirePermissions('roles.view')
  @Get('roles/:id')
  async getRole(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.getRole(id);
  }

  @RequirePermissions('roles.create')
  @Post('roles')
  async createRole(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateRoleRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.rolesService.createRole(ctx.user, data);
  }

  @RequirePermissions('roles.edit')
  @Put('roles/:id')
  async updateRole(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateRoleRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.rolesService.updateRole(ctx.user, id, data);
  }

  @ApiParam({ name: 'status', enum: RoleStatus })
  @Patch('roles/:id/:status')
  async setStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Param('status', new ParseEnumPipe(RoleStatus)) status: RoleStatus,
  ) {
    const ctx = this.getContext(req);
    return await this.rolesService.setStatus(ctx.user, id, status);
  }

  @RequirePermissions('roles.delete')
  @Delete('roles/:id')
  async deleteRole(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: DeleteRoleRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.rolesService.deleteRole(ctx.user, id, query.replacementRoleId);
    return { status: 'success' };
  }
}
