import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  razorpay_order_id: string;

  @ApiProperty()
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty()
  @IsString()
  razorpay_signature: string;

  @ApiProperty()
  @IsNumber()
  purchase_payment_id: number;
}
