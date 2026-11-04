import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class InviteAssetOwnerDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  @IsNotEmpty()
  assetOwnerEmail: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+919874522174' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  proposedCommissionPct: number;

  @ApiPropertyOptional({
    example: 'High-demand commercial property with strong rental yield',
  })
  @IsOptional()
  @IsString()
  brokerNote?: string;
}
