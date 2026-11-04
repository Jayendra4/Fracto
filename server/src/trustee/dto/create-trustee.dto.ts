import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateTrusteeDto {
  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dialCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emiratiId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  monthlyIncome?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;
}
