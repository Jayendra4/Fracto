import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ReferralApprovalStatus } from '../../generated/prisma/enums';

export class UpdateRwaStatusDto {
  @ApiProperty({})
  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @ApiProperty({})
  @IsNotEmpty()
  @IsEnum(ReferralApprovalStatus)
  status: ReferralApprovalStatus;
}
