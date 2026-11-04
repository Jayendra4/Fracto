import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SuggestionStatus } from '../../generated/prisma/enums';

export class ReviewVendorSuggestionDto {
  @ApiPropertyOptional({ enum: SuggestionStatus })
  @IsEnum(SuggestionStatus)
  @IsOptional()
  status: SuggestionStatus;
}
