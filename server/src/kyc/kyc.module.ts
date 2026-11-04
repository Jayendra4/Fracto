import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { PrismaModule } from '../prisma';
import { AccountsModule } from '../accounts';
import { ActivityModule } from '../activity';
import { NotificationModule } from '../notification';

@Module({
  imports: [PrismaModule, AccountsModule, ActivityModule, NotificationModule],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
