import { Module } from '@nestjs/common';
import { TrusteeService } from './trustee.service';
import { TrusteeDashboardService } from './trustee-dashboard.service';
import { TrusteeSecondarySettlementService } from './trustee-secondary-settlement.service';
import { TrusteeMarketplaceMatchService } from './trustee-marketplace-match.service';
import { TrusteeController } from './trustee.controller';
import { PrismaModule } from '../prisma';
import { AccountsModule } from '../accounts';
import { ActivityModule } from '../activity';
import { NotificationModule } from '../notification';
import { WalletsModule } from '../wallets';
import { MatchEngineModule } from '../match-engine';

@Module({
  imports: [
    PrismaModule,
    AccountsModule,
    ActivityModule,
    NotificationModule,
    WalletsModule,
    MatchEngineModule,
  ],
  controllers: [TrusteeController],
  providers: [
    TrusteeService,
    TrusteeDashboardService,
    TrusteeSecondarySettlementService,
    TrusteeMarketplaceMatchService,
  ],
})
export class TrusteeModule {}
