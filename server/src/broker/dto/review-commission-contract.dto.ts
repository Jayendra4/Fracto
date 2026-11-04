import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReferralApprovalStatus } from '../../generated/prisma/enums';

export class ApproveCommissionContractDto {
  @ApiProperty({ enum: ReferralApprovalStatus })
  @IsNotEmpty()
  @IsEnum(ReferralApprovalStatus)
  status: ReferralApprovalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetOwnerNote?: string;
}
