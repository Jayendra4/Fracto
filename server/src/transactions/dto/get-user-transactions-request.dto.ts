import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';
import {
  WalletTransactionContext,
  WalletTransactionType,
  WalletType,
} from '../../generated/prisma/client';

export class GetUserTransactionsRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  fromDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  toDate?: Date;

  @ApiPropertyOptional({ enum: WalletTransactionContext })
  @IsOptional()
  @IsEnum(WalletTransactionContext)
  context?: WalletTransactionContext;

  @ApiPropertyOptional({ enum: WalletTransactionType })
  @IsOptional()
  @IsEnum(WalletTransactionType)
  type?: WalletTransactionType;

  @ApiPropertyOptional({ enum: WalletType })
  @IsOptional()
  @IsEnum(WalletType)
  walletType?: WalletType;
}
