import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
