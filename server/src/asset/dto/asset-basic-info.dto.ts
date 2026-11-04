import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { AssetType, OwnershipModel } from '../../generated/prisma/client';

export class AssetBasicInfoDto {
  @ApiProperty({
    example: AssetType.RealEstate,
    description: 'Type of the asset',
  })
  @IsNotEmpty()
  @IsEnum(AssetType)
  assetType: AssetType;

  @ApiProperty({
    example: 'Ocean View Apartment',
    description: 'Title/name of the asset',
  })
  @IsString()
  @IsNotEmpty()
  assetTitle: string;

  @ApiProperty({ example: 'John Doe', description: 'Current owner name' })
  @IsString()
  @IsNotEmpty()
  currentOwnerName: string;

  @ApiProperty({
    example: OwnershipModel.SingleOwner,
    description: 'Ownership model of the asset',
  })
  @IsNotEmpty()
  @IsEnum(OwnershipModel)
  ownershipModel: OwnershipModel;

  @ApiPropertyOptional({
    description:
      'Free-text ownership model description — required when ownershipModel is Others',
  })
  @IsOptional()
  @IsString()
  ownershipModelOther?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mapUrl?: string;
}
