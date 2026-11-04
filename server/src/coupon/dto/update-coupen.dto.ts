import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-coupon.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
