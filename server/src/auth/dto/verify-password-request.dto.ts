import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPasswordRequestDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile: string;
}
