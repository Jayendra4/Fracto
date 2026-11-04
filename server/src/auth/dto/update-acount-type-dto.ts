import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AccountType } from '../../generated/prisma/enums';

export class UpdateTypeDto {
  @ApiProperty({ enum: AccountType })
  @IsNotEmpty()
  @IsEnum(AccountType)
  type: AccountType;
}
