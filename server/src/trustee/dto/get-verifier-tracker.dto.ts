import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';
import { RWAStatus, TradeSettlementStatus } from '../../generated/prisma/enums';

export class GetVerifierTrackerRequestDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({ enum: RWAStatus })
  @IsOptional()
  @IsEnum(RWAStatus)
  rwaStatus?: RWAStatus;

  @ApiPropertyOptional({ enum: TradeSettlementStatus })
  @IsOptional()
  @IsEnum(TradeSettlementStatus)
  status?: TradeSettlementStatus;
}
