import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt } from 'class-validator';

export class SaveAssetDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  assetId: number;

  @ApiProperty({
    example: true,
    description: 'true = favourite, false = unfavourite',
  })
  @IsBoolean()
  isFavourite: boolean;
}
