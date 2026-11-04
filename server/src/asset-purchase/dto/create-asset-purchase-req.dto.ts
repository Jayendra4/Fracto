import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateAssetPurchaseDto {
  @ApiProperty({
    example: 12,
    description: 'Asset ID',
  })
  @IsInt()
  @IsNotEmpty()
  assetId: number;

  @ApiProperty({
    example: 5,
    description: 'Number of fractions to purchase',
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  @Max(100)
  fractions: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;
}
