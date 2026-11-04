import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class ShareAssetInGroupRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sharedAssetId: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  groupIds: number[];
}
