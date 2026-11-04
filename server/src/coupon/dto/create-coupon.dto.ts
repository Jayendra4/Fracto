import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  ValidateIf,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { DiscountType } from '../../generated/prisma/enums';

export class CreateCouponDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateIf((o) => o.discountType !== DiscountType.FractionBonus)
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.discountType === DiscountType.FractionBonus)
  @IsNumber()
  @Min(1)
  bonusFractions?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  maxDiscountAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  minPurchaseAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  totalUsageLimit: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  perUserLimit: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'validFrom must start with YYYY-MM-DD',
  })
  validFrom: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'validTill must start with YYYY-MM-DD',
  })
  validTill: string;
}
