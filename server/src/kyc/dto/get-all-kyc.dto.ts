import { IsOptional, IsEnum } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType, KycStatus } from '../../generated/prisma/enums';

export class GetKycListDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: KycStatus })
  @IsOptional()
  @IsEnum(KycStatus)
  status?: KycStatus;

  @ApiPropertyOptional({ enum: AccountType })
  @IsOptional()
  @IsEnum(AccountType)
  userType?: AccountType;
}
