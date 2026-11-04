export type KycDocumentId = string;

export interface FileMetaKyc {
  name: string;
  type: string;
  size: number;
}

export type FilesMetaMapKyc = Record<string, FileMetaKyc | null>;
export type FilesMapKyc = Record<string, File | null>;

export interface DocumentConfigKyc {
  id: string;
  label: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  tooltip: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
  isTextField?: boolean;
  type?: 'radio-image';
  options?: { label: string; value: string }[];

  validation?: {
    required?: string;
    [key: string]: any;
  };

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
