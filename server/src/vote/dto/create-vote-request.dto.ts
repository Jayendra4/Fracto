import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { VoteChoice } from '../../generated/prisma/enums';

export class CreateVoteRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  assetId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  secondaryClubId: number;

  @ApiProperty({ enum: VoteChoice })
  @IsNotEmpty()
  @IsEnum(VoteChoice)
  choice: VoteChoice;
}
