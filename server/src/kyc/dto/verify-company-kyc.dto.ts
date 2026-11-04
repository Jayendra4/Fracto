import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { KycStatus } from '../../generated/prisma/enums';

export class VerifyCompanyKycDto {
  @ApiProperty({ enum: KycStatus })
  @IsEnum([KycStatus.Approved, KycStatus.Rejected])
  @IsNotEmpty()
  status: KycStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
