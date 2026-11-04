import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { reviewStatus } from './update-review-status.dto';

export class GetAllCommissionPayoutRequest extends SearchablePaginatedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  brokerId?: number;

  @ApiPropertyOptional({ enum: reviewStatus })
  @IsOptional()
  @IsEnum(reviewStatus)
  status?: reviewStatus;
}
