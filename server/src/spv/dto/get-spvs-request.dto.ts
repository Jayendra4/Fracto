import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';

export class GetSpvsRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({
    description: 'Filter to SPVs the given account has joined',
  })
  @IsOptional()
  @IsInt()
  accountId?: number;
}
