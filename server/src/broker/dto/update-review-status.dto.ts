import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum reviewStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
  Pending = 'Pending',
}

export class ReviewStatusDto {
  @ApiPropertyOptional({ enum: reviewStatus })
  @IsOptional()
  @IsEnum(reviewStatus)
  status: reviewStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
