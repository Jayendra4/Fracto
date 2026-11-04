import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-asset.dto';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PriceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPricePerFraction: string;
}

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @ApiPropertyOptional({ type: PriceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceDto)
  price?: PriceDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusForLegal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusForValuation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusForDueDiligence?: string;
}
