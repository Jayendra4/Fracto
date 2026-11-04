import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { VendorCategory } from '../../generated/prisma/enums';

export class CreateVendorSuggestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vendorName: string;

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
  @IsPhoneNumber(undefined, {
    message:
      'The mobile number you entered is invalid, please provide a valid mobile number',
  })
  mobile: string;
}
