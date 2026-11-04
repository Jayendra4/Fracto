import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class KycDocumentUploadDto {
  @ApiProperty({ example: 'passport' })
  @IsNotEmpty()
  @IsString()
  developerName: string;

  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/file.png' })
  @IsNotEmpty()
  @IsString()
  filename: string; // URL or path
}

class KycAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5,6}$/, { message: 'Invalid pincode format' })
  pincode: string;
}

export class UpdateKycDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstname: string;

  @ApiPropertyOptional({ example: 124 })
  @IsOptional()
  @IsNumber()
  accountId: number;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastname: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  countryId: number;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid PAN number',
  })
  panNumber?: string;

  @ApiPropertyOptional({
    example: 'ABCDE1234F',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  passportNumber?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  emiratiId: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ example: '13500' })
  @IsOptional()
  @IsString()
  monthlyIncome?: string;

  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsOptional()
  @IsString()
  dateOfBirth: string;

  @ApiPropertyOptional({ example: 'BRK-MH-2023-009812' })
  @IsOptional()
  @IsString()
  licenseNumber: string;

  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsOptional()
  @IsString()
  licenseExpiry: string;

  @ApiPropertyOptional({
    type: [KycDocumentUploadDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KycDocumentUploadDto)
  documents?: KycDocumentUploadDto[];

  @ApiPropertyOptional({ type: KycAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => KycAddressDto)
  residentialAddress?: KycAddressDto;
}
