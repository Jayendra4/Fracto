import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailMobileDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  emailCode: string;

  @ApiProperty()
  @IsPhoneNumber(undefined)
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  mobileCode: string;
}
