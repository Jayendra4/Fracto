import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGroupFromPaidMembersDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Voting start date & time (ISO 8601)' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Voting end date & time (ISO 8601)' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
