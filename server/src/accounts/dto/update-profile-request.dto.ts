import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../../generated/prisma/enums';

class UpdateAccountMetaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  monthlyIncome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid PAN number format',
  })
  panNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateOfBirth?: string;
}

export class UpdateUsersProfileDetailsRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can contain only letters, numbers and underscore',
  })
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({ enum: AccountType })
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dialCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber('IN', {
    message: 'Invalid mobile number',
  })
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ type: UpdateAccountMetaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAccountMetaDto)
  meta?: UpdateAccountMetaDto;
}
