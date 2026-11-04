import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { CouponStatus, DiscountType } from '../../generated/prisma/client';

export class GetAllCoupenRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: DiscountType })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiPropertyOptional({ enum: CouponStatus })
  @IsEnum(CouponStatus)
  @IsOptional()
  couponStatus?: CouponStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'fromDate must start with YYYY-MM-DD',
  })
  fromDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'toDate must start with YYYY-MM-DD',
  })
  toDate?: string;
}
