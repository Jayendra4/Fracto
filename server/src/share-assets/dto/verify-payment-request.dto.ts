import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class VerifyPaymentRequestDto {
  @ApiProperty()
  @IsString()
  razorpay_order_id: string;

  @ApiProperty()
  @IsString()
  razorpay_signature: string;

  @ApiProperty()
  @IsNumber()
  interest_id: number;
}
