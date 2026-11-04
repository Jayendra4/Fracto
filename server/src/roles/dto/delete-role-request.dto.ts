import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class DeleteRoleRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  replacementRoleId?: number;
}
