// dto/update-payment-request-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../../generated/prisma/client';

export class UpdatePaymentRequestStatusDto {
  @ApiProperty({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
