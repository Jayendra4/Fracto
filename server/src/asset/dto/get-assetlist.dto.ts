import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class GetAssetListDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ example: 'subtype', description: 'sub type of asset' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  subType: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  soldout: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  newlyAdded: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  available: boolean;
}
