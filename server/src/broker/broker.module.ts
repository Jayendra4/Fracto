import { Module } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { BrokerController } from './broker.controller';
import { PrismaModule } from '../prisma';
import { MailModule } from '../mail';
import { ActivityModule } from '../activity';
import { CommissionPayoutProcessor } from './commission-processor';
import { WalletsModule } from '../wallets';
import { KycModule } from '../kyc';
import { AccountsModule } from '../accounts';
import { NotificationModule } from '../notification';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    ActivityModule,
    WalletsModule,
    KycModule,
    AccountsModule,
    NotificationModule,
  ],
  controllers: [BrokerController],
  providers: [BrokerService, CommissionPayoutProcessor],
  exports: [BrokerService],
})
export class BrokerModule {}
