// dto/update-company-meta.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { SourceOfFunds } from '../../generated/prisma/client';

export class UpdateCompanyMetaDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industryType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  natureOfBusiness?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  businessDescription?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  expectedMonthlyTransactionVolume?: number;

  @ApiPropertyOptional({ enum: SourceOfFunds })
  @IsEnum(SourceOfFunds)
  @IsOptional()
  expectedSourceOfFunds?: SourceOfFunds;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  countriesOfOperation?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCompanyPubliclyListed?: boolean;
}
