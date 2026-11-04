import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';

export class GetVoteRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  secondaryClubId?: number;
}
