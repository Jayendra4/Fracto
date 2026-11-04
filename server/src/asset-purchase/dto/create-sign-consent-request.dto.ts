import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSignConsentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  assetId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  buyerConsent: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
