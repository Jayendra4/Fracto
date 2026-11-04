import { SearchablePaginatedDto } from '@Common';
import { InterestPaymentStatus } from '../../generated/prisma/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetManualInterestPaymentListRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: InterestPaymentStatus })
  @IsOptional()
  @IsEnum(InterestPaymentStatus)
  paymentStatus?: InterestPaymentStatus;
}
