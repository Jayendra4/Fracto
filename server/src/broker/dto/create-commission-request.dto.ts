import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommissionRequestDto {
  @ApiProperty({
    example: 1250.75,
    description: 'Commission amount (decimal allowed)',
  })
  @IsNotEmpty()
  @Type(() => Number) // converts string → number
  @IsNumber(
    { maxDecimalPlaces: 2 }, // controls decimal precision
    {
      message:
        'Amount must be a valid decimal number with up to 2 decimal places',
    },
  )
  @Min(0)
  amount: number;
}
