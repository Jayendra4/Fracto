import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateImmediateSellMarketplaceRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  units: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
