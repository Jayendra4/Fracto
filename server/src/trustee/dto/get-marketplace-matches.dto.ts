import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginatedDto } from '@Common';
import { MatchApprovalStatus } from '../../generated/prisma/enums';

export class GetMarketplaceMatchesDto extends PaginatedDto {
  @ApiPropertyOptional({ enum: MatchApprovalStatus })
  @IsOptional()
  @IsEnum(MatchApprovalStatus)
  status?: MatchApprovalStatus;
}
