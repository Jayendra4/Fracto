import { Module } from '@nestjs/common';
import { AssetsService } from './asset.service';
import { AssetsController } from './asset.controller';
import { PrismaModule } from '../prisma';
import { AssetFinancialCalculator } from './asset-financial';
import { NotificationModule } from '../notification';
import { BrokerModule } from '../broker';
import { ActivityModule } from '../activity';
// import { QueueModule } from '../queue';
// import { assetCheckQueueConfigFactory } from '@Config';
// import { CheckAssetCompleteProcessor } from './processors/check-asset-complete-processor';
// import { AssetCheckQueueService } from './processors/asset-check-queue.service';
// import { ASSET_CHECK_QUEUE } from './processors/asset-check.constants';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    BrokerModule,
    ActivityModule,
    // ConfigModule.forFeature(assetCheckQueueConfigFactory),
    // QueueModule.registerAsync(ASSET_CHECK_QUEUE),
  ],
  controllers: [AssetsController],
  providers: [
    AssetsService,
    AssetFinancialCalculator,
    // CheckAssetCompleteProcessor,
    // AssetCheckQueueService,
  ],
  exports: [AssetsService, AssetFinancialCalculator],
})
export class AssetModule {}
// export class AssetModule implements OnApplicationShutdown {
//   constructor(
//     @InjectQueue(ASSET_CHECK_QUEUE)
//     private readonly assetCheckQueue: Queue,
//   ) {}

//   async onApplicationShutdown() {
//     await this.assetCheckQueue.disconnect();
//   }
// }
