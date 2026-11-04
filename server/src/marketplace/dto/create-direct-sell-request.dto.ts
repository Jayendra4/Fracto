import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateDirectSellRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  listingId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  units: number;
}
