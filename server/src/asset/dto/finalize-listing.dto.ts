import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AssetStatus } from '../../generated/prisma/enums';

export class FinalizeListingDto {
  @ApiProperty({
    enum: AssetStatus,
    description: 'Available to approve, Rejected to reject',
  })
  @IsNotEmpty()
  @IsEnum(AssetStatus)
  status: AssetStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  secondaryClubId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  totalFractions: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pricePerFraction: number;

  @ApiPropertyOptional({ description: 'Required when approving' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  listingAmount?: number;

  @ApiPropertyOptional({ description: 'Required when rejecting' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
