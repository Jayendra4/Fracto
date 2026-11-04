import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { PrismaModule } from '../prisma';
import { OtpModule } from '../otp';
import { WalletsModule } from '../wallets';
import { NotificationModule } from '../notification';
import { BankAccountModule } from '../bank-account/bank-account.module';
import { UpiAccountModule } from '../upi-account/upi-account.module';
import { ActivityModule } from '../activity';

@Module({
  imports: [
    PrismaModule,
    OtpModule,
    WalletsModule,
    NotificationModule,
    BankAccountModule,
    UpiAccountModule,
    ActivityModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
