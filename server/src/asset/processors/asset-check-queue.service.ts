// import { Queue } from 'bullmq';
// import {
//   Inject,
//   Injectable,
//   Logger,
//   OnApplicationBootstrap,
// } from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bullmq';
// import { ConfigType } from '@nestjs/config';
// import { assetCheckQueueConfigFactory } from '@Config';
// import {
//   ASSET_CHECK_INTERVAL_MS,
//   ASSET_CHECK_JOB,
//   ASSET_CHECK_QUEUE,
// } from './asset-check.constants';

// @Injectable()
// export class AssetCheckQueueService implements OnApplicationBootstrap {
//   private readonly logger = new Logger(AssetCheckQueueService.name);

//   constructor(
//     @Inject(assetCheckQueueConfigFactory.KEY)
//     private readonly config: ConfigType<typeof assetCheckQueueConfigFactory>,
//     @InjectQueue(ASSET_CHECK_QUEUE)
//     private readonly queue: Queue,
//   ) {}

//   async onApplicationBootstrap() {
//     // upsertJobScheduler is idempotent — safe to call on every restart
//     await this.queue.upsertJobScheduler(
//       ASSET_CHECK_JOB,
//       { every: ASSET_CHECK_INTERVAL_MS },
//       {
//         name: ASSET_CHECK_JOB,
//         opts: this.config.options,
//       },
//     );

//     this.logger.log(
//       `Asset check job scheduled every ${ASSET_CHECK_INTERVAL_MS / 1000}s`,
//     );
//   }
// }
