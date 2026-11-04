import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectMarketplaceMatchDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
