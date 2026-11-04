import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export enum LoginPanel {
  Admin = 'Admin',
  Trustee = 'Trustee',
  User = 'User',
}

export class LoginRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message:
      'The mobile number you entered is invalid, please provide a valid mobile number',
  })
  mobile?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emailVerificationCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileVerificationCode?: string;

  @ApiProperty({ enum: LoginPanel })
  @IsEnum(LoginPanel)
  @IsNotEmpty()
  loginPanel: LoginPanel;
}
