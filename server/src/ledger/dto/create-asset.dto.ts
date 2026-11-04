import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateAssetFracDto {
  @ApiProperty({ example: 'asset123', description: 'Unique asset ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'RealEstate', description: 'Type of asset' })
  @IsString()
  @IsNotEmpty()
  assetType: string;

  @ApiProperty({ example: 'Land', description: 'Subtype of asset' })
  @IsString()
  @IsNotEmpty()
  subType: string;

  @ApiProperty({ example: 'Tom', description: 'Owner name' })
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty({ example: '1000000', description: 'Appraised value' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'appraisedValue must be numeric string' })
  appraisedValue: string;

  @ApiProperty({ example: '100', description: 'Total number of fractions' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'totalFractions must be numeric string' })
  totalFractions: string;
}
