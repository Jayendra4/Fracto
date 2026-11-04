import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ContactUsDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'abc@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'write some message' })
  @IsOptional()
  @IsString()
  message: string;
}
