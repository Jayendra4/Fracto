import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  marketplaceOrdersMatchQueueConfigFactory,
  marketplaceOrdersMatchedQueueConfigFactory,
} from '@Config';
import {
  MARKETPLACE_ORDERS_MATCH_QUEUE,
  MARKETPLACE_ORDERS_MATCHED_QUEUE,
} from './match-engine.constants';
import { Decimal } from '@prisma/client/runtime/library';

export type MarketplaceOrdersMatchQueuePayload = {
  orderId: string;
  assetId: string;
};

export type MarketplaceOrdersMatchedQueuePayload = {
  potentialMatchId: number;
  askOrderId: number;
  bidOrderId: number;
  assetId: number;
  matchedQuantity: number;
  tradePrice: Decimal;
};

@Injectable()
export class MarketplaceMatchEngineService {
  private readonly logger = new Logger(MarketplaceMatchEngineService.name);

  constructor(
    @Inject(marketplaceOrdersMatchQueueConfigFactory.KEY)
    private readonly marketplaceOrdersMatchQueueConfig: ConfigType<
      typeof marketplaceOrdersMatchQueueConfigFactory
    >,

    @Inject(marketplaceOrdersMatchedQueueConfigFactory.KEY)
    private readonly marketplaceOrdersMatchedQueueConfig: ConfigType<
      typeof marketplaceOrdersMatchedQueueConfigFactory
    >,

    @InjectQueue(MARKETPLACE_ORDERS_MATCH_QUEUE)
    private readonly marketplaceOrdersMatchQueue: Queue<
      MarketplaceOrdersMatchQueuePayload,
      void
    >,

    @InjectQueue(MARKETPLACE_ORDERS_MATCHED_QUEUE)
    private readonly marketplaceOrdersMatchedQueue: Queue<
      MarketplaceOrdersMatchedQueuePayload,
      void
    >,
  ) {}

  /**
   * ADD ORDER TO MATCH QUEUE
   */
  async addOrderToMatchQueue(data: { orderId: string; assetId: string }) {
    this.logger.log(`Adding order to match queue: ${data.orderId}`);

    await this.marketplaceOrdersMatchQueue.add(
      'match-marketplace-order',
      {
        orderId: data.orderId,
        assetId: data.assetId,
      },
      this.marketplaceOrdersMatchQueueConfig.options,
    );
  }

  /**
   * ADD MATCHED ORDERS TO EXECUTION QUEUE
   */
  async addMatchedOrderToQueue(data: MarketplaceOrdersMatchedQueuePayload) {
    this.logger.log(`
      MATCH FOUND
      ASK: ${data.askOrderId}
      BID: ${data.bidOrderId}
    `);

    await this.marketplaceOrdersMatchedQueue.add(
      'execute-marketplace-trade',
      {
        potentialMatchId: data.potentialMatchId,
        askOrderId: data.askOrderId,
        bidOrderId: data.bidOrderId,
        assetId: data.assetId,
        matchedQuantity: data.matchedQuantity,
        tradePrice: data.tradePrice,
      },
      this.marketplaceOrdersMatchedQueueConfig.options,
    );
  }
}
