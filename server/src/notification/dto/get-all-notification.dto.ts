import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class GetNotificationRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({
    description: 'Filter from date (YYYY-MM-DD)',
    example: '2025-06-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'fromDate must start with YYYY-MM-DD',
  })
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter to date (YYYY-MM-DD)',
    example: '2025-06-30',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'toDate must start with YYYY-MM-DD',
  })
  toDate?: string;
}
