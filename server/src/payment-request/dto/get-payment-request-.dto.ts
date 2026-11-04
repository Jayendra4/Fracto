import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { SearchablePaginatedDto } from '@Common';
import {
  PaymentRequestType,
  RequestStatus,
} from '../../generated/prisma/client';

export class PaymentRequestFilterDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({
    enum: RequestStatus,
    example: RequestStatus.Pending,
    description: 'Filter by request status',
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({
    enum: PaymentRequestType,
    example: PaymentRequestType.Deposit,
    description: 'Filter by deposit or withdraw',
  })
  @IsOptional()
  @IsEnum(PaymentRequestType)
  requestType?: PaymentRequestType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  accountId?: number;

  @ApiPropertyOptional({
    description: 'Filter to date (YYYY-MM-DD)',
    example: '2025-06-30',
  })
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
