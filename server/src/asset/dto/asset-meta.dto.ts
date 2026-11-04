import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MetaType } from '../../generated/prisma/client';

export class AssetMetaDto {
  @ApiProperty({
    example: 'state',
    description: 'Meta key name, eg: state, city, geoLocation, pincode',
  })
  @IsString()
  @IsNotEmpty()
  metaKey: string;

  @ApiPropertyOptional({
    example: 'Maharashtra',
    description: 'Meta value as string',
  })
  @IsOptional()
  @IsString()
  metaValue?: string;

  @ApiPropertyOptional({
    example: MetaType.String,
    enum: MetaType,
    description: 'Type of meta value',
  })
  @IsOptional()
  @IsEnum(MetaType)
  metaType?: MetaType;
}
