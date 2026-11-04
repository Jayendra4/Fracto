import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { AccountType, KycStatus } from '../../generated/prisma/client';

export class GetUsersRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: AccountType })
  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  @ApiPropertyOptional({ enum: KycStatus })
  @IsEnum(KycStatus)
  @IsOptional()
  kycStatus?: KycStatus;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'fromDate must start with YYYY-MM-DD',
  })
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter to date (YYYY-MM-DD)',
    example: '2025-06-30',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'toDate must start with YYYY-MM-DD',
  })
  toDate?: string;
}
