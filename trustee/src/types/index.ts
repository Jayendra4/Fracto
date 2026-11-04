export type Option = {
  label: string;
  value: string;
};

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  TRUSTEE = 'Trustee',
}

export interface AuthTokens {
  trusteeAccessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  trusteeAccessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email?: string;
  mobile?: string;
  password: string;
  loginPanel: LoginPanel;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  count?: number;
  skip: number;
  take: number;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
    destructive: string;
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface FeatureFlags {
  betaFeatures: boolean;
  advancedAnalytics: boolean;
  experimentalUI: boolean;
}

export type Language = 'en' | 'es';

export interface TableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  validation?: any;
}

export interface LoginResponse {
  accessToken: string;
  type: 'Trustee' | 'admin' | 'user';
}
export interface TrusteeKyc {
  id: number;
  accountId: number;
  status: KycStatus;
  verifier: 'Admin' | 'System' | string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedById: number | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  profileImage: string | null;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  dialCode: string;
  mobile: string;
  country: string;
  kycStatus: string;
  kyc: TrusteeKyc;
  meta?: AccountMeta;
}

export interface Account {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  dialCode: string;
  mobile: string;
  profileImage: string | null;
  isVerified: boolean;
  countryId: number;
  type: string;
  status: 'Active' | 'Blocked' | 'Suspended';
  kycStatus?: string;
  createdAt: string;
  updatedAt: string;
  isDocumentUploaded: boolean;
}
export interface AccountDocument {
  id: number;
  documentTypeId: number;
  companyId: number | null;
  directorId: number | null;
  accountId: number;

  url: string;
  documentIdentifier: string | null;

  isVerified: boolean;
  remark: string | null;

  uploadedAt: string;
  verifiedAt: string | null;
}
export interface AccountMeta {
  passportNumber: string | null;
  panNumber: string | null;
  emiratiId: string | null;

  dateOfBirth: string | null;

  monthlyIncome: number | null;
  occupation: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  kycId?: number | null;
}
export interface Address {
  id: number;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
}
export type KycVerifier = 'Trustee' | 'Admin';

export interface Kyc {
  id: number;
  accountId: number;

  status: KycStatus;
  verifier: KycVerifier;

  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedById: number | null;

  rejectionReason: string | null;

  createdAt: string;
  updatedAt: string;
}
export interface AccountDetail extends Account {
  currentAddressId: number | null;
  permanentAddressId: number | null;
  entityDocument: AccountDocument[];
  meta: AccountMeta;
  currentAddress?: Address | null;
  permanentAddress?: Address | null;
  kycStatus: KycStatus;
  kyc: Kyc;
  licenseNumber: string | null;
  licenseExpiry: string | null;
}
export interface ProfileFormData {
  firstname: string;
  lastname: string;
  email: string;
  passport: string;
  accountType: string;
  mobile: string;
  meta: {
    dateOfBirth: string | null;
    occupation: string | null;
    monthlyIncome: string | null;
    panNumber: string | null;
  };
}

export interface RegisterInvestorPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  mobile: string;
  dialCode: string;
  countryId: number;
  accountType: 'Company' | 'Developer' | 'Spv' | 'Trustee' | 'AssetOwner';
}

export interface BankAccount {
  id: number;
  paymentOwnerId: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpiAccount {
  id: number;
  paymentOwnerId: number;
  upiId: string;
  qrCode?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountFormData {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface UpiAccountFormData {
  upiId: string;
  qrCode: string | null;
}

export type PaymentRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PaymentRequest {
  id: number;
  requestType: 'Deposit' | 'Withdraw';
  methodType: 'BANK' | 'UPI';
  amount: string;
  status: PaymentRequestStatus;
  screenshot: string | null;
  createdAt: string;

  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
  } | null;

  upiAccount: {
    upiId: string;
    qrCode: string;
  } | null;

  account?: {
    id: number;
    name?: string;
    firstname?: string;
    lastname?: string;
    email: string;
    mobile: string;
    type?: string;
    createdAt?: string;
  } | null;
}

export type GeoLocationValue = {
  coordinates: string; // "lat,lng"
  address?: {
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  markers: { lat: number; lng: number }[];
  polygonPath: { lat: number; lng: number }[];
  polygonArea: number | null;
};

export type Transaction = {
  transactionId: string;
  investorName: string;
  fundType: string;
  amountReceived: number;
  releaseAmount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  approvalDate: string;
  highRisk: boolean;
};
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface Country {
  id: number;
  name: string;
  dialCode: string;
  isoCode: string;
  flag: string;
}

export type CountryData = Country[];

export enum LoginPanel {
  ADMIN = 'Admin',
  TRUSTEE = 'Trustee',
  USER = 'User',
}

export interface RegisterUserPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  mobile: string;
  dialCode: string;
  emailVerificationCode: string;
  mobileVerificationCode: string;
  countryId: number;
  accountType:
    | 'Company'
    | 'Developer'
    | 'Spv'
    | 'Broker'
    | 'CorporateInvestor'
    | 'Trustee'
    | 'AssetOwner'
    | 'Director';
}

export type Notification = {
  id: number | string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  path?: string;
};

export interface sendOtpPayload {
  email?: string;
  mobile?: string;
  country?: string;
  type: string;
}

export type UserKycDocumentName =
  | 'pan_indian'
  | 'address_proof'
  | 'passport_size_photo'
  | 'secondary_id'
  | 'selfie_photo';

export interface AssetMeta {
  id?: number;
  assetId?: number;
  metaKey?: string;
  metaValue?: string;
  metaType?: 'STRING' | 'NUMBER' | 'DATE';
  isVerified?: boolean;
  remark?: string | null;
  createdAt?: string;
}

export interface AssetDocument {
  id?: number;
  assetId?: number;
  documentType?: string;
  documentName?: string;
  documentUrl?: string;
  url?: string;
  uploadedAt?: string;
  isVerified?: boolean;
  remark?: string | null;
}

export interface RwaRequest {
  id?: number;
  assetId?: number;
  newRwaStatus?: RwaNewStatus;
  status?: RwaStatus | string;
  statusForLegal?: string | null;
  statusForValuation?: string | null;
  statusForDueDiligence?: string | null;
  trusteeId?: number | null;
  trusteeComment?: string | null;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  fractionalizationStatus?: string;
  fractionalizedById?: number | null;
  fractionalizedAt?: string | null;
  listingAmount?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface Asset {
  id: number;
  assetTitle?: string;
  currentOwnerName?: string;
  propertyInterest: [];
  assetType?: string;
  assetSubType?: string | null;

  isSoldOut?: boolean;
  isVerified?: boolean;
  spvName?: string | null;
  createdAt?: string;
  updatedAt?: string;
  newStatus?: RwaNewStatus;
  meta?: AssetMeta[];
  documents?: AssetDocument[];
  ownershipModel?: string;
  rwaRequest: RwaRequest;
  status: AssetStatus;
}

export enum KycStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
}
export enum RwaStatus {
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum RwaNewStatus {
  Submitted = 'ReviewPending',
  Approved = 'Reviewed',
  Rejected = 'ReviewReject',
}
export enum AssetStatus {
  Draft = 'Draft',
  Available = 'Available',
  Funded = 'Funded',
  Exited = 'Exited',
}

export enum ACCOUNT_TYPES {
  COMPANY = 'Company',
  DEVELOPER = 'Developer',
  SPV = 'Spv',
  BROKER = 'Broker',
  INVESTOR = 'CorporateInvestor',
  TRUSTEE = 'Trustee',
  ASSETOWNER = 'AssetOwner',
  DIRECTOR = 'Director',
}

export interface BankAccount {
  id: number;
  paymentOwnerId: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpiAccount {
  id: number;
  paymentOwnerId: number;
  upiId: string;
  qrCode?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ---------- Address ---------- */
// export interface Address {
//   id: number;
//   addressLine1: string;
//   addressLine2: string | null;
//   city: string;
//   state: string;
//   pincode: string;
//   createdAt: string;
//   updatedAt: string;
// }

/* ---------- Document ---------- */
export interface KycDocument {
  id: number;
  documentTypeId: number;
  url: string;
  isVerified: boolean;
}

/* ---------- Company Meta ---------- */
export interface CompanyMeta {
  id: number;
  companyId: number;
  natureOfBusiness: string | null;
  businessDescription: string | null;
  expectedMonthlyTransactionVolume: number | null;
  expectedSourceOfFunds: string | null;
  countriesOfOperation: string[];
  isCompanyPubliclyListed: boolean;
  panNumber: string | null;
  gstNumber: string | null;
  tanNumber: string | null;
  panVerified: boolean;
  gstVerified: boolean;
}

/* ---------- Company ---------- */
export interface Company {
  id: number;
  legalEntityName: string;
  tradeName: string;
  entityType: string;
  cinOrTradeLicenseNo: string;
  dateOfIncorporation: string;
  email: string;
  phone: string;
  websiteUrl: string | null;
  isVerified: boolean;
  registeredAddress: Address;
  operationalAddress: Address | null;
  meta: CompanyMeta;
  documents: KycDocument[];
}

/* ---------- Director ---------- */
export interface Director {
  id: number;
  name: string;
  roleInCompany: string;
  dateOfBirth: string;
  nationality: string;
  email: string;
  mobileNumber: string;
  isVerified: boolean;
  permanentAddress: Address | null;
  kycIdentifiers: {
    panNumber: string | null;
    passportNumber: string | null;
  };
  documents: KycDocument[];
}

/* ---------- Status Block ---------- */
export interface KycStatuses {
  kybStatus: KycStatus;
  kycStatus: KycStatus;
  overallStatus: KycStatus;
  kybSubmittedAt: string | null;
  kycSubmittedAt: string | null;
  kybReviewedAt: string | null;
  kycReviewedAt: string | null;
}

/* ---------- Root Response ---------- */
export interface CompanyKycDetailsResponse {
  kycId: number;
  accountId: number;
  statuses: KycStatuses;
  company: Company;
  directors: Director[];
  data: any;
}
