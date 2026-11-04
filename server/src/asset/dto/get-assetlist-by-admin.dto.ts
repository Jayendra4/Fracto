import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SearchablePaginatedDto } from '@Common';

export class GetAssetListByAdminDto extends SearchablePaginatedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  accountId?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  newlyAdded?: boolean;
}
