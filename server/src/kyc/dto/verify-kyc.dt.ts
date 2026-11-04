import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { KycStatus } from '../../generated/prisma/enums';

export class VerifyKycDto {
  @ApiProperty({ enum: KycStatus })
  @IsNotEmpty()
  @IsEnum(KycStatus)
  action: KycStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
