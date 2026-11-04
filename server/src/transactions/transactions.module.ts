import { Module } from '@nestjs/common';
import {
  TransactionsController,
  MeTransactionsController,
} from './controllers';
import { TransactionsService } from './transactions.service';
import { PrismaModule } from '../prisma';
import { WalletTransactionsModule } from '../wallet-transactions';

@Module({
  imports: [PrismaModule, WalletTransactionsModule],
  controllers: [MeTransactionsController, TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
