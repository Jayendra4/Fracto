import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class FractionalizeAssetDto {
  @ApiProperty({
    example: 1000,
    description: 'Total number of fractions',
  })
  @IsNumber()
  @Min(1)
  totalFractions: number;

  @ApiProperty({
    example: 1000,
    description: 'Initial price per fraction',
  })
  @IsNumber()
  @Min(1)
  pricePerFraction: number;
}
