import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ReferralApprovalStatus } from '../../generated/prisma/enums';

export class GetOwnerApprovalAssetsDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: ReferralApprovalStatus })
  @IsOptional()
  @IsEnum(ReferralApprovalStatus)
  ownerStatus?: ReferralApprovalStatus;
}
