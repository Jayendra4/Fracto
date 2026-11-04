import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ListingType, TradeType } from '../../generated/prisma/enums';

export class GetMarketplaceImmediateRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: TradeType })
  @IsOptional()
  @IsEnum(TradeType)
  tradeType?: TradeType;

  @ApiPropertyOptional({ enum: ListingType })
  @IsOptional()
  @IsEnum(ListingType)
  type?: ListingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  assetId?: number;

  @ApiPropertyOptional({
    description: 'Filter to date (YYYY-MM-DD)',
    example: '2025-06-30',
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
