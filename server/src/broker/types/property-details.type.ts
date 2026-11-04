export interface PropertyBasicInfo {
  assetType: string;
  assetTitle: string;
  ownershipModel: string;
}

export interface PropertyMeta {
  metaKey: string;
  metaValue: string;
}

export interface PropertyDocument {
  documentType: string;
  developerName: string;
  filename: string;
  fileUrl: string;
}

export interface PropertyDetails {
  basicInfo: PropertyBasicInfo;
  meta: PropertyMeta[];
  documents: PropertyDocument[];
}
