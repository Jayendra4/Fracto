import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateMarketplaceRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  pricePerUnit: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  totalUnits: number;
}
