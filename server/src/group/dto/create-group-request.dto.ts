import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateGroupRequestDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiPropertyOptional()
  @IsString()
  image?: string;
}
