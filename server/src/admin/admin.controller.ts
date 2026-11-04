import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '@Common';
import { AdminService } from './admin.service';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  AuthenticateRequestDto,
  ChangePasswordRequestDto,
  UpdateProfileDetailsRequestDto,
  UpdateProfileImageRequestDto,
} from './dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
@Controller('admin')
export class AdminController extends BaseController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardService: AdminDashboardService,
  ) {
    super();
  }

  @Get('dashboard')
  getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @ApiQuery({
    name: 'filter',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: false,
    description: 'Revenue chart grouping',
  })
  @Get('dashboard/revenue-chart')
  getRevenueChart(
    @Query('filter')
    filter: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
  ) {
    return this.dashboardService.getRevenueChart(filter);
  }

  @Get()
  async getProfile(@Req() req: AuthenticatedRequest) {
    const ctx = this.getContext(req);
    return await this.adminService.getProfile(ctx.user.id);
  }

  @Patch()
  async updateProfileDetails(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateProfileDetailsRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.adminService.updateProfileDetails(ctx.user.id, {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
    });
    return { status: 'success' };
  }

  @Post('profile-image')
  updateProfileImage(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateProfileImageRequestDto,
  ) {
    const ctx = this.getContext(req);
    return this.adminService.updateProfileImage(ctx.user.id, data.profileImage);
  }

  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() data: ChangePasswordRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.adminService.changePassword(
      ctx.user.id,
      data.oldPassword,
      data.newPassword,
    );
    return { status: 'success' };
  }

  @Post('authenticate')
  async authenticate(
    @Req() req: AuthenticatedRequest,
    @Body() data: AuthenticateRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.adminService.authenticate(ctx.user.id, data.password);
    return { status: 'success' };
  }
}
