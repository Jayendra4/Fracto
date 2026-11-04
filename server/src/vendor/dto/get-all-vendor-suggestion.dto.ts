import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SuggestionStatus, VendorCategory } from '../../generated/prisma/enums';

export class GetAllVendorSuggestionRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: VendorCategory })
  @IsEnum(VendorCategory)
  @IsOptional()
  category?: VendorCategory;

  @ApiPropertyOptional({ enum: SuggestionStatus })
  @IsEnum(SuggestionStatus)
  @IsOptional()
  status?: SuggestionStatus;
}
