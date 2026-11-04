// dto/create-company-basic.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { EntityType } from '../../generated/prisma/client';

export class CreateCompanyBasicDto {
  @ApiProperty({
    description: 'Legal entity name of the company',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  legalEntityName: string;

  @ApiPropertyOptional({
    description: 'Trade name of the company (optional)',
    example: 'Acme Corp',
  })
  @IsString()
  @IsOptional()
  tradeName?: string;

  @ApiProperty({
    description: 'Type of the entity',
    enum: EntityType,
    example: EntityType.PvtLtd,
  })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({
    description: 'CIN or Trade License Number',
    example: 'U12345MH2020PTC123456',
  })
  @IsString()
  @IsNotEmpty()
  cinOrTradeLicenseNo: string;

  @ApiProperty({
    description: 'Date of incorporation (ISO 8601 date-time string)',
    type: String,
    format: 'date-time',
    example: '2020-01-01T00:00:00.000Z',
  })
  @IsDateString()
  dateOfIncorporation: string;

  // Registered Address (Required)
  @ApiProperty({
    description: 'Registered Address Line 1',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  registeredAddressLine1: string;

  @ApiPropertyOptional({
    description: 'Registered Address Line 2 (optional)',
    example: 'Suite 400',
  })
  @IsString()
  @IsOptional()
  registeredAddressLine2?: string;

  @ApiProperty({
    description: 'Registered City',
    example: 'Mumbai',
  })
  @IsString()
  @IsNotEmpty()
  registeredCity: string;

  @ApiProperty({
    description: 'Registered State',
    example: 'Maharashtra',
  })
  @IsString()
  @IsNotEmpty()
  registeredState: string;

  @ApiProperty({
    description: 'Registered Country',
    example: 'India',
  })
  @IsString()
  @IsNotEmpty()
  registeredCountry: string;

  @ApiProperty({
    description: 'Registered Pincode',
    example: '400001',
  })
  @IsString()
  @IsNotEmpty()
  registeredPincode: string;

  // Operational Address (Optional)
  @ApiPropertyOptional({
    description: 'Operational Address Line 1',
    example: '456 Industrial Park',
  })
  @IsString()
  @IsOptional()
  operationalAddressLine1?: string;

  @ApiPropertyOptional({
    description: 'Operational Address Line 2 (optional)',
    example: 'Block B',
  })
  @IsString()
  @IsOptional()
  operationalAddressLine2?: string;

  @ApiPropertyOptional({
    description: 'Operational City',
    example: 'Pune',
  })
  @IsString()
  @IsOptional()
  operationalCity?: string;

  @ApiPropertyOptional({
    description: 'Operational State',
    example: 'Maharashtra',
  })
  @IsString()
  @IsOptional()
  operationalState?: string;

  @ApiPropertyOptional({
    description: 'Operational Country',
    example: 'India',
  })
  @IsString()
  @IsOptional()
  operationalCountry?: string;

  @ApiPropertyOptional({
    description: 'Operational Pincode',
    example: '411001',
  })
  @IsString()
  @IsOptional()
  operationalPincode?: string;

  @ApiProperty({
    description: 'Company contact email',
    example: 'contact@acme.com',
  })
  @IsString()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty({
    description: 'Company contact phone number',
    example: '+91-9876543210',
  })
  @IsString()
  @IsNotEmpty()
  companyPhone: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://www.acme.com',
  })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industryType?: string;
}
