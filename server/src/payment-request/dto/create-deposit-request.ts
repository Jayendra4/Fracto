import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethodType } from '../../generated/prisma/enums';

export class CreateDepositPaymentRequestDto {
  @ApiProperty({
    description: 'Deposit amount in INR',
    example: 5000,
    minimum: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  methodType: PaymentMethodType;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsNumber()
  bankAccountId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  upiAccountId?: number;
}
