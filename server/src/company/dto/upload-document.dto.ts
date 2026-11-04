// dto/upload-documents.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsDateString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty()
  @IsString()
  documentTypeCode!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentIdentifier?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  validUpto?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  apiVerified?: boolean;
}

export class UploadDocumentsDto {
  @ApiProperty({ type: [UploadDocumentDto] })
  @ValidateNested({ each: true })
  @Type(() => UploadDocumentDto)
  @ArrayMinSize(1)
  documents!: UploadDocumentDto[];
}
