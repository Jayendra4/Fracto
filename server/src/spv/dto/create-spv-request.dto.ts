import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSpvRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  secondaryClubId: number;

  @ApiPropertyOptional({
    type: [Number],
    description:
      'Account IDs to include in the SPV up front. Usually left empty — ' +
      'members are added automatically once they vote Yes and their NDA ' +
      'request is approved.',
  })
  @IsOptional()
  @ArrayUnique()
  @IsInt({ each: true })
  accountIds?: number[];
}
