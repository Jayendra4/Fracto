import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';
import {
  CategoryRequestStatus,
  CategoryStatus,
} from '../../generated/prisma/enums';

export class GetCategoryRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  categoryStatus?: CategoryStatus;

  @ApiPropertyOptional({ enum: CategoryRequestStatus })
  @IsOptional()
  @IsEnum(CategoryRequestStatus)
  approvedStatus?: CategoryRequestStatus;
}
