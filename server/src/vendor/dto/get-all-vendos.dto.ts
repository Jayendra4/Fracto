import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { VendorCategory } from '../../generated/prisma/enums';

export class GetAllVendorRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: VendorCategory })
  @IsEnum(VendorCategory)
  @IsOptional()
  category?: VendorCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true' || value === true;
  })
  isActive?: boolean;
}
