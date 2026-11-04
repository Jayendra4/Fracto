import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.services';
import { MarketplaceController } from './marketplace.controller';
import { PrismaModule } from '../prisma';
import { AccountsModule } from '../accounts';
import { WalletsModule } from '../wallets';
import { MatchEngineModule } from '../match-engine';
import { NotificationModule } from '../notification';
import { MarketStatResetProcessor } from './proccessor/daily-reset-scheduling';

@Module({
  imports: [
    PrismaModule,
    AccountsModule,
    WalletsModule,
    MatchEngineModule,
    NotificationModule,
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, MarketStatResetProcessor],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
