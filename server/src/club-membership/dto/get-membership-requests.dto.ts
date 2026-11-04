import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { SearchablePaginatedDto } from '@Common';
import { MembershipStatus } from '../../generated/prisma/enums';

export class GetMembershipRequestsDto extends SearchablePaginatedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  secondaryClubId?: number;

  @ApiPropertyOptional({ enum: MembershipStatus })
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;
}
