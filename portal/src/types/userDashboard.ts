export interface KycDocument {
  id: number;
  documentTypeId?: number;
  accountId?: number;
  companyId?: number | null;
  directorId?: number | null;
  url: string;
  isVerified: boolean;
  remark?: string | null;
  uploadedAt: string;
  verifiedAt?: string | null;
  documentName?: string;
  documentDeveloperName?: string;
}

export interface UserMeta {
  occupation?: string;
  occupationIndustry?: string;
  monthlyIncome?: string;
  panNumber?: string;
  passportNumber?: string | null;
  emiratiId?: string | null;
  dateOfBirth?: string;
  realEstateLicenseNumber?: string | null;
  licenseExpiry?: string | null;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  countryId?: number;
  dialCode: string;
  mobile: string;
  profileImage?: string | null;
  status: string;
  type: string;
  isVerified: boolean;
  isDocumentUploaded: boolean;
  meta?: UserMeta;
  entityDocument: KycDocument[];
  companies?: {
    id: number;
    legalEntityName?: string;
    tradeName?: string;
    directors?: {
      id: number;
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      directorMeta?: {
        panNumber?: string | null;
        passportNumber?: string | null;
        emiratesIdNumber?: string | null;
      };
    }[];
  }[];
  permanentAddress:
    | {
        addressLine1?: string | null;
        addressLine2?: string | null;
        city?: string | null;
        state?: string | null;
        country?: string | null;
        pincode?: string | null;
      }
    | string
    | null;
  currentAddress?: {
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pincode?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  companyId?: number;
  referralCode?: string;
  referredCode?: string;
  kycStatus?: string;
  kybStatus?: string;
  hasLicense?: boolean;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  kyc?: {
    rejectionReason?: string | null;
  } | null;
}
export const COUNTRY_FLAG: Record<number, string> = {
  1: '🇮🇳',
  2: '🇦🇪',
};

export const DOCUMENT_TYPE_LABEL: Record<number, string> = {
  13: 'PAN Card',
  17: 'Address Proof',
  19: 'Selfie Photo',
  20: 'Secondary ID',
};

export function normalizeFileUrl(url?: string | null): string {
  if (!url) return '';

  let cleaned = url;
  const embeddedIndex = cleaned.lastIndexOf('https:/');
  if (embeddedIndex !== -1) {
    cleaned = cleaned.slice(embeddedIndex);
  }

  cleaned = cleaned.replace(/^https?:\/(?!\/)/, 'https://');

  return cleaned;
}

export function splitCamelCase(value?: string): string {
  if (!value) return '';

  return value.replace(/([a-z])([A-Z])/g, '$1 $2');
}
