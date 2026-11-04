import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class TransferFractionDto {
  @ApiProperty({ example: 'asset123', description: 'Asset ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Tom', description: 'Current owner' })
  @IsString()
  @IsNotEmpty()
  fromOwner: string;

  @ApiProperty({ example: 'Alice', description: 'New owner' })
  @IsString()
  @IsNotEmpty()
  toOwner: string;

  @ApiProperty({ example: '20', description: 'Fraction count to transfer' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'fractionCount must be numeric string' })
  fractionCount: string;
}
