import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ReferralApprovalStatus } from '../../generated/prisma/enums';

export class GetAllInviteAsset extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: ReferralApprovalStatus })
  @IsOptional()
  @IsEnum(ReferralApprovalStatus)
  assetOwnerStatus: ReferralApprovalStatus;

  @ApiPropertyOptional({ enum: ReferralApprovalStatus })
  @IsOptional()
  @IsEnum(ReferralApprovalStatus)
  adminStatus: ReferralApprovalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  brokerId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAssetOnBording?: boolean;
}
