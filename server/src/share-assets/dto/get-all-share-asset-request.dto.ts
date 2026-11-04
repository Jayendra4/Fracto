import { SearchablePaginatedDto } from '@Common';
import { SharedAssetStatus } from '../../generated/prisma/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetShareAssetRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: SharedAssetStatus })
  @IsOptional()
  @IsEnum(SharedAssetStatus)
  AssetStatus?: SharedAssetStatus;

  @ApiPropertyOptional({ type: Number, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  memberTake?: number = 10;

  @ApiPropertyOptional({ type: Number, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  memberSkip?: number = 0;
}
