import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class CreateJoinGroupRequestDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  groupIds: number[];
}
