import { registerAs } from '@nestjs/config';

export const razorpayConfigFactory = registerAs('razorpay', () => ({
  key_id: process.env.TEST_API_KEY,
  key_secret: process.env.TEST_KE_SECRET,
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
  razorpayx_account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
  razorpay_base_url: process.env.RAZORPAY_BASE_URL,
}));
