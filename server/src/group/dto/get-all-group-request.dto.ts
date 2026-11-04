import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';
import {
  AssetStatus,
  GroupStatus,
  RWAStatus,
  SharedAssetStatus,
} from '../../generated/prisma/enums';

export class GetGroupRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: GroupStatus })
  @IsOptional()
  @IsEnum(GroupStatus)
  groupStatus?: GroupStatus;

  @ApiPropertyOptional({ enum: SharedAssetStatus })
  @IsOptional()
  @IsEnum(SharedAssetStatus)
  status?: SharedAssetStatus;

  @ApiPropertyOptional({ enum: AssetStatus })
  @IsOptional()
  @IsEnum(AssetStatus)
  AssetStatus?: AssetStatus;

  @ApiPropertyOptional({ enum: RWAStatus })
  @IsOptional()
  @IsEnum(RWAStatus)
  RwaStatus?: RWAStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  accountId?: number;
}
