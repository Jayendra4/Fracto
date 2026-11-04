import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SharedAssetStatus } from '../../generated/prisma/enums';

export class CreateReviewAssetRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sharedAssetId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rejectNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: SharedAssetStatus })
  @IsOptional()
  @IsEnum(SharedAssetStatus)
  status: SharedAssetStatus;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tokenAmount?: number;
}
