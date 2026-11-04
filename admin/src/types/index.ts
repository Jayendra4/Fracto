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
}

export const PERMISSIONS = [
  'dashboard.view',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'roles.view',
  'roles.create',
  'roles.edit',
  'roles.delete',
  'roles.assign',
  'analytics.view',
  'reports.view',
  'settings.view',
  'settings.edit',
  'billing.view',
  'billing.edit',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface PermissionGroup {
  module: string;
  label: string;
  permissions: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  { module: 'dashboard', label: 'Dashboard', permissions: ['dashboard.view'] },
  {
    module: 'users',
    label: 'User Management',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete'],
  },
  {
    module: 'roles',
    label: 'Roles & Privileges',
    permissions: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.assign'],
  },
  { module: 'analytics', label: 'Analytics', permissions: ['analytics.view'] },
  { module: 'reports', label: 'Reports', permissions: ['reports.view'] },
  { module: 'settings', label: 'Settings', permissions: ['settings.view', 'settings.edit'] },
  { module: 'billing', label: 'Billing', permissions: ['billing.view', 'billing.edit'] },
];

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  status: 'Active' | 'InActive';
  createdAt: string;
  updatedAt: string;
}

export enum LoginPanel {
  ADMIN = 'Admin',
  TRUSTEE = 'Trustee',
  USER = 'User',
}
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
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
  total: number;
  skip: number;
  take: number;
}

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
  status: RwaStatus;
  newRwaStatus?: RwaStatus;
  fractionalizationStatus?: string;
}
export interface AssetPrice {
  id: number;
  assetId: number;
  initialPricePerFraction: string;
  currentPricePerFraction: number;
}

export interface Asset {
  id: number;
  assetId: number;
  assetTitle?: string;
  currentOwnerName?: string;
  propertyInterest?: [];
  assetType?: string;
  assetSubType?: string | null;
  isSoldOut?: boolean;
  isVerified?: boolean;
  isMarketplace?: boolean;
  createdAt?: string;
  updatedAt?: string;
  meta?: AssetMeta[];
  documents?: AssetDocument[];
  ownershipModel?: string;
  rwaRequest: RwaRequest;
  status: AssetStatus;
  totalFractions?: number;
  soldFractions?: number;
  remainingFractions?: number;
  initialPricePerFraction?: number | string;
  currentPricePerFraction?: number | string;
  price?: AssetPrice;
  isSecondaryClubCreated?: boolean;
}
export type AssetRow = {
  id: number;
  assetId: number;
  assetName: string;
  ownerName: string;
  ownerKycStatus: 'Completed' | 'Pending' | 'Rejected';
  rwaStatus: RwaStatus;
  status: AssetStatus;
  createdAt: string;
  assetType: string;
  totalFractions?: number;
  soldFractions?: number;
  remainingFractions?: number;
  currentPricePerFraction?: number;
  initialPricePerFraction?: number;
  price?: AssetPrice;
  rwaRequest: RwaRequest;
  propertyInterest: [];
  marketValue: number;
  isSoldOut?: boolean;
  isMarketplace?: boolean;
};
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
  type: 'admin' | 'user';
}

export interface Admin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  profileImage: string | null;
  status: 'Active' | 'Inactive';
  type?: 'SuperAdmin' | 'SubAdmin';
  roleId?: number | null;
  role?: { id: number; name: string } | null;
  permissions?: string[];
  createdByAdminId?: number | null;
  createdAt: string;
  updatedAt: string;
  dialCode: string;
  mobile: string;
  country: string;
}

export interface PaginatedResponse<T> {
  count: number;
  skip: number;
  take: number;
  data: T[];
}

export interface Account {
  // [x: string]: string;
  [x: string]: any;
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
  licenseNumber: string;
  licenseExpiry: string;
  status: 'Active' | 'Suspended' | 'Blocked';
  createdAt: string;
  updatedAt: string;
  isDocumentUploaded: boolean;
}
export interface AccountDocument {
  // documentName: ReactI18NextChildren | Iterable<ReactI18NextChildren>;
  id: number;
  documentTypeId: number;
  companyId: number | null;
  directorId: number | null;
  accountId: number;
  documentName: string;

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

export enum KycStatus {
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
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
}
export interface ProfileFormData {
  firstname: string;
  lastname: string;
  email: string;

  country: string; // ✅ API field
  dialCode: string; // ✅ derived
  phone: string;
}

export interface RegisterUserPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  mobile: string;
  dialCode: string;
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
  methodType: 'Bank' | 'Upi';
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
  user?: {
    firstname: string;
    lastname: string;
    email: string;
  };
  proof?: string | null;
  name?: string;
  email?: string;
  mobile?: string;
  utrNumber?: string;
  account?: {
    firstname?: string;
    lastname?: string;
    email?: string;
    mobile?: string;
    phone?: string;
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

export interface Country {
  id: number;
  name: string;
  dialCode: string;
  isoCode: string;
  flag: string;
}

export type CountryData = Country[];

export type Notification = {
  id: number | string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  path?: string;
};

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
  createdAt: string;
  updatedAt: string;
  isDocumentUploaded: boolean;
}

export enum RwaStatus {
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
  LegalReviewed = 'LegalReviewed',
  ValuationReviewed = 'ValuationReviewed',
  DueDiligence = 'DueDiligence',
}
export enum AssetStatus {
  Draft = 'Draft',
  Available = 'Available',
  Funded = 'Funded',
  Exited = 'Exited',
  LegalReviewed = 'LegalReviewed',
  ValuationReviewed = 'ValuationReviewed',
  DueDiligence = 'DueDiligence',
  RequestLive = 'RequestLive',
}
export enum AssetType {
  All = 'All',
  RealEstate = 'RealEstate',
  Solar = 'Solar',
  Machinery = 'Machinery',
  EVFleet = 'EVFleet',
  Warehouse = 'Warehouse',
  Store = 'Store',
  Gold = 'Gold',
  Business = 'Business',
  IP = 'IP',
  Others = 'Others',
}

export type CouponStatus = 'Active' | 'InActive' | 'Scheduled' | 'Expired';

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'Percentage' | 'Fixed' | 'FractionBonus';
  discountValue: string; // keeping as string since API sends string
  bonusFractions: number | null;
  maxDiscountAmount: string;
  minPurchaseAmount: string;
  totalUsageLimit: number;
  perUserLimit: number;
  validFrom: string; // ISO date string
  validTill: string; // ISO date string
  isActive: boolean;
  isDeleted: boolean;
  createdByAdminId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
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

export type DiscountType = 'Percentage' | 'Fixed' | 'FractionBonus';

export interface CreateCouponPayload {
  code: string;
  description: string;

  discountType: DiscountType;
  discountValue: number;

  bonusFractions: number | null;
  maxDiscountAmount: number | null;

  minPurchaseAmount: number;
  totalUsageLimit: number;
  perUserLimit: number;

  validFrom: string; // ISO date string
  validTill: string; // ISO date string
}

/* ---------- Document ---------- */
export interface KycDocument {
  documentIdentifier: string;
  documentName: string;
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
  industryType: string;
  placeOfBusinessProofType: string;
  tradeLicenseExpiryDate: string;
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
  directorMeta: {
    panNumber: string | null;
  };
  firstname: string;
  lastname: string;
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
}

export interface Commission {
  commissionId: number;
  status: 'Confirmed' | 'Hold' | 'Pending';
  referralUsesType: string;
  baseAmount: string;
  commissionPct: string;
  commissionAmount: string;
  createdAt: string;
  campaignCode: string;
  investor: {
    id: number;
    name: string;
    email: string;
  };
  asset?: {
    id: number;
    title: string;
  };
}
