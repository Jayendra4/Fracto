import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpiAccountService } from './upi-account.service';
import { CreateUpiAccountDto } from './dto/create-upi-account.dto';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
} from '@Common';
import { GetAllUpiAccountsRequestDto, UpdateUpiAccountDto } from './dto';

@ApiTags('UPI Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('upi-account')
export class UpiAccountController extends BaseController {
  constructor(private readonly upiAccountService: UpiAccountService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new UPI account' })
  @ApiResponse({ status: 201, description: 'UPI account created successfully' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateUpiAccountDto,
  ) {
    const ctx = this.getContext(req);
    const owner = await this.upiAccountService.getOrCreateOwner(
      ctx.user.type,
      ctx.user.id,
    );
    const paymentOwnerId = owner.id;
    return await this.upiAccountService.create(paymentOwnerId, data);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all UPI accounts for current owner' })
  @ApiResponse({ status: 200, description: 'List of UPI accounts' })
  async findAll(
    @Query() query: GetAllUpiAccountsRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    const owner = await this.upiAccountService.getOrCreateOwner(
      ctx.user.type,
      ctx.user.id,
    );
    const paymentOwnerId = owner.id;
    return await this.upiAccountService.getAllUpiAccounts({
      paymentOwnerId,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @Get('active')
  async getActiveUpiAccounts() {
    return this.upiAccountService.getActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get UPI account by ID' })
  @ApiResponse({ status: 200, description: 'UPI account details' })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const ctx = this.getContext(req);
    const owner = await this.upiAccountService.getOrCreateOwner(
      ctx.user.type,
      ctx.user.id,
    );
    const paymentOwnerId = owner.id;
    return await this.upiAccountService.findOne(paymentOwnerId, id);
  }

  @Patch(':id/status')
  async toggleUpiAccountActive(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUpiAccountDto,
  ) {
    const ctx = this.getContext(req);
    const owner = await this.upiAccountService.getOrCreateOwner(
      ctx.user.type,
      ctx.user.id,
    );
    const paymentOwnerId = owner.id;
    return this.upiAccountService.updateUpiAccountStatus({
      paymentOwnerId: paymentOwnerId,
      upiAccountId: id,
      isActive: data.isActive,
      isDeleted: data.isDeleted,
    });
  }
}
