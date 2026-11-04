import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export enum SendCodeRequestType {
  Register = 'register',
  Login = 'login',
  ResetPassword = 'resetpassword',
}

export class SendCodeRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Mobile number must contain only digits and optional +',
  })
  @IsPhoneNumber(undefined, {
    message: 'Please provide a valid mobile number',
  })
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;

  @ApiProperty({ enum: SendCodeRequestType })
  @IsEnum(SendCodeRequestType)
  type: SendCodeRequestType;
}
