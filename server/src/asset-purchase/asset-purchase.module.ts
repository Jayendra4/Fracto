import { Module } from '@nestjs/common';
import { AssetPurchaseService } from './asset-purchase.service';
import { AssetPurchaseController } from './asset-purchase.controller';
import { PrismaModule } from '../prisma';
import { WalletsModule } from '../wallets';
import { NotificationModule } from '../notification';
import { CouponModule } from '../coupon';
import { ActivityModule } from '../activity';
import { AssetModule } from '../asset/asset.module';

@Module({
  imports: [
    PrismaModule,
    WalletsModule,
    NotificationModule,
    CouponModule,
    ActivityModule,
    AssetModule,
  ],
  controllers: [AssetPurchaseController],
  providers: [AssetPurchaseService],
})
export class AssetPurchaseModule {}
