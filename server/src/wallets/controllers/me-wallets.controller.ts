import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
} from '@Common';
import { WalletsService } from '../wallets.service';
import { WalletType } from '../../generated/prisma/enums';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('users/me/wallets')
export class MeWalletsController extends BaseController {
  constructor(private readonly walletsService: WalletsService) {
    super();
  }

  @Get()
  async getMyWallet(@Req() req: AuthenticatedRequest) {
    const ctx = this.getContext(req);
    return this.walletsService.getWalletByAccountId(
      ctx.user.id,
      WalletType.Main,
    );
  }

  // @Get()
  // async getAll(@Req() req: AuthenticatedRequest) {
  //   const ctx = this.getContext(req);
  //   const wallets = await this.walletsService.getAllByaccountId(
  //     Number(ctx.user.id),
  //   );
  //   return wallets.map((wallet) => ({
  //     ...wallet,
  //     amount: wallet.amount,
  //   }));
  // }
}
