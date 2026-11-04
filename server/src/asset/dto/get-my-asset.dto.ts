import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
  AssetStatus,
  ReferralApprovalStatus,
  RWAStatus,
} from '../../generated/prisma/enums';

export class GetMyAssetDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: AssetStatus })
  @IsEnum(AssetStatus)
  @IsOptional()
  assetStatus?: AssetStatus;

  @ApiPropertyOptional({ enum: RWAStatus })
  @IsEnum(RWAStatus)
  @IsOptional()
  rwaStatus?: RWAStatus;

  @ApiPropertyOptional({ enum: ReferralApprovalStatus })
  @IsEnum(ReferralApprovalStatus)
  @IsOptional()
  assetOwnerStatus?: ReferralApprovalStatus;
}
