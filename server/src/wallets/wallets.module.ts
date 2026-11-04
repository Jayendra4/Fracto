import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { MeWalletsController, UserWalletsController } from './controllers';
import { PrismaModule } from '../prisma';
import { WalletTransactionsModule } from '../wallet-transactions';

@Module({
  imports: [PrismaModule, WalletTransactionsModule],
  controllers: [MeWalletsController, UserWalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
