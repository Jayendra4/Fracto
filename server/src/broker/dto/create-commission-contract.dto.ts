import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCommissionContractDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  assetId: number;

  @ApiProperty({
    example: 3.25,
    description: 'Commission percentage (0.1 – 10)',
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  @Max(10)
  proposedCommissionPct: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brokerNote?: string;
}
