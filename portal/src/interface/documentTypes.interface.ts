export type DocumentId =
  | 'certificateOfIncorporation'
  | 'moa'
  | 'aoa'
  | 'companyPan'
  | 'gstCertificate'
  | 'tradeLicense'
  | 'shareholdingPattern'
  | 'auditedFinancials'
  | 'netWorthCertificate'
  | 'businessPanCard'
  | 'registered_address_proof';

export interface FileMeta {
  name: string;
  type: string;
  size: number;
}

export type FilesMetaMap = Record<DocumentId, FileMeta | null>;
export type FilesMap = Record<DocumentId, File | null>;

export interface DocumentConfig {
  id: DocumentId;
  label: string;
  required?: boolean;
  optionalNote?: string;
  isTextField?: boolean;
  helperText?: string;
  type?: 'radio-image';
  options?: { label: string; value: string }[];

  conditionalShow?: {
    dependsOn: string;
    value: any;
  };

  externalConditionalShow?: {
    key: string;
    value: any;
  };

  conditionalRequired?: {
    dependsOn: string;
    value: any;
    message: string;
  };

  externalConditionalRequired?: {
    key: string;
    value: any;
    message: string;
  };
}
