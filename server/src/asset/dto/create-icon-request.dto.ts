import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WhyInvestedDto {
  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;
}
