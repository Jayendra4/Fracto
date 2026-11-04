import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateAssetPriceDto {
  @ApiProperty({
    example: 1250,
    description: 'Current price per fraction',
  })
  @IsNumber()
  @Min(1)
  currentPricePerFraction: number;
}
