import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ActivityActorType } from '../activity.types';

export class GetAllActivityDto extends SearchablePaginatedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  accountId?: number;

  @ApiPropertyOptional({ enum: ActivityActorType })
  @IsOptional()
  @IsEnum(ActivityActorType)
  actorType?: ActivityActorType;
}
