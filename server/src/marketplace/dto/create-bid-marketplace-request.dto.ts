import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateBidMarketplaceRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  bidPricePerUnit: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  units: number;
}
