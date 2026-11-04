import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SpvStatus } from '../../generated/prisma/enums';

export class UpdateSpvStatusDto {
  @ApiProperty({ enum: SpvStatus })
  @IsEnum(SpvStatus)
  status: SpvStatus;
}
