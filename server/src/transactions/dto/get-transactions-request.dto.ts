import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { GetUserTransactionsRequestDto } from './get-user-transactions-request.dto';

export enum ExportFormat {
  Excel = 'excel',
  Pdf = 'pdf',
}

export class GetTransactionsRequestDto extends GetUserTransactionsRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  accountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform((params) =>
    params.obj.export === 'false' || params.obj.export === '0'
      ? false
      : params.value,
  )
  export?: boolean;

  @ApiPropertyOptional({ default: ExportFormat.Excel })
  @IsOptional()
  @IsEnum(ExportFormat)
  exportFormat?: ExportFormat;
}
