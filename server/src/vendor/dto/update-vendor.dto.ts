import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateVendorDto } from './create-vendor.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateVendorRequestDto extends PartialType(CreateVendorDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
