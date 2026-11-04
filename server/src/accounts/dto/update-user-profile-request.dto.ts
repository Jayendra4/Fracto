import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { UpdateUsersProfileDetailsRequestDto } from './update-profile-request.dto';
import { AccountStatus } from '../../generated/prisma/enums';

export class UpdateUserProfileRequestDto extends UpdateUsersProfileDetailsRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsStrongPassword()
  password?: string;

  @ApiPropertyOptional({
    enum: AccountStatus,
    example: AccountStatus.Active,
    description: 'Filter by request status',
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
