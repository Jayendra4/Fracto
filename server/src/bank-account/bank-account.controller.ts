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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccountService } from './bank-account.service';
import {
  CreateBankAccountDto,
  GetAllBankAccountsRequestDto,
  GetAllBanks,
  UpdateBankAccountDto,
} from './dto';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
} from '@Common';

@ApiTags('Bank Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('bank-account')
export class BankAccountController extends BaseController {
  constructor(private readonly bankAccountService: BankAccountService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new bank account' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateBankAccountDto,
  ) {
    const ctx = this.getContext(req);
    const owner = await this.bankAccountService.getOrCreateOwner(
      ctx.user.type,
      ctx.user.id,
    );
    const paymentOwnerId = owner.id;

    return await this.bankAccountService.create(paymentOwnerId, data);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all bank accounts for login current owner' })
  async findAll(
    @Query() query: GetAllBankAccountsRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);

    const owner = await this.bankAccountService.getOrCreateOwner(
      ctx.user.type,
      ctx.user.id,
    );
    const paymentOwnerId = owner.id;
    return await this.bankAccountService.getAllAccounts({
      paymentOwnerId,
      search: query.search,
    });
  }

  @Get('active')
  async getActiveBankAccounts() {
    return this.bankAccountService.getActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank account by ID' })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const ctx = this.getContext(req);
    const owner = await this.bankAccountService.getOrCreateOwner(
      ctx.user.type,
      ctx.user.id,
    );
    const paymentOwnerId = owner.id;
    return await this.bankAccountService.findOne(paymentOwnerId, id);
  }

  @Patch(':id/status')
  async toggleBankAccountActive(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateBankAccountDto,
  ) {
    const ctx = this.getContext(req);
    const owner = await this.bankAccountService.getOrCreateOwner(
      ctx.user.type,
      ctx.user.id,
    );
    const paymentOwnerId = owner.id;
    return this.bankAccountService.updateBankAccountStatus({
      paymentOwnerId,
      bankAccountId: id,
      isActive: data.isActive,
      isDeleted: data.isDeleted,
    });
  }

  @Get()
  async getUsers(@Query() query: GetAllBanks) {
    return await this.bankAccountService.getAllBanks({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }
}
