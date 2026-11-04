export interface EntityDocument {
    id: number;
    documentTypeId: number;
    companyId?: number | null;
    directorId?: number | null;
    accountId: number;
    url: string;
    documentIdentifier?: string | null;
    isVerified: boolean;
    remark?: string | null;
    uploadedAt: string;
    verifiedAt?: string | null;
    documentName: string;
    documentDeveloperName: string;
}

interface Meta {
    passportNumber?: string | null;
    panNumber?: string | null;
    emiratiId?: string | null;
    dateOfBirth?: string | null;
    monthlyIncome?: string | null;
    occupation?: string | null;
}

export interface Address {
    id: number;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    createdAt: string;
    updatedAt: string;
}

export interface Company {
    id: number;
    legalEntityName?: string;
    tradeName?: string;
    entityType?: string;
    cinOrTradeLicenseNo?: string;
    companyEmail?: string;
    companyPhone?: string;
}

export interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    dialCode?: string;
    mobile?: string;
    profileImage?: string;
    isVerified: boolean;
    countryId?: number;
    createdById?: number | null;
    isDeleted: boolean;
    type?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
    isDocumentUploaded?: boolean;
    currentAddressId?: number;
    permanentAddressId?: number | null;
    entityDocument?: EntityDocument[];
    meta?: Meta;
    isBankAdded?: boolean;
    isUpiAdded?: boolean;
    kycStatus?: string;
    kybStatus?: string;

    // broker
    referralCode?: string;
    referredCode?: string | null;
    entrySource?: string | null;
    currentAddress?: Address | null;
    permanentAddress?: string | null;
    kyc?: string | null;
    licenseNumber?: string | null;
    licenseExpiry?: string | null;
    hasLicense?: boolean;

    companies?: Company[];
}

export enum LoginPanel {
    ADMIN = 'Admin',
    TRUSTEE = 'Trustee',
    USER = 'User',
}

export enum AccountType {
    Company = 'Company',
    Developer = 'Developer',
    Business = 'Business',
    Spv = 'Spv',
    Broker = 'Broker',
    CorporateInvestor = 'CorporateInvestor',
    Trustee = 'Trustee',
    AssetOwner = 'AssetOwner',
    Director = 'Director',
}

export enum PaymentRequestType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAW = 'WITHDRAW',
}

export enum PaymentMethodType {
    BANK = 'BANK',
    UPI = 'UPI',
}

export enum DialCode {
    INDIA = '+91',
    UAE = '+971',
}

export enum UserType {
    Investor = 'Investor',
    AssetOwner = 'Asset Owner',
    ChannelPartner = 'Channel Partner',
}