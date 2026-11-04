import { SearchablePaginatedDto } from '@Common';
import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  IsString,
  Matches,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  AdminFractionalizationStatus,
  AssetStatus,
  AssetType,
  RWAStatus,
} from '../../generated/prisma/enums';
import { AssetSubType } from 'prisma/seeds';

export class GetAllAssetRequestDto extends SearchablePaginatedDto {
  // trustee
  @ApiPropertyOptional({ enum: RWAStatus })
  @IsOptional()
  @IsEnum(RWAStatus)
  rwaStatus?: RWAStatus;

  @ApiPropertyOptional({ enum: AdminFractionalizationStatus })
  @IsOptional()
  @IsEnum(AdminFractionalizationStatus)
  fractionalizationStatus?: AdminFractionalizationStatus;

  @ApiPropertyOptional({ enum: AssetStatus })
  @IsOptional()
  @IsEnum(AssetStatus)
  assetStatus?: AssetStatus;

  @ApiPropertyOptional({ enum: AssetSubType })
  @IsOptional()
  @IsEnum(AssetSubType)
  assetSubType?: AssetSubType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  updateAsset?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  steps?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  newlyAdded?: boolean;

  @ApiPropertyOptional({ enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'fromDate must start with YYYY-MM-DD',
  })
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter to date (YYYY-MM-DD)',
    example: '2025-06-30',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'toDate must start with YYYY-MM-DD',
  })
  toDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  groupId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  trusteeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  accountId?: number;
}
