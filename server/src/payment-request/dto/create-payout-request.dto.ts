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
import { PaymentMethodType, WalletType } from '../../generated/prisma/enums';

export class CreatePayoutRequestDto {
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

  @ApiPropertyOptional({ enum: WalletType })
  @IsEnum(WalletType)
  WalletType?: WalletType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fundAccountId?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsNumber()
  bankAccountId?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsNumber()
  upiAccountId?: number;
}
