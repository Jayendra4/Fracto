import { Redis } from 'ioredis';
import { Module } from '@nestjs/common';
import { MarketplaceMatchEngineService } from './match-engine.service';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@Common';
import {
  MarketplaceOrdersMatchedProcessor,
  MarketplaceOrdersMatchProcessor,
} from './processor';
import {
  MARKETPLACE_ORDERS_MATCH_QUEUE,
  MARKETPLACE_ORDERS_MATCHED_QUEUE,
} from './match-engine.constants';
import { ExecuteTradeListener } from './marketplace.execute-trade';
import { MarketplaceMatchHandler } from './marketplace-match.handler';
import { PrismaModule } from '../prisma';
import { WalletsModule } from '../wallets';
import { NotificationModule } from '../notification';

const bullQueueFactory = (name: string) =>
  BullModule.registerQueueAsync({
    name,
    useFactory: (configService: ConfigService<EnvironmentVariables, true>) => ({
      connection: new Redis(configService.get('REDIS_URI'), {
        maxRetriesPerRequest: null,
      }),
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: { age: 86400 },
      },
    }),
    inject: [ConfigService],
  });

@Module({
  imports: [
    bullQueueFactory(MARKETPLACE_ORDERS_MATCH_QUEUE),
    bullQueueFactory(MARKETPLACE_ORDERS_MATCHED_QUEUE),
    EventEmitterModule,
    PrismaModule,
    WalletsModule,
    NotificationModule,
  ],
  providers: [
    MarketplaceMatchEngineService,
    MarketplaceOrdersMatchProcessor,
    MarketplaceOrdersMatchedProcessor,
    MarketplaceMatchHandler, // ✅ add
    ExecuteTradeListener, // ✅ add
  ],
  exports: [MarketplaceMatchEngineService],
})
export class MatchEngineModule {}
