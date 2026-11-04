import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateCategoryRequestDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  name: string;
}
