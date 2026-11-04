import { RazorpayService } from '@Common';
import {
  Controller,
  Headers,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('payment-request/webhook')
export class RazorpayWebhookController {
  constructor(
    private readonly razorpayService: RazorpayService,
    private readonly webhookService: RazorpayWebhookService,
  ) {}

  @Post('razorpay')
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: any,
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing Razorpay signature');
    }
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('Missing raw body');
    }
    const isValid = this.razorpayService.verifyWebhookSignature(
      rawBody,
      signature,
    );
    console.log('data isvalid', isValid);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Razorpay webhook signature');
    }

    try {
      const parsedBody = JSON.parse(rawBody.toString());
      // console.log('data parsebody', parsedBody);
      await this.webhookService.process(parsedBody);
    } catch (err) {
      console.error('Webhook processing failed:', err);
      return { received: false };
    }
    return { received: true };
  }
}
