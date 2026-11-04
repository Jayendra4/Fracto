import { registerAs } from '@nestjs/config';

export const marketplaceOrdersMatchedQueueConfigFactory = registerAs(
  'marketplaceOrdersMatchedQueue',
  () => ({
    concurrency: 1,

    options: {
      attempts: 3,

      removeOnComplete: 100,

      removeOnFail: 100,

      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  }),
);
