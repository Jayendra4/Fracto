import { SearchablePaginatedDto } from '@Common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { RWAStatus } from '../../generated/prisma/enums';

export const DUE_DILIGENCE_RWA_STATUSES = [
  RWAStatus.DueDiligence,
  RWAStatus.DueDiligenceRejected,
] as const;

export enum AssetDocumentSortBy {
  UPLOADED_AT = 'uploadedAt',
  DOCUMENT_NAME = 'documentName',
  DOCUMENT_TYPE = 'documentType',
}

export enum AssetDocumentSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetAssetDocumentsDto extends SearchablePaginatedDto {
  @ApiPropertyOptional({
    enum: DUE_DILIGENCE_RWA_STATUSES,
    description:
      'Filter by due-diligence status; omit to return both DueDiligence and DueDiligenceRejected',
  })
  @IsOptional()
  @IsIn(DUE_DILIGENCE_RWA_STATUSES)
  status?: (typeof DUE_DILIGENCE_RWA_STATUSES)[number];

  @ApiPropertyOptional({ enum: AssetDocumentSortBy })
  @IsOptional()
  @IsEnum(AssetDocumentSortBy)
  sortBy?: AssetDocumentSortBy;

  @ApiPropertyOptional({ enum: AssetDocumentSortOrder })
  @IsOptional()
  @IsEnum(AssetDocumentSortOrder)
  order?: AssetDocumentSortOrder;
}
