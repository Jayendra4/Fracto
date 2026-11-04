export interface ICompanyBasicReq {
  legalEntityName: string;
  tradeName: string;
  entityType: string;
  cinOrTradeLicenseNo: string;
  dateOfIncorporation: string;
  registeredAddressLine1: string;
  registeredAddressLine2?: string;
  registeredCity: string;
  registeredState: string;
  registeredCountry: string;
  registeredPincode: string;
  operationalAddressLine1: string;
  operationalAddressLine2?: string;
  operationalCity: string;
  operationalState: string;
  operationalCountry: string;
  operationalPincode: string;
  companyEmail: string;
  companyPhone: string;
  websiteUrl?: string;
  accountId: number;
  industryType?: string;
}

export interface ICompanyBasicRes {
  id: string;
  legalEntityName: string;
  entityType: string;
  createdAt: string;
}

export interface ICompanyTaxReq {
  panNumber: string;
  gstNumber?: string;
  tanNumber?: string;
  tradeLicenseExpiryDate: string;
  placeOfBusinessProofType: string;
}

export interface ICompanyTaxRes {
  id: string;
  panNumber: string;
  updatedAt: string;
}

export interface IBusinessProfileReq {
  natureOfBusiness: string;
  countriesOfOperation: string[];
  expectedMonthlyTransactionVolume: string;
  expectedSourceOfFunds: string;
  businessDescription?: string;
  isCompanyPubliclyListed: string;
}

export interface IBusinessProfileRes {
  id: string;
  updatedAt: string;
}

export interface ICompanyDocument {
  type: string;
  url: string;
}

export interface ICompanyUploadDocsReq {
  documents: ICompanyDocument[];
  [key: string]: any;
}

export interface ICompanyUploadDocsRes {
  success: boolean;
  message: string;
}
