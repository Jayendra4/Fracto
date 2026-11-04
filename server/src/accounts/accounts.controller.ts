import {
  BadRequestException,
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
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthenticatedRequest,
  AuthorizationService,
  BaseController,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  RolesGuard,
  Roles,
  AccessGuard,
  Role,
} from '@Common';
import { AccountsService } from './accounts.service';
import {
  ChangePasswordRequestDto,
  GetUsersRequestDto,
  UpdateKycDto,
  UpdateUsersProfileDetailsRequestDto,
  UpdateProfileImageRequestDto,
  UpdateUserProfileRequestDto,
} from './dto';
import { AccountStatus } from '../generated/prisma/client';
import { RegisterUserRequestDto } from '../auth/dto';
import { CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('accounts')
export class AccountsController extends BaseController {
  constructor(
    private readonly AccountsService: AccountsService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
  }

  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('users.view')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Get()
  async getUsers(@Query() query: GetUsersRequestDto) {
    return await this.AccountsService.getAll({
      accountType: query.accountType,
      search: query.search,
      skip: query.skip,
      take: query.take,
      fromDate: query.fromDate,
      toDate: query.toDate,
      kycStatus: query.kycStatus,
    });
  }

  @Roles(Role.Admin)
  @RequirePermissions('users.create')
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
  @Post('create')
  async registerAccountByAdmin(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
    @Body() data: RegisterUserRequestDto,
  ) {
    const response = await this.AccountsService.create({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password,
      dialCode: data.dialCode,
      mobile: data.mobile,
      countryId: data.countryId,
      accountType: data.accountType,
      createdById: req.user.id,
    });

    return response;
  }

  @CacheTTL(1)
  @Get('me')
  async getProfile(@Req() req: AuthenticatedRequest) {
    const ctx = this.getContext(req);
    return await this.AccountsService.getProfile(ctx.user.id);
  }

  @Patch('me')
  async updateProfileDetails(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateUsersProfileDetailsRequestDto,
  ) {
    if (data.mobile && (!data.dialCode || !data.country)) {
      throw new BadRequestException();
    }
    const ctx = this.getContext(req);
    await this.AccountsService.updateProfileDetails({
      accountId: ctx.user.id,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      dialCode: data.dialCode,
      mobile: data.mobile,
      country: data.country,
      type: data.type,
      meta: {
        passportNumber: data.meta?.passportNumber,
        monthlyIncome: data.meta?.monthlyIncome,
        occupation: data.meta?.occupation,
        panNumber: data.meta?.panNumber,
        dateOfBirth: data.meta?.dateOfBirth,
      },
    });
    return { status: 'success' };
  }

  @Get(':accountId')
  async getUserProfile(@Param('accountId', ParseIntPipe) accountId: number) {
    return await this.AccountsService.getProfile(accountId);
  }

  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('users.bank_view')
  @UseGuards(RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Get bank accounts By Admin based on accountId' })
  @Get(':accountId/bank-accounts')
  async getBankAccountDetails(
    @Req() req: AuthenticatedRequest,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return await this.AccountsService.getBankAccountDetails(accountId);
  }

  @Roles(Role.Admin, Role.Trustee)
  @RequirePermissions('users.bank_view')
  @UseGuards(RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Get upi accounts By Admin based on accountId' })
  @Get(':accountId/upi-accounts')
  async getUpiAccountDetails(
    @Req() req: AuthenticatedRequest,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return await this.AccountsService.getUpiAccountDetails(accountId);
  }

  @Roles(Role.Admin)
  @RequirePermissions('users.edit')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Patch(':accountId')
  async updateUserProfileDetails(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() data: UpdateUserProfileRequestDto,
  ) {
    return await this.AccountsService.updateProfileDetailsByAdministrator({
      accountId,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      dialCode: data.dialCode,
      mobile: data.mobile,
      country: data.country,
      password: data.password,
      status: data.status,
      isDeleted: data.isDeleted,
    });
  }

  @Post('me/profile-image')
  updateProfileImage(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateProfileImageRequestDto,
  ) {
    const ctx = this.getContext(req);
    return this.AccountsService.updateProfileImage(
      ctx.user.id,
      data.profileImage,
    );
  }

  @Post('me/change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() data: ChangePasswordRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.AccountsService.changePassword(
      ctx.user.id,
      data.oldPassword,
      data.newPassword,
    );
    return { status: 'success' };
  }

  @Patch('kyc/update')
  async updateKycDetails(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateKycDto,
  ) {
    const ctx = this.getContext(req);
    return this.AccountsService.updateKyc(ctx.user.id, ctx.user.type, data);
  }

  @ApiParam({ name: 'status', enum: AccountStatus })
  @Roles(Role.Admin)
  @UseGuards(RolesGuard, PermissionsGuard)
  @Post(':accountId/:status')
  async setAccountStatus(
    @Req() req: AuthenticatedRequest,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('status', new ParseEnumPipe(AccountStatus)) status: AccountStatus,
  ) {
    const ctx = this.getContext(req);
    await this.authorizationService.assertPermission(
      ctx.user,
      status === AccountStatus.Active ? 'users.activate' : 'users.deactivate',
    );
    await this.AccountsService.setStatus(accountId, status);
    return { status: 'success' };
  }
}
