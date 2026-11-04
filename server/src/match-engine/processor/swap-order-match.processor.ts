import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Processor } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseProcessor } from '@Common';
import { marketplaceOrdersMatchQueueConfigFactory } from '@Config';
import { MARKETPLACE_ORDERS_MATCH_QUEUE } from '../match-engine.constants';
import { MarketplaceOrdersMatchQueuePayload } from '../match-engine.service';

@Processor(MARKETPLACE_ORDERS_MATCH_QUEUE)
export class MarketplaceOrdersMatchProcessor extends BaseProcessor {
  constructor(
    @Inject(marketplaceOrdersMatchQueueConfigFactory.KEY)
    readonly config: ConfigType<
      typeof marketplaceOrdersMatchQueueConfigFactory
    >,

    private readonly eventEmitter: EventEmitter2,
  ) {
    super(config.concurrency);
  }

  async process(job: Job<MarketplaceOrdersMatchQueuePayload>): Promise<void> {
    const { orderId, assetId } = job.data;

    /**
     * FIND MATCH EVENT
     */
    this.eventEmitter.emit('marketplace.order.find-match', {
      orderId,
      assetId,
    });
  }
}
