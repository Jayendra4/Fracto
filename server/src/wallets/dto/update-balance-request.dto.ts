import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateBalanceRequestDto {
  @ApiProperty()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  narration: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refernce?: string;
}
