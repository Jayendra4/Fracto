import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FcmToeknRequestDto {
  @ApiProperty({ example: 'deviceTokenHere123' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
