import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ListingStatus, ListingType } from '../../generated/prisma/enums';

export class GetMarketplaceRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: ListingType })
  @IsOptional()
  @IsEnum(ListingType)
  type?: ListingType;

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  listingStatus?: ListingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  assetId?: number;
}
