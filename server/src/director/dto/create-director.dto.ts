import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { RoleInCompany } from '../../generated/prisma/client';

export class CreateAddressDto {
  @ApiProperty({ example: 'Flat 203, Palm Residency' })
  @IsNotEmpty()
  @IsString()
  line1: string;

  @ApiProperty({ example: 'Near XYZ Mall', required: false })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Dubai' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Dubai' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: '500001' })
  @IsNotEmpty()
  @IsString()
  pincode: string;
}

export class CreateDirectorDto {
  @ApiProperty({ example: 'Ravi' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: ' Kumar' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: RoleInCompany, example: RoleInCompany.Director })
  @IsEnum(RoleInCompany)
  roleInCompany: RoleInCompany;

  @ApiProperty({ example: '1992-07-31' })
  @IsString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Indian' })
  @IsString()
  nationality: string;

  @ApiProperty({ example: 'ABCDE1234F', required: false })
  @IsOptional()
  panNumber?: string;

  @ApiProperty({ example: 'ABCDE1234F', required: false })
  @IsOptional()
  emiratesIdNumber?: string;

  @ApiProperty({ example: 'ABCDE1234F', required: false })
  @IsOptional()
  passportNumber?: string;

  @ApiProperty({ example: 'ravi.kumar@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  mobileNumber: string;

  // Address block
  @ApiProperty({ type: CreateAddressDto })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
