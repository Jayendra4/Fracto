import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssetStatus } from '../../generated/prisma/enums';
export class AdminAssetReviewDto {
  @ApiProperty({ enum: AssetStatus })
  @IsNotEmpty()
  @IsEnum(AssetStatus)
  status: AssetStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
