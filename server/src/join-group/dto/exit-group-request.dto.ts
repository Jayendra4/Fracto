import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExitGroupRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
