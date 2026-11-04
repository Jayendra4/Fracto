import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class CheckIdentifierDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Please provide a valid mobile number',
  })
  mobile?: string;
}
