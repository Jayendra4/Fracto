import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { VendorCategory } from '../../generated/prisma/enums';

export class CreateVendorDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: VendorCategory })
  @IsNotEmpty()
  @IsEnum(VendorCategory)
  category: VendorCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiPropertyOptional()
  @IsOptional()
  documents?: Record<string, any>;
}
