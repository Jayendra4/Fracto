import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBankAccountDto } from './add-bank-account.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
