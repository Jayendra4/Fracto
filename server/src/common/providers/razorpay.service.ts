import Razorpay from 'razorpay';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { razorpayConfigFactory } from '@Config';
import { ConfigType } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class RazorpayService {
  readonly client: Razorpay;
  private readonly razorpayXClient: AxiosInstance;

  constructor(
    @Inject(razorpayConfigFactory.KEY)
    private readonly razorpayConfig: ConfigType<typeof razorpayConfigFactory>,
  ) {
    const keyId = this.razorpayConfig.key_id || 'rzp_test_placeholder';
    const keySecret = this.razorpayConfig.key_secret || 'dummy_secret';

    // Razorpay Payment Client
    this.client = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // RazorpayX Axios Client
    this.razorpayXClient = axios.create({
      baseURL:
        this.razorpayConfig.razorpay_base_url || 'https://api.razorpay.com/v1',
      timeout: 10000,
      auth: {
        username: this.razorpayConfig.key_id!,
        password: this.razorpayConfig.key_secret!,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', this.razorpayConfig.webhook_secret!)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const body = `${orderId}|${paymentId}`;

    const expected = crypto
      .createHmac('sha256', this.razorpayConfig.key_secret!)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  }

  private handleError(error: any): never {
    const message =
      error?.response?.data?.error?.description ||
      error?.response?.data ||
      error.message ||
      'RazorpayX request failed';

    console.error('RazorpayX Error:', message);

    throw new InternalServerErrorException(message);
  }

  async createContact(data: {
    name: string;
    email: string;
    phone: string;
    type: string;
  }) {
    try {
      const response = await this.razorpayXClient.post('/contacts', {
        name: data.name,
        email: data.email,
        contact: data.phone,
        type: 'customer',
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createBankFundAccount(data: {
    contactId: string;
    accountHolderName: string;
    ifscCode: string;
    accountNumber: string;
  }) {
    try {
      if (
        !data.contactId ||
        !data.accountHolderName ||
        !data.ifscCode ||
        !data.accountNumber
      ) {
        throw new Error('Missing required bank account fields');
      }

      const response = await this.razorpayXClient.post('/fund_accounts', {
        contact_id: data.contactId,
        account_type: 'bank_account',
        bank_account: {
          name: data.accountHolderName.trim(),
          ifsc: data.ifscCode.trim().toUpperCase(),
          account_number: data.accountNumber.trim(),
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUpiFundAccount(data: { contactId: string; vpa: string }) {
    try {
      if (!data.contactId || !data.vpa) {
        throw new Error('Missing required UPI fields');
      }

      const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

      if (!vpaRegex.test(data.vpa)) {
        throw new Error('Invalid UPI ID format');
      }

      const response = await this.razorpayXClient.post('/fund_accounts', {
        contact_id: data.contactId,
        account_type: 'vpa',
        vpa: {
          address: data.vpa.trim().toLowerCase(),
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createPayout(data: {
    fundAccountId: string;
    amount: number; // INR
    referenceId: string;
    idempotencyKey?: string;
  }) {
    try {
      const response = await this.razorpayXClient.post(
        '/payouts',
        {
          account_number: this.razorpayConfig.razorpayx_account_number,
          fund_account_id: data.fundAccountId,
          amount: Math.round(data.amount * 100), // Safe conversion
          currency: 'INR',
          mode: 'IMPS',
          purpose: 'payout',
          reference_id: data.referenceId,
        },
        {
          headers: data.idempotencyKey
            ? { 'Idempotency-Key': data.idempotencyKey }
            : undefined,
        },
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
