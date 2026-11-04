import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetaType } from '../../generated/prisma/enums';
import { AssetBasicInfoDto } from './asset-basic-info.dto';
import { AssetMetaDto } from './asset-meta.dto';

export class AssetDocumentDto {
  @ApiProperty({
    example: 'Registered Sale Deed',
    description: 'Type of document',
  })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiPropertyOptional({
    example: 'Sale Deed Jan 2020',
    description: 'Friendly document name',
  })
  @IsOptional()
  @IsString()
  documentName?: string;

  @ApiProperty({
    example: 'https://example.com/docs/sale-deed.pdf',
    description: 'URL link to the document',
  })
  @IsString()
  @IsNotEmpty()
  documentUrl: string;

  @ApiPropertyOptional({
    example: 'Verified and notarized',
    description: 'Remarks or notes',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class WhyInvestedDto {
  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class OwnerBasicDetailDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile: string;
}

// Final DTO with meta example showing all optional fields as meta key-value pairs
export class CreateAssetDto {
  @ApiProperty({ type: AssetBasicInfoDto })
  @ValidateNested()
  @Type(() => AssetBasicInfoDto)
  basicInfo: AssetBasicInfoDto;

  @ApiPropertyOptional({ type: OwnerBasicDetailDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OwnerBasicDetailDto)
  ownerDetails?: OwnerBasicDetailDto;
  @ApiPropertyOptional({
    type: [AssetMetaDto],
    description:
      'Dynamic optional meta key-value pairs for flexible asset data',
    example: [
      // Location & address
      { metaKey: 'state', metaValue: 'Maharashtra', metaType: MetaType.String },
      { metaKey: 'city', metaValue: 'Mumbai', metaType: MetaType.String },
      { metaKey: 'country', metaValue: 'India', metaType: MetaType.String },
      { metaKey: 'builtupArea', metaValue: '4500', metaType: MetaType.String },
      {
        metaKey: 'pincode',
        metaValue: '400001',
        metaType: MetaType.String,
      },
      {
        metaKey: 'geoLocation',
        metaValue: '18.9750,72.8258',
        metaType: MetaType.String,
      },

      // Property specifics
      { metaKey: 'landArea', metaValue: '1200', metaType: MetaType.Number },
      { metaKey: 'builtUpArea', metaValue: '1000', metaType: MetaType.Number },
      {
        metaKey: 'yearOfConstruction',
        metaValue: '2010',
        metaType: MetaType.Number,
      },
      { metaKey: 'assetAge', metaValue: '14', metaType: MetaType.Number },

      // Ownership & title info
      {
        metaKey: 'ownershipEntityType',
        metaValue: 'Individual',
        metaType: MetaType.String,
      },
      { metaKey: 'titleStatus', metaValue: 'Clear', metaType: MetaType.String },
      {
        metaKey: 'encumbranceDetails',
        metaValue: 'N/A',
        metaType: MetaType.String,
      },
      {
        metaKey: 'reraRegistrationNumber',
        metaValue: 'RERA12345',
        metaType: MetaType.String,
      },

      // Financials
      {
        metaKey: 'marketValue',
        metaValue: '50000000',
        metaType: MetaType.Number,
      },
      { metaKey: 'currency', metaValue: 'INR', metaType: MetaType.String },
      {
        metaKey: 'valuationAgencyName',
        metaValue: 'Valuation Experts Pvt Ltd',
        metaType: MetaType.String,
      },
      {
        metaKey: 'valuationReportDate',
        metaValue: '2024-05-01',
        metaType: MetaType.Date,
      },
      {
        metaKey: 'lastPurchasePrice',
        metaValue: '45000000',
        metaType: MetaType.Number,
      },
      {
        metaKey: 'rentalIncomeMonthly',
        metaValue: '150000',
        metaType: MetaType.Number,
      },
      {
        metaKey: 'leaseTenureRemainingMonths',
        metaValue: '36',
        metaType: MetaType.Number,
      },
      {
        metaKey: 'last3YearRevenue',
        metaValue: '12000000',
        metaType: MetaType.Number,
      },
      {
        metaKey: 'operationalExpensesAnnual',
        metaValue: '2000000',
        metaType: MetaType.Number,
      },
      {
        metaKey: 'netOperatingIncome',
        metaValue: '10000000',
        metaType: MetaType.Number,
      },
      {
        metaKey: 'expectedYieldPercent',
        metaValue: '8',
        metaType: MetaType.Number,
      },
      {
        metaKey: 'expectedAppreciationPercent',
        metaValue: '10',
        metaType: MetaType.Number,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetMetaDto)
  meta?: AssetMetaDto[];

  @ApiPropertyOptional({
    type: [AssetDocumentDto],
    description: 'Related asset documents',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetDocumentDto)
  documents?: AssetDocumentDto[];

  @ApiPropertyOptional({ type: [WhyInvestedDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhyInvestedDto)
  whyInvested: WhyInvestedDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  createGroup: boolean;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  groupIds?: number[];
}
