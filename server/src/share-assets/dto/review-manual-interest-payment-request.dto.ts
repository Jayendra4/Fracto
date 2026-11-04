import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InterestPaymentStatus } from '../../generated/prisma/enums';

export class ReviewManualInterestPaymentDto {
  @ApiProperty({
    enum: InterestPaymentStatus,
    description: 'PAID to verify, FAILED to reject',
  })
  @IsNotEmpty()
  @IsEnum(InterestPaymentStatus)
  status: InterestPaymentStatus;

  @ApiPropertyOptional({ description: 'Required when rejecting' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
