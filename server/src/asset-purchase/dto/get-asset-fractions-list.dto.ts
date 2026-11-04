import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchablePaginatedDto } from '@Common';

export class FractionFilterDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assetId?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  accountId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  fromDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  toDate?: Date;
}
