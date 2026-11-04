// dto/create-payment-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  PaymentMethodType,
  PaymentRequestType,
} from '../../generated/prisma/client';

export class CreatePaymentRequestDto {
  @ApiProperty({ enum: PaymentRequestType })
  @IsEnum(PaymentRequestType)
  requestType: PaymentRequestType;

  @ApiProperty({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  methodType: PaymentMethodType;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  bankAccountId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  upiAccountId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  utrNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  screenshot?: string;
}
