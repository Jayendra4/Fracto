import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateSubAdminRequestDto {
  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiPropertyOptional({
    description:
      'Role to assign. Omit to fall back to the default minimal "Standard Access" role.',
  })
  @IsOptional()
  @IsInt()
  roleId?: number;
}
