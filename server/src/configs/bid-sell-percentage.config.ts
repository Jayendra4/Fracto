import { registerAs } from '@nestjs/config';

export const bidSellConfigFactory = registerAs('bid', () => ({
  bidSell: process.env.MARKETPLACE_FEE_PERCENT || 15,
}));
