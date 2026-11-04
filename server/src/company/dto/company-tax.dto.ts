// dto/update-company-tax.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCompanyTaxDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  panNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gstNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tanNumber?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsString()
  @IsOptional()
  tradeLicenseExpiryDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  placeOfBusinessProofType?: string;
}
