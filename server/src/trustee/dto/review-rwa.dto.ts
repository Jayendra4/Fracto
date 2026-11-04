import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RWAStatus } from '../../generated/prisma/enums';
export class ReviewRwaDto {
  @ApiProperty({ enum: RWAStatus })
  @IsNotEmpty()
  @IsEnum(RWAStatus)
  status: RWAStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trusteeComment?: string;
}
