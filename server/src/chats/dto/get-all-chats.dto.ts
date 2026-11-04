import { SearchablePaginatedDto } from '@Common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetAllChatsRequestDto extends SearchablePaginatedDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  accountId: number;
}
