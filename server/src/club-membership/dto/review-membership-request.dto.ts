import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MembershipStatus } from '../../generated/prisma/enums';

export class ReviewMembershipRequestDto {
  @ApiProperty({
    enum: [MembershipStatus.Approved, MembershipStatus.Rejected],
  })
  @IsNotEmpty()
  @IsIn([MembershipStatus.Approved, MembershipStatus.Rejected])
  status: typeof MembershipStatus.Approved | typeof MembershipStatus.Rejected;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
