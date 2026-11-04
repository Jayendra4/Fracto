import { Module } from '@nestjs/common';
import { UpiAccountService } from './upi-account.service';
import { UpiAccountController } from './upi-account.controller';
import { PrismaModule } from '../prisma';
import { BankAccountModule } from '../bank-account/bank-account.module';

@Module({
  imports: [PrismaModule, BankAccountModule],
  controllers: [UpiAccountController],
  providers: [UpiAccountService],
  exports: [UpiAccountService],
})
export class UpiAccountModule {}
