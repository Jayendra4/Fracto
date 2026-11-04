import { registerAs } from '@nestjs/config';

export const BrokerCommissionConfigFactory = registerAs(
  'brokerCommission',
  () => ({
    commissionPct: Number(process.env.COMMISSIONPCT) ?? 1.2,
  }),
);
