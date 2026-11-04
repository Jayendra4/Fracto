import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { AccountType } from '../../generated/prisma/client';

export class RegisterUserRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  dialCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message:
      'The mobile number you entered is invalid, please provide a valid mobile number',
  })
  mobile?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  referralCode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  emailVerificationCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileVerificationCode?: string;
}
