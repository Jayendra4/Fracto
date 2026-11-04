import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Processor } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseProcessor } from '@Common';
import { marketplaceOrdersMatchedQueueConfigFactory } from '@Config';
import { MARKETPLACE_ORDERS_MATCHED_QUEUE } from '../match-engine.constants';
import { MarketplaceOrdersMatchedQueuePayload } from '../match-engine.service';

@Processor(MARKETPLACE_ORDERS_MATCHED_QUEUE)
export class MarketplaceOrdersMatchedProcessor extends BaseProcessor {
  constructor(
    @Inject(marketplaceOrdersMatchedQueueConfigFactory.KEY)
    readonly config: ConfigType<
      typeof marketplaceOrdersMatchedQueueConfigFactory
    >,

    private readonly eventEmitter: EventEmitter2,
  ) {
    super(config.concurrency);
  }

  async process(job: Job<MarketplaceOrdersMatchedQueuePayload>): Promise<void> {
    /**
     * EXECUTE TRADE EVENT
     */
    this.eventEmitter.emit('marketplace.order.execute-trade', job.data);
  }
}
