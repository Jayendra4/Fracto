import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AccessGuard,
  BaseController,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  Role,
  Roles,
  RolesGuard,
} from '@Common';
import { WalletsService } from '../wallets.service';
import { UpdateBalanceRequestDto } from '../dto';
import { PrismaService } from '../../prisma';
import {
  Prisma,
  WalletTransactionContext,
} from '../../generated/prisma/client';

@ApiTags('Wallet')
@ApiBearerAuth()
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
@Controller('users/:accountId/wallets')
export class UserWalletsController extends BaseController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
  ) {
    super();
  }

  @RequirePermissions('wallets.deposit')
  @Post(':walletId/deposit')
  async deposit(
    @Param('accountId') accountId: string,
    @Param('walletId') walletId: string,
    @Body() data: UpdateBalanceRequestDto,
  ) {
    const wallet = await this.walletsService.getById(BigInt(walletId));
    return await this.prisma.$transaction(
      async (tx) =>
        await this.walletsService.addBalance(
          Number(accountId),
          new Prisma.Decimal(data.amount).toDP(2),
          wallet.type,
          {
            tx,
            context: WalletTransactionContext.SystemDeposit,
            meta: { narration: data.narration, reference: data.refernce },
          },
        ),
    );
  }

  @RequirePermissions('wallets.withdraw')
  @Post(':walletId/withdraw')
  async withdraw(
    @Param('accountId') accountId: string,
    @Param('walletId') walletId: string,
    @Body() data: UpdateBalanceRequestDto,
  ) {
    const wallet = await this.walletsService.getById(BigInt(walletId));
    return await this.prisma.$transaction(
      async (tx) =>
        await this.walletsService.subtractBalance(
          Number(accountId),
          new Prisma.Decimal(data.amount).toDP(2),
          wallet.type,
          {
            tx,
            context: WalletTransactionContext.SystemWithdrawal,
            meta: { narration: data.narration, reference: data.refernce },
          },
        ),
    );
  }
}
