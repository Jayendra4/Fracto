import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ReferralUsesType } from '../../generated/prisma/enums';

export class GetAllBrokerLeads extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: ReferralUsesType })
  @IsOptional()
  @IsEnum(ReferralUsesType)
  type: ReferralUsesType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  brokerId?: number;
}
