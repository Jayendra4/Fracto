import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';

export enum PortfolioSortBy {
  PROFIT = 'profit',
  VALUE = 'value',
  FRACTIONS = 'fractions',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class MyAssetPortfolioQueryDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({
    enum: PortfolioSortBy,
    description: 'Sort portfolio by',
    example: PortfolioSortBy.PROFIT,
  })
  @IsOptional()
  @IsEnum(PortfolioSortBy)
  sortBy?: PortfolioSortBy;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Sort order (asc / desc)',
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}
