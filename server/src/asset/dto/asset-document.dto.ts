import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssetDocumentDto {
  @ApiProperty({
    example: 'Registered Sale Deed',
    description: 'Type of document',
  })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiPropertyOptional({
    example: 'Sale Deed Jan 2020',
    description: 'Friendly document name',
  })
  @IsOptional()
  @IsString()
  documentName?: string;

  @ApiProperty({
    example: 'https://example.com/docs/sale-deed.pdf',
    description: 'URL link to the document',
  })
  @IsString()
  @IsNotEmpty()
  documentUrl: string;

  @ApiPropertyOptional({
    example: 'Verified and notarized',
    description: 'Remarks or notes',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
