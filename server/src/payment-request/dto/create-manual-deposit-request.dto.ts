import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethodType } from '../../generated/prisma/enums';

export class CreateManualDepositRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  mobile: string;

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

  @ApiPropertyOptional({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  methodType?: PaymentMethodType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bankAccountId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  upiAccountId?: number;

  @ApiProperty({ description: 'UTR / payment reference id' })
  @IsNotEmpty()
  @IsString()
  utrNumber: string;

  @ApiProperty({ description: 'Uploaded payment screenshot URL/key' })
  @IsNotEmpty()
  @IsString()
  screenshot: string;
}
