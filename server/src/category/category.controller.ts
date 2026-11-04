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
} from '@Common';
import { CategoryService } from './category.service';
import { CreateCategoryRequestDto, GetCategoryRequestDto } from './dto';
import {
  CategoryRequestStatus,
  CategoryStatus,
} from '../generated/prisma/enums';

@ApiTags('Category')
@Controller('category')
export class CategoryController extends BaseController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
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
  @RequirePermissions('category.view')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Get()
  async getAll(@Query() query: GetCategoryRequestDto) {
    return await this.categoryService.getAll({
      search: query.search,
      skip: query.skip,
      take: query.take,
      status: query.categoryStatus,
      approvedStatus: query.approvedStatus,
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
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('category.create')
  @Post()
  async create(
    @Body() data: CreateCategoryRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return await this.categoryService.create({
      accountId: ctx.user.id,
      name: data.name,
    });
  }

  @ApiParam({
    name: 'status',
    enum: CategoryStatus,
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
  @Post(':categoryId/:status')
  async setStatus(
    @Req() req: AuthenticatedRequest,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('status', new ParseEnumPipe(CategoryStatus))
    status: CategoryStatus,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      status === CategoryStatus.Active
        ? 'category.activate'
        : 'category.deactivate',
    );
    await this.categoryService.setStatus(categoryId, status);
    return { status: 'success' };
  }

  @ApiParam({
    name: 'status',
    enum: CategoryRequestStatus,
  })
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Patch(':categoryId/:status')
  async approvedStatus(
    @Req() req: AuthenticatedRequest,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('status', new ParseEnumPipe(CategoryRequestStatus))
    status: CategoryRequestStatus,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      status === CategoryRequestStatus.Rejected
        ? 'category.reject'
        : 'category.approve',
    );
    await this.categoryService.approvedStatus(categoryId, status);
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
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @RequirePermissions('category.delete')
  @Delete(':categoryId')
  async delete(@Param('categoryId', ParseIntPipe) categoryId: number) {
    await this.categoryService.delete(categoryId);
    return { status: 'success' };
  }
}
