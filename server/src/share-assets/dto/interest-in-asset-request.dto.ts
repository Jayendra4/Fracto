import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import {
  PaymentMethodType,
  PaymentRequestType,
} from '../../generated/prisma/enums';

export class CreateInterestRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sharedAssetId: number;

  @ApiPropertyOptional({ enum: PaymentMethodType })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  status: PaymentMethodType;

  @ApiPropertyOptional({ enum: PaymentRequestType })
  @IsOptional()
  @IsEnum(PaymentRequestType)
  requestType: PaymentRequestType;
}
