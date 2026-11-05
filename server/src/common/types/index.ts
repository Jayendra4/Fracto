import { Request } from 'express';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AccountType } from '../../generated/prisma/client';

export enum NodeType {
  Master = 'master',
  Cluster = 'cluster',
}

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(NodeType)
  NODE_TYPE?: NodeType;

  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV?: Environment;

  @IsOptional()
  @IsEnum(Environment)
  APP_ENV?: Environment;

  @IsInt()
  PORT: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  CLUSTER_WORKERS?: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_URI: string;

  @IsString()
  STORAGE_DIR: string;
}

/**
 * ExcludeUndefinedIf<ExcludeUndefined, T>
 *
 * If `ExcludeUndefined` is `true`, remove `undefined` from `T`.
 * Otherwise, constructs the type `T` with `undefined`.
 */
export type ExcludeUndefinedIf<
  ExcludeUndefined extends boolean,
  T,
> = ExcludeUndefined extends true ? Exclude<T, undefined> : T | undefined;

export interface File {
  /** Name of the form field associated with this file. */
  fieldname: string;
  /** Name of the file on the uploader's computer. */
  originalname: string;
  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string;
  /** Value of the `Content-Type` header for this file. */
  mimetype: string;
  /** Size of the file in bytes. */
  size: number;
  /** `DiskStorage` only: Directory to which this file has been uploaded. */
  destination: string;
  /** `DiskStorage` only: Name of this file within `destination`. */
  filename: string;
  /** `DiskStorage` only: Full path to the uploaded file. */
  path: string;
}

export enum UserType {
  User = 'user',
  Admin = 'admin',
}
export enum Role {
  Admin = 'Admin',
  Company = 'company',
  Developer = 'developer',
  Spv = 'spv',
  Broker = 'broker',
  CorporateInvestor = 'corporate_investor',
  Trustee = 'trustee',
  AssetOwner = 'asset_owner',
  Director = 'director',
  Business = 'business',
}

export interface JwtPayload {
  readonly sub: number;
  readonly type: UserType | AccountType;
}

export interface ValidatedUser {
  readonly id: number;
  readonly type: UserType | AccountType;
}

export interface AuthenticatedUser {
  readonly id: number;
  readonly type: UserType | AccountType;
}

export interface Context {
  readonly user: AuthenticatedUser;
}

export interface AuthenticatedRequest extends Request {
  readonly user: AuthenticatedUser;
}

export enum NotificationCode {
  ONBOARDING_PENDING = 'ONBOARDING_PENDING',
  KYC_SUBMITTED = 'KYC_SUBMITTED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',

  // Dashboard
  PORTFOLIO_UPDATED = 'PORTFOLIO_UPDATED',
  INCOME_CREDITED = 'INCOME_CREDITED',

  // Property Discovery
  NEW_PROPERTY_LISTED = 'NEW_PROPERTY_LISTED',
  PROPERTY_FULLY_FUNDED = 'PROPERTY_FULLY_FUNDED',

  // Buy Fraction
  BUY_FRACTION_INITIATED = 'BUY_FRACTION_INITIATED',
  PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  FRACTION_ALLOCATED = 'FRACTION_ALLOCATED',

  // Wallet
  WALLET_CREDITED = 'WALLET_CREDITED',
  WALLET_DEBITED = 'WALLET_DEBITED',

  // Secondary Market
  SELL_ORDER_CREATED = 'SELL_ORDER_CREATED',
  SELL_ORDER_COMPLETED = 'SELL_ORDER_COMPLETED',

  // Risk & Compliance
  HIGH_RISK_TRANSACTION = 'HIGH_RISK_TRANSACTION',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',

  // System
  MAINTENANCE_ALERT = 'MAINTENANCE_ALERT',

  // Marketing
  INACTIVE_USER_REMINDER = 'INACTIVE_USER_REMINDER',

  // Share property in group
  ASSET_SHARE_IN_GROUP = 'ASSET_SHARE_IN_GROUP',

  // Missing Fields
  MISSING_FIELDS = 'MISSING_FIELDS',

  // Trustee Reviewe
  TRUSTEE_ASSET_REVIEWED = 'TRUSTEE_ASSET_REVIEWED',

  // User Registration Notification for User
  USER_REGISTRATION_NOTIFICATION = 'USER_REGISTRATION_NOTIFICATION',

  // Inform to Users
  INFORM_TO_USERS = 'INFORM_TO_USERS',

  // Withdraw Request approved
  WITHDRAWAL_REQUEST_APPROVED = 'WITHDRAWAL_REQUEST_APPROVED',

  // Deposit Request Approved
  DEPOSIT_REQUEST_APPROVED = 'DEPOSIT_REQUEST_APPROVED',
  DEPOSIT_REQUEST_REJECTED = 'DEPOSIT_REQUEST_REJECTED',

  //Withdraw Request REJECTED
  WITHDRAWAL_REQUEST_REJECTED = 'WITHDRAWAL_REQUEST_REJECTED',

  // Marketplace order matched
  ORDER_MATCHED_BID = 'ORDER_MATCHED_BID',
  ORDER_MATCHED_ASK = 'ORDER_MATCHED_ASK',

  // Notification to Asset owner and broker
  INFORM_TO_ASSET_OWNER_AND_BROKER = 'INFORM_TO_ASSET_OWNER_AND_BROKER',

  // Approved commssion by admin
  APPROVED_COMMISSION = 'APPROVED_COMMISSION',
  REJECTED_COMMISSION = 'REJECTED_COMMISSION',

  // Marketplace listed
  ASSET_IN_MARKETPLACE_LISTED = 'ASSET_IN_MARKETPLACE_LISTED',

  // Asset fractionalize by admin
  ASSET_FRACTIONIZE = 'ASSET_FRACTIONIZE',

  // Asset reviewed by trustee
  RWA_ASSET_REVIEWED_BY_TRUSTEE = 'RWA_ASSET_REVIEWED_BY_TRUSTEE',
  RWA_ASSET_REJECTED_BY_TRUSTEE = 'RWA_ASSET_REJECTED_BY_TRUSTEE',

  RWA_ASSET_REVIEWED_BY_ADMIN = 'RWA_ASSET_REVIEWED_BY_ADMIN',
  RWA_ASSET_REJECTED_BY_ADMIN = 'RWA_ASSET_REJECTED_BY_ADMIN',

  // SPV governance
  SPV_VOTING_REMINDER = 'SPV_VOTING_REMINDER',
  SPV_CREATED = 'SPV_CREATED',
  SPV_CREATED_TRUSTEE = 'SPV_CREATED_TRUSTEE',

  ADMIN_MANUAL_PAYMENT_VERIFY_FOR_DOC = 'ADMIN_MANUAL_PAYMENT_VERIFY_FOR_DOC',

  // Live
  ADMIN_APPROVED_LIVE_REQUEST = 'ADMIN_APPROVED_LIVE_REQUEST',
  ADMIN_REJECTED_LIVE_REQUEST = 'ADMIN_REJECTED_LIVE_REQUEST',

  INFORM_TO_ASSET_OWNER = 'INFORM_TO_ASSET_OWNER',

  // Accept nda
  ACCEPT_NDA = 'ACCEPT_NDA',

  // BASIC_INFORM_APPROVED
  BASIC_INFORM_APPROVED = 'BASIC_INFORM_APPROVED',

  // BASIC_INFORM_REJECTED
  BASIC_INFORM_REJECTED = 'BASIC_INFORM_REJECTED',

  // Secondary-market trade settlement awaiting trustee approval
  REQUEST_FOR_TRUSTEE_APPROVED = 'REQUEST_FOR_TRUSTEE_APPROVED',

  // Trustee approved settlement — seller's funds released
  SETTLEMENT_APPROVED = 'SETTLEMENT_APPROVED',

  // PAYOUT_REQUEST_REJECTED
  PAYOUT_REQUEST_REJECTED = 'PAYOUT_REQUEST_REJECTED',

  // PAYOUT_REQUEST_APPROVED
  PAYOUT_REQUEST_APPROVED = 'PAYOUT_REQUEST_APPROVED',

  // Potential Ask+Bid match found by the match engine, awaiting Trustee approval
  MARKETPLACE_MATCH_PENDING_TRUSTEE_APPROVAL = 'MARKETPLACE_MATCH_PENDING_TRUSTEE_APPROVAL',

  // Trustee rejected a potential Ask+Bid match
  MARKETPLACE_MATCH_REJECTED = 'MARKETPLACE_MATCH_REJECTED',
}

export const NotificationTemplates: Record<
  NotificationCode,
  {
    title: string;
    message: string;
  }
> = {
  [NotificationCode.ONBOARDING_PENDING]: {
    title: 'Complete Your Onboarding',
    message:
      'Your onboarding is incomplete. Complete it to start investing in properties.',
  },

  [NotificationCode.KYC_SUBMITTED]: {
    title: 'KYC Submitted',
    message:
      'Your KYC details have been submitted successfully and are under review.',
  },

  [NotificationCode.KYC_APPROVED]: {
    title: 'KYC Approved',
    message:
      'Congratulations! Your KYC has been approved. You can now invest in properties.',
  },

  [NotificationCode.KYC_REJECTED]: {
    title: 'KYC Action Required',
    message:
      'Your KYC verification could not be completed. Please update the required documents.',
  },

  // Dashboard
  [NotificationCode.PORTFOLIO_UPDATED]: {
    title: 'Portfolio Updated',
    message:
      'Your investment portfolio has been updated with the latest values and returns.',
  },

  [NotificationCode.INCOME_CREDITED]: {
    title: 'Income Credited',
    message:
      '₹{{amount}} has been credited to your wallet from your property investment.',
  },

  // Property
  [NotificationCode.NEW_PROPERTY_LISTED]: {
    title: 'New Investment Opportunity',
    message:
      'A new property is now available for fractional investment. Explore before it’s fully subscribed.',
  },

  [NotificationCode.PROPERTY_FULLY_FUNDED]: {
    title: 'Property Fully Funded',
    message:
      'This property is now fully funded. Explore other available opportunities.',
  },

  // Buy Fraction
  [NotificationCode.BUY_FRACTION_INITIATED]: {
    title: 'Investment Initiated',
    message: 'User {{userName}} invested in your {{propertyName}}.',
  },

  [NotificationCode.PAYMENT_SUCCESSFUL]: {
    title: 'Investment Confirmed',
    message:
      'Your investment of ₹{{amount}} in {{propertyName}} has been successfully completed.',
  },

  [NotificationCode.PAYMENT_FAILED]: {
    title: 'Payment Failed',
    message:
      'Your payment could not be processed. Please try again or use a different payment method.',
  },

  [NotificationCode.FRACTION_ALLOCATED]: {
    title: 'Fraction Allocated',
    message:
      'You now own {{fraction}}% of {{propertyName}}. View details in your dashboard.',
  },

  // Wallet
  [NotificationCode.WALLET_CREDITED]: {
    title: 'Wallet Credited',
    message: '₹{{amount}} has been added to your wallet.',
  },

  [NotificationCode.WALLET_DEBITED]: {
    title: 'Wallet Debited',
    message: '₹{{amount}} has been deducted from your wallet for {{purpose}}.',
  },

  // Secondary Market
  [NotificationCode.SELL_ORDER_CREATED]: {
    title: 'Sell Order Created',
    message: 'Your fraction has been listed for sale successfully.',
  },

  [NotificationCode.SELL_ORDER_COMPLETED]: {
    title: 'Fraction Sold',
    message:
      'Your fraction of {{propertyName}} has been sold. Funds have been credited to your wallet.',
  },

  // Risk & System
  [NotificationCode.HIGH_RISK_TRANSACTION]: {
    title: 'Transaction Alert',
    message:
      'A high-value transaction was detected on your account. Please review the details.',
  },

  [NotificationCode.ACCOUNT_SUSPENDED]: {
    title: 'Account Temporarily Restricted',
    message:
      'Your account has been temporarily restricted due to compliance review.',
  },

  [NotificationCode.MAINTENANCE_ALERT]: {
    title: 'Scheduled Maintenance',
    message:
      'Some services may be unavailable on {{date}} due to scheduled maintenance.',
  },

  [NotificationCode.INACTIVE_USER_REMINDER]: {
    title: 'We Miss You!',
    message:
      'New investment opportunities are waiting for you on Fracto.',
  },

  [NotificationCode.ASSET_SHARE_IN_GROUP]: {
    title: 'New Investment Opportunity',
    message:
      'A new asset {{propertyName}} is now available in your group. Explore and invest.',
  },

  [NotificationCode.MISSING_FIELDS]: {
    title: 'Missing Fields in RWA Form',
    message: 'You have missed {{fieldName}} in RWA Form',
  },

  [NotificationCode.TRUSTEE_ASSET_REVIEWED]: {
    title: 'Reveiwed Pending RWA Form',
    message: '{{AssetName}} is listed for verfication',
  },

  [NotificationCode.USER_REGISTRATION_NOTIFICATION]: {
    title: 'Welcome to Fracto!',
    message:
      'Hi {{userName}}, welcome to Fracto. Please complete your KYC to Explore',
  },

  [NotificationCode.INFORM_TO_USERS]: {
    title: 'New Group Created',
    message: 'Hello Users, New {{groupName}} group is created. Exploring now.',
  },

  [NotificationCode.WITHDRAWAL_REQUEST_APPROVED]: {
    title: 'Withdrawl Request Approved',
    message: 'Your Withdraw request approved successfully...',
  },

  [NotificationCode.WITHDRAWAL_REQUEST_REJECTED]: {
    title: 'Withdrawl Request Rejected',
    message: 'Your Withdraw request Rejected.',
  },

  [NotificationCode.DEPOSIT_REQUEST_REJECTED]: {
    title: 'Deposit Request Rejected',
    message: 'Your Deposit request Rejected.',
  },

  [NotificationCode.ORDER_MATCHED_BID]: {
    title: 'Buy Order Matched',
    message:
      'Your buy order for {{units}} unit(s) of {{assetTitle}} has been matched at ₹{{pricePerUnit}} per unit.',
  },

  [NotificationCode.ORDER_MATCHED_ASK]: {
    title: 'Sell Order Matched',
    message:
      'Your sell order for {{units}} unit(s) of {{assetTitle}} has been matched at ₹{{pricePerUnit}} per unit. ₹{{netAmount}} has been credited to your wallet.',
  },

  [NotificationCode.INFORM_TO_ASSET_OWNER_AND_BROKER]: {
    title: 'Admin approved the broker commission',
    message: 'Admin approved the broker commission',
  },

  [NotificationCode.APPROVED_COMMISSION]: {
    title: 'Admin approved the broker commission',
    message: 'Admin approved the broker commission',
  },

  [NotificationCode.REJECTED_COMMISSION]: {
    title: 'Admin rejected the broker commission',
    message: 'Admin rejected the broker commission',
  },

  [NotificationCode.ASSET_IN_MARKETPLACE_LISTED]: {
    title: 'Asset listed in marketplace',
    message: 'Asset listed in marketplace.Explore Now.',
  },

  [NotificationCode.ASSET_FRACTIONIZE]: {
    title: 'Asset fractionalize successfully',
    message: 'Asset {{name}} fractionalize successfully.',
  },

  [NotificationCode.RWA_ASSET_REVIEWED_BY_TRUSTEE]: {
    title: 'Asset successfully reviewed',
    message: 'Asset {{name}} reviewed successfully by trustee.',
  },

  [NotificationCode.RWA_ASSET_REJECTED_BY_TRUSTEE]: {
    title: 'Asset Rejected',
    message: 'Asset {{name}} rejected by trustee.',
  },

  [NotificationCode.RWA_ASSET_REVIEWED_BY_ADMIN]: {
    title: 'Asset successfully reviewed',
    message: 'Asset {{name}} reviewed successfully by Admin.',
  },

  [NotificationCode.RWA_ASSET_REJECTED_BY_ADMIN]: {
    title: 'Asset Rejected',
    message: 'Asset {{name}} rejected by Admin.',
  },

  [NotificationCode.DEPOSIT_REQUEST_APPROVED]: {
    title: 'Deposit Request Approved',
    message: 'Your Deposit request approved successfully...',
  },

  [NotificationCode.SPV_VOTING_REMINDER]: {
    title: 'Voting Reminder',
    message:
      'Reminder: Your vote for {{assetTitle}} under {{spvName}} is still pending. Please submit your vote.',
  },

  [NotificationCode.SPV_CREATED]: {
    title: 'SPV Created',
    message:
      'An SPV {{spvName}} has been created for {{assetTitle}}. You are a shareholder as an eligible voter.',
  },

  [NotificationCode.SPV_CREATED_TRUSTEE]: {
    title: 'New SPV Created',
    message:
      'SPV {{spvName}} has been created for {{assetTitle}}. Please review the shareholder register.',
  },

  [NotificationCode.ADMIN_MANUAL_PAYMENT_VERIFY_FOR_DOC]: {
    title: 'Document Verification Amount Verified',
    message: 'Document verification amount verified for {{assetTitle}}',
  },

  [NotificationCode.ADMIN_APPROVED_LIVE_REQUEST]: {
    title: 'Admin approved the live request',
    message: 'Admin approved the live request for {{assetTitle}}',
  },

  [NotificationCode.ADMIN_REJECTED_LIVE_REQUEST]: {
    title: 'Admin rejected the live request',
    message: 'Admin rejected the live request for {{assetTitle}}',
  },

  [NotificationCode.INFORM_TO_ASSET_OWNER]: {
    title: 'Secondary Club is now created',
    message: 'Secondary Club is created for club {{assetTitle}}',
  },

  [NotificationCode.ACCEPT_NDA]: {
    title: 'NDA Consent is approved by Admin',
    message: 'NDA Consent is approved for club {{assetTitle}}',
  },

  [NotificationCode.BASIC_INFORM_APPROVED]: {
    title: 'Asset Basic details approved by Admin',
    message: 'Asset {{assetTitle}} Basic details approved by Admin.',
  },
  [NotificationCode.BASIC_INFORM_REJECTED]: {
    title: 'Asset Basic details rejected by Admin',
    message: 'Asset {{assetTitle}} Basic details rejected by Admin.',
  },

  [NotificationCode.REQUEST_FOR_TRUSTEE_APPROVED]: {
    title: 'Secondary Settlement Awaiting Approval',
    message:
      'A trade for {{assetTitle}} ({{units}} units) needs your approval to settle.',
  },

  [NotificationCode.SETTLEMENT_APPROVED]: {
    title: 'Funds Released',
    message:
      '₹{{netAmount}} from your sale of {{assetTitle}} has been released to your wallet.',
  },

  [NotificationCode.MARKETPLACE_MATCH_PENDING_TRUSTEE_APPROVAL]: {
    title: 'Potential Match Awaiting Approval',
    message:
      'A potential match for {{assetTitle}} ({{matchedQuantity}} units @ ₹{{tradePrice}}) needs your approval.',
  },

  [NotificationCode.MARKETPLACE_MATCH_REJECTED]: {
    title: 'Match Rejected',
    message:
      'Your potential match for {{assetTitle}} was rejected by the trustee. Reason: {{rejectionReason}}',
  },

  [NotificationCode.PAYOUT_REQUEST_REJECTED]: {
    title: 'Payout request rejected',
    message: 'Your payout requested rejected by admin',
  },
  [NotificationCode.PAYOUT_REQUEST_APPROVED]: {
    title: 'Payout request approved',
    message: 'Your payout requested approved by admin',
  },
};

// Client-side navigation target per notification code, resolved by
// interpolating `{{key}}` placeholders against the same `data` object passed
// to `_sendNotification`/`sendNotification` (same interpolation as the
// templates above). `null` means the code has no single navigable
// destination (e.g. broad system alerts) — the frontend should just open the
// notification center in that case. A code with no entry here is treated the  user-management
// same as `null`.
export const NotificationPaths: Partial<
  Record<NotificationCode, string | null>
> = {
  [NotificationCode.ONBOARDING_PENDING]: '/onboarding',
  [NotificationCode.KYC_SUBMITTED]: '/kyc',
  [NotificationCode.KYC_APPROVED]: '/dashboard/kyc',
  [NotificationCode.KYC_REJECTED]: '/dashboard/kyc',
  [NotificationCode.PORTFOLIO_UPDATED]: '/portfolio',
  [NotificationCode.INCOME_CREDITED]: '/wallet',

  [NotificationCode.NEW_PROPERTY_LISTED]: '/assets',
  [NotificationCode.PROPERTY_FULLY_FUNDED]: '/property-details/{{assetId}}',

  [NotificationCode.BUY_FRACTION_INITIATED]:
    '/dashboard/PropertyFractionDetails/{{assetId}}',
  [NotificationCode.PAYMENT_SUCCESSFUL]: '/portfolio',
  [NotificationCode.PAYMENT_FAILED]: '/wallet',
  [NotificationCode.FRACTION_ALLOCATED]: '/portfolio',

  [NotificationCode.WALLET_CREDITED]: '/wallet',
  [NotificationCode.WALLET_DEBITED]: '/wallet',

  [NotificationCode.SELL_ORDER_CREATED]: '/dashboard/marketplace/{{assetId}}',
  [NotificationCode.SELL_ORDER_COMPLETED]: '/dashboard/marketplace/{{assetId}}',

  [NotificationCode.HIGH_RISK_TRANSACTION]: '/wallet',
  [NotificationCode.ACCOUNT_SUSPENDED]: '/account',
  [NotificationCode.MAINTENANCE_ALERT]: null,
  [NotificationCode.INACTIVE_USER_REMINDER]: '/assets',

  [NotificationCode.ASSET_SHARE_IN_GROUP]: '/primary-club-details/{{groupId}}',
  [NotificationCode.MISSING_FIELDS]: '/assets/{{assetId}}',
  [NotificationCode.TRUSTEE_ASSET_REVIEWED]: '/assets/{{assetId}}',
  [NotificationCode.USER_REGISTRATION_NOTIFICATION]: '/dashboard/kyc',

  [NotificationCode.WITHDRAWAL_REQUEST_APPROVED]: '/dashboard/wallet',
  [NotificationCode.WITHDRAWAL_REQUEST_REJECTED]: '/dashboard/wallet',
  [NotificationCode.DEPOSIT_REQUEST_APPROVED]: '/dashboard/wallet',
  [NotificationCode.DEPOSIT_REQUEST_REJECTED]: '/dashboard/wallet',

  [NotificationCode.ORDER_MATCHED_BID]: '/dashboard/marketplace/{{assetId}}',
  [NotificationCode.ORDER_MATCHED_ASK]: '/dashboard/marketplace/{{assetId}}',
  [NotificationCode.MARKETPLACE_MATCH_REJECTED]:
    '/dashboard/marketplace/{{assetId}}',

  [NotificationCode.INFORM_TO_ASSET_OWNER_AND_BROKER]:
    '/dashboard/my-referrals',
  [NotificationCode.APPROVED_COMMISSION]: '/dashboard/my-referrals', //
  [NotificationCode.REJECTED_COMMISSION]:
    '/dashboard/rwa/referred-assets/{{assetId}}',

  [NotificationCode.ASSET_IN_MARKETPLACE_LISTED]: '/dashboard/marketplace',
  [NotificationCode.ASSET_FRACTIONIZE]: '/property-details/{{assetId}}',

  [NotificationCode.RWA_ASSET_REVIEWED_BY_TRUSTEE]:
    '/dashboard/add-asset?id={{assetId}}&step=6',
  [NotificationCode.RWA_ASSET_REJECTED_BY_TRUSTEE]:
    '/dashboard/add-asset?id={{assetId}}&step=5',
  [NotificationCode.RWA_ASSET_REVIEWED_BY_ADMIN]:
    '/dashboard/add-asset?id={{assetId}}&step=2',
  [NotificationCode.RWA_ASSET_REJECTED_BY_ADMIN]:
    '/dashboard/add-asset?id={{assetId}}&step=2',

  [NotificationCode.SPV_VOTING_REMINDER]: '/spv/{{spvId}}',
  [NotificationCode.SPV_CREATED]: '/dashboard/spv-list',
  [NotificationCode.SPV_CREATED_TRUSTEE]: '/spv-list',

  [NotificationCode.ADMIN_MANUAL_PAYMENT_VERIFY_FOR_DOC]:
    '/property-details/{{assetId}}',

  [NotificationCode.INFORM_TO_ASSET_OWNER]: '/dashboard/my-club',

  [NotificationCode.ACCEPT_NDA]:
    '/dashboard/my-club/{{assetId}}?clubId={{clubId}}',

  [NotificationCode.BASIC_INFORM_APPROVED]:
    '/dashboard/add-asset?id={{assetId}}&step=2',

  [NotificationCode.BASIC_INFORM_REJECTED]:
    '/dashboard/add-asset?id={{assetId}}&step=2',

  [NotificationCode.ADMIN_APPROVED_LIVE_REQUEST]: '/dashboard/my-assets',

  [NotificationCode.ADMIN_REJECTED_LIVE_REQUEST]: '/dashboard/my-assets',

  [NotificationCode.SETTLEMENT_APPROVED]: '/dashboard/wallet',

  [NotificationCode.PAYOUT_REQUEST_APPROVED]: '/dashboard/payout-requests',

  [NotificationCode.PAYOUT_REQUEST_REJECTED]: '/dashboard/payout-requests',
};

export enum AdminNotificationCode {
  // Transactions
  DEPOSIT_REQUEST_RAISED = 'ADMIN_DEPOSIT_REQUEST_RAISED', // Done
  WITHDRAWAL_REQUEST_RAISED = 'ADMIN_WITHDRAWAL_REQUEST_RAISED', // Done
  DIRECT_PAYMENT_FOR_GROUP = 'DIRECT_PAYMENT_FOR_GROUP', // Done
  DOCUMENT_VERIFICATION_CHARGE = 'DOCUMENT_VERIFICATION_CHARGE', // not in use

  // RWA & Property
  RWA_DRAFTED = 'ADMIN_RWA_DRAFTED',
  RWA_SUBMITTED = 'ADMIN_RWA_SUBMITTED',
  RWA_APPROVED = 'ADMIN_RWA_APPROVED',
  RWA_REJECTED = 'ADMIN_RWA_REJECTED',
  PROPERTY_CREATED = 'ADMIN_PROPERTY_CREATED',
  PROPERTY_LISTED = 'ADMIN_PROPERTY_LISTED',
  PROPERTY_FULLY_FUNDED = 'ADMIN_PROPERTY_FULLY_FUNDED',
  PROPERTY_EXITED = 'ADMIN_PROPERTY_EXITED',

  // Trustee KYC
  TRUSTEE_KYC_SUBMITTED = 'ADMIN_TRUSTEE_KYC_SUBMITTED',
  TRUSTEE_KYC_UNDER_REVIEW = 'ADMIN_TRUSTEE_KYC_UNDER_REVIEW',
  TRUSTEE_KYC_APPROVED = 'ADMIN_TRUSTEE_KYC_APPROVED',
  TRUSTEE_KYC_REJECTED = 'ADMIN_TRUSTEE_KYC_REJECTED',
  TRUSTEE_REVERIFY_REQUIRED = 'ADMIN_TRUSTEE_REVERIFY_REQUIRED',

  // Director KYB and Company KYC
  COMPANY_KYB_SUBMITTED = 'COMPANY_KYB_SUBMITTED',
  DIRECTOR_KYC_SUBMITTED = 'DIRECTOR_KYC_SUBMITTED',

  // Asset Owner
  KYC_SUBMITTED = 'ADMIN_KYC_SUBMITTED',

  // System
  USER_PROFILE_UPDATED = 'ADMIN_USER_PROFILE_UPDATED',
  DATA_EXPORTED = 'ADMIN_DATA_EXPORTED',
  RECORD_DELETED = 'ADMIN_RECORD_DELETED',

  // User Registration Notification
  REGISTRATION_NOTIFICATION = 'REGISTRATION_NOTIFICATION',

  // Immeidate sell
  IMMEDIATE_SELL = 'IMMEDIATE_SELL',

  // Asset Owner approved the asset inform to admin and borker
  INFORM_TO_BROKER_AND_ADMIN = 'INFORM_TO_BROKER_AND_ADMIN',

  REJECT_INFORM_TO_BROKER_AND_ADMIN = 'REJECT_INFORM_TO_BROKER_AND_ADMIN',

  // For Admin
  ADMIN_MANUAL_PAYMENT_FOR_DOCUMENT = 'ADMIN_MANUAL_PAYMENT_FOR_DOCUMENT',

  // For Request live
  REQUEST_LIVE = 'REQUEST_LIVE',

  // NDA consonet
  VOTE_PLUS_NDA_CONSENT = 'VOTE_PLUS_NDA_CONSENT',

  // Join group
  JOIN_GROUP_BY_USER = 'JOIN_GROUP_BY_USER',

  // RWA_FILLED FULL DETAILS
  RWA_FILLED_FULL_DETAILS = 'RWA_FILLED_FULL_DETAILS',

  // PAYOUT_REQUESTED
  PAYOUT_REQUESTED = 'PAYOUT_REQUESTED',
}

export const AdminNotificationTemplates: Record<
  AdminNotificationCode,
  {
    title: string;
    message: string;
  }
> = {
  // Transactions
  [AdminNotificationCode.DEPOSIT_REQUEST_RAISED]: {
    title: 'Deposit Request Raised',
    message: 'Deposit request of ₹{{amount}} raised by {{userName}}.',
  },

  [AdminNotificationCode.WITHDRAWAL_REQUEST_RAISED]: {
    title: 'Withdrawal Request Raised',
    message: 'Withdrawal request of ₹{{amount}} raised by {{userName}}.',
  },

  [AdminNotificationCode.DIRECT_PAYMENT_FOR_GROUP]: {
    title: 'Group Payment Request Raised',
    message: 'Payment request of ₹{{amount}} raised by {{userName}}.',
  },

  // RWA & Property
  [AdminNotificationCode.RWA_DRAFTED]: {
    title: 'RWA Drafted',
    message: 'New RWA {{assetTitle}} is drafted.',
  },

  [AdminNotificationCode.RWA_SUBMITTED]: {
    title: 'RWA Submitted',
    message: 'New RWA {{assetTitle}} is submitted.',
  },

  [AdminNotificationCode.RWA_APPROVED]: {
    title: 'RWA Approved',
    message: 'RWA approved for asset {{assetName}}.',
  },

  [AdminNotificationCode.RWA_REJECTED]: {
    title: 'RWA Rejected',
    message: 'RWA rejected for asset {{assetName}}. Reason: {{reason}}.',
  },

  [AdminNotificationCode.PROPERTY_CREATED]: {
    title: 'Property Created',
    message: 'Property {{propertyName}} added to the platform.',
  },

  [AdminNotificationCode.PROPERTY_LISTED]: {
    title: 'Property Live',
    message: 'Property {{propertyName}} is now live for investment.',
  },

  [AdminNotificationCode.PROPERTY_FULLY_FUNDED]: {
    title: 'Property Fully Funded',
    message: 'Property {{propertyName}} has been fully funded.',
  },

  [AdminNotificationCode.PROPERTY_EXITED]: {
    title: 'Property Exited',
    message:
      'Property {{propertyName}} successfully exited. Returns distributed.',
  },

  // Trustee KYC
  [AdminNotificationCode.TRUSTEE_KYC_SUBMITTED]: {
    title: 'Trustee KYC Submitted',
    message: 'Trustee {{trusteeName}} has submitted KYC. Approval required.',
  },

  [AdminNotificationCode.TRUSTEE_KYC_UNDER_REVIEW]: {
    title: 'Trustee KYC Under Review',
    message: 'Trustee KYC for {{trusteeName}} is under review.',
  },

  [AdminNotificationCode.TRUSTEE_KYC_APPROVED]: {
    title: 'Trustee KYC Approved',
    message: 'Trustee KYC approved for {{trusteeName}}.',
  },

  [AdminNotificationCode.TRUSTEE_KYC_REJECTED]: {
    title: 'Trustee KYC Rejected',
    message: 'Trustee KYC rejected for {{trusteeName}}. Reason: {{reason}}.',
  },

  [AdminNotificationCode.TRUSTEE_REVERIFY_REQUIRED]: {
    title: 'Re-verification Required',
    message: 'Additional documents required for Trustee {{trusteeName}}.',
  },

  // System
  [AdminNotificationCode.USER_PROFILE_UPDATED]: {
    title: 'User Profile Updated',
    message: 'Profile updated by {{userName}}.',
  },

  [AdminNotificationCode.DATA_EXPORTED]: {
    title: 'Data Exported',
    message: 'Data exported by {{adminName}}.',
  },

  [AdminNotificationCode.RECORD_DELETED]: {
    title: 'Record Deleted',
    message: 'Record deleted by {{adminName}}.',
  },

  [AdminNotificationCode.REGISTRATION_NOTIFICATION]: {
    title: 'New User Registration',
    message: '{{userName}} has registered on the platform.',
  },

  [AdminNotificationCode.DIRECTOR_KYC_SUBMITTED]: {
    title: 'Director KYC Submitted',
    message: 'Director {{directorName}} has submitted KYC. Approval required.',
  },

  [AdminNotificationCode.KYC_SUBMITTED]: {
    title: 'KYC Submitted',
    message: 'User {{userName}} has submitted KYC. Approval required.',
  },

  [AdminNotificationCode.COMPANY_KYB_SUBMITTED]: {
    title: 'Company KYB Submitted',
    message: 'User {{userName}} has submitted KYB. Approval required.',
  },

  [AdminNotificationCode.DOCUMENT_VERIFICATION_CHARGE]: {
    title: 'Document Verification Charge',
    message: 'User {{userName}} has charged for {{propertyName}}.',
  },

  [AdminNotificationCode.IMMEDIATE_SELL]: {
    title: 'Immediate sell',
    message:
      'User {{userName}} raised a requst for immediate selling for {{propertyName}}.',
  },

  [AdminNotificationCode.INFORM_TO_BROKER_AND_ADMIN]: {
    title: 'Asset Owner approved the Asset',
    message: 'Asset Owner approved the {{assetTitle}} asset.',
  },

  [AdminNotificationCode.REJECT_INFORM_TO_BROKER_AND_ADMIN]: {
    title: 'Asset Owner rejected the Asset',
    message: 'Asset Owner rejected the {{assetTitle}} asset.',
  },

  [AdminNotificationCode.ADMIN_MANUAL_PAYMENT_FOR_DOCUMENT]: {
    title: 'Investor Payment to View Document List',
    message:
      'Investor has created a payment for the {{assetTitle}} asset to view the document list.',
  },

  [AdminNotificationCode.REQUEST_LIVE]: {
    title: 'Asset Owner is requested for asset live',
    message: 'Asset Owner is requested for asset live {{assetTitle}}',
  },

  [AdminNotificationCode.VOTE_PLUS_NDA_CONSENT]: {
    title: 'User has submitted NDA consent for asset',
    message: 'User has submitted NDA for {{assetTitle}}',
  },

  [AdminNotificationCode.JOIN_GROUP_BY_USER]: {
    title: 'User has joined the group',
    message: 'User has joined the group',
  },

  [AdminNotificationCode.RWA_FILLED_FULL_DETAILS]: {
    title: 'User filled Asset full details',
    message: 'User filled Asset full details',
  },
  [AdminNotificationCode.PAYOUT_REQUESTED]: {
    title: 'User requested for payout',
    message: 'User requested for payout',
  },
};

// Admin-console navigation paths, same interpolation convention as
// NotificationPaths above.
export const AdminNotificationPaths: Partial<
  Record<AdminNotificationCode, string | null>
> = {
  [AdminNotificationCode.DEPOSIT_REQUEST_RAISED]: '/deposit-request',
  [AdminNotificationCode.WITHDRAWAL_REQUEST_RAISED]: '/withdraw-request',
  [AdminNotificationCode.DIRECT_PAYMENT_FOR_GROUP]: '/admin/payment-requests',
  [AdminNotificationCode.DOCUMENT_VERIFICATION_CHARGE]:
    '/admin/payment-requests',

  [AdminNotificationCode.RWA_DRAFTED]:
    '/group/detail/{{groupId}}?tab=investedAssets',
  [AdminNotificationCode.RWA_SUBMITTED]:
    '/group/detail/{{groupId}}?tab=investedAssets',
  [AdminNotificationCode.RWA_APPROVED]: '/admin/assets',
  [AdminNotificationCode.RWA_REJECTED]: '/admin/assets',
  [AdminNotificationCode.PROPERTY_CREATED]: '/admin/assets',
  [AdminNotificationCode.PROPERTY_LISTED]: '/admin/assets',
  [AdminNotificationCode.PROPERTY_FULLY_FUNDED]: '/admin/assets',
  [AdminNotificationCode.PROPERTY_EXITED]: '/admin/assets',

  [AdminNotificationCode.TRUSTEE_KYC_SUBMITTED]: '/admin/trustees',
  [AdminNotificationCode.TRUSTEE_KYC_UNDER_REVIEW]: '/admin/trustees',
  [AdminNotificationCode.TRUSTEE_KYC_APPROVED]: '/admin/trustees',
  [AdminNotificationCode.TRUSTEE_KYC_REJECTED]: '/admin/trustees',
  [AdminNotificationCode.TRUSTEE_REVERIFY_REQUIRED]: '/admin/trustees',

  [AdminNotificationCode.COMPANY_KYB_SUBMITTED]: '/kyc?subTab=company',
  [AdminNotificationCode.DIRECTOR_KYC_SUBMITTED]: '/kyc?subTab=company',
  // [AdminNotificationCode.KYC_SUBMITTED]: '/kyc',

  [AdminNotificationCode.USER_PROFILE_UPDATED]: '/user-management',
  [AdminNotificationCode.DATA_EXPORTED]: '/admin/exports',
  [AdminNotificationCode.RECORD_DELETED]: '/admin/audit-log',

  [AdminNotificationCode.REGISTRATION_NOTIFICATION]: '/user-management',
  [AdminNotificationCode.IMMEDIATE_SELL]: '/admin/marketplace',

  [AdminNotificationCode.ADMIN_MANUAL_PAYMENT_FOR_DOCUMENT]: '/manual-payments',

  [AdminNotificationCode.JOIN_GROUP_BY_USER]:
    '/group/detail/{{groupId}}?tab=accountStatement',

  [AdminNotificationCode.RWA_FILLED_FULL_DETAILS]:
    '/asset-list/assets/{{assetId}}',

  [AdminNotificationCode.REQUEST_LIVE]:
    '/group/detail/{{groupId}}?tab=investedAssets',

  [AdminNotificationCode.VOTE_PLUS_NDA_CONSENT]: '/nda-consent',

  [AdminNotificationCode.PAYOUT_REQUESTED]: '/users/Broker/detail/{{assetId}}',
};

export type DeviceToken = {
  token: string;
  userId: number;
};

export enum NotificationAudience {
  USER = 'USER',
  ADMIN = 'ADMIN',
  BOTH = 'BOTH',
  ALL = 'ALL',
}

export const AllNotificationTemplates = {
  ...NotificationTemplates,
  ...AdminNotificationTemplates,
} as const;

export const AllNotificationPaths: Partial<
  Record<AnyNotificationCode, string | null>
> = {
  ...NotificationPaths,
  ...AdminNotificationPaths,
};

export type AnyNotificationCode = NotificationCode | AdminNotificationCode;

// A single Notification row can be shared by more than one audience (e.g.
// admin + trustee, via NotificationAudience.BOTH) but stores only one
// `path`. Each code's entry here maps a viewer role to the destination that
// role should land on for that code — resolved with the same
// {{placeholder}} interpolation as the stored path. A role with no entry
// for a given code falls back to the notification's stored path unchanged
// (e.g. the primary recipient the code's default NotificationPaths /
// AdminNotificationPaths entry was written for).
export const NotificationViewerPathOverrides: Partial<
  Record<
    AnyNotificationCode,
    Partial<Record<UserType | AccountType, string | null>>
  >
> = {
  [AdminNotificationCode.RWA_DRAFTED]: {
    [AccountType.Trustee]: '/asset-list',
  },
  [AdminNotificationCode.RWA_SUBMITTED]: {
    [AccountType.Trustee]: '/asset-list',
    [UserType.Admin]: '/group/detail/{{groupId}}?tab=investedAssets',
  },
  [AdminNotificationCode.RWA_FILLED_FULL_DETAILS]: {
    [AccountType.Trustee]: '/asset-list/asset-detail/{{assetId}}',
  },
  [NotificationCode.RWA_ASSET_REVIEWED_BY_TRUSTEE]: {
    [UserType.Admin]: '/asset-list/assets/{{assetId}}',
    [AccountType.Trustee]: null,
  },
  [NotificationCode.RWA_ASSET_REJECTED_BY_TRUSTEE]: {
    [UserType.Admin]: '/asset-list/assets/{{assetId}}',
    [AccountType.Trustee]: null,
  },

  [NotificationCode.INFORM_TO_USERS]: {
    [AccountType.Trustee]: null,
    [AccountType.AssetOwner]: '/primary-club-details/{{groupId}}',
    [AccountType.Broker]: '/primary-club-details/{{groupId}}',
    [AccountType.Business]: '/primary-club-details/{{groupId}}',
    [AccountType.Company]: '/primary-club-details/{{groupId}}',
    [AccountType.CorporateInvestor]: '/primary-club-details/{{groupId}}',
  },

  [NotificationCode.SPV_CREATED_TRUSTEE]: {
    [UserType.Admin]: '/spv-managememt',
  },

  [NotificationCode.PROPERTY_FULLY_FUNDED]: {
    [UserType.Admin]: '/group/detail/{{groupId}}?tab=investedAssets',
    [AccountType.Trustee]: '/asset-list',
  },
  [AdminNotificationCode.JOIN_GROUP_BY_USER]: {
    [AccountType.Trustee]: null,
  },
  [AdminNotificationCode.VOTE_PLUS_NDA_CONSENT]: {
    [AccountType.Trustee]: null,
  },
  [NotificationCode.ASSET_IN_MARKETPLACE_LISTED]: {
    [AccountType.Trustee]: null,
    [UserType.Admin]: null,
  },
  [AdminNotificationCode.ADMIN_MANUAL_PAYMENT_FOR_DOCUMENT]: {
    [AccountType.Trustee]: null,
  },
  [AdminNotificationCode.KYC_SUBMITTED]: {
    [UserType.Admin]: '/kyc',
    [AccountType.Trustee]: null,
  },
  [NotificationCode.REQUEST_FOR_TRUSTEE_APPROVED]: {
    [UserType.Admin]: null,
    [AccountType.Trustee]: '/secondary-transfer-requests',
  },
  [NotificationCode.MARKETPLACE_MATCH_PENDING_TRUSTEE_APPROVAL]: {
    [UserType.Admin]: null,
    [AccountType.Trustee]: '/secondary-transfer-requests',
  },
  [AdminNotificationCode.INFORM_TO_BROKER_AND_ADMIN]: {
    [UserType.Admin]: '/users/Broker/detail/{{brokerId}}',
    [AccountType.Broker]: '/dashboard/my-referrals',
  },
  [AdminNotificationCode.REJECT_INFORM_TO_BROKER_AND_ADMIN]: {
    [UserType.Admin]: '/users/Broker/detail/{{brokerId}}',
    [AccountType.Broker]: '/dashboard/my-referrals',
  },
  [NotificationCode.KYC_APPROVED]: {
    [AccountType.Trustee]: '/trustee-kyc',
  },
  [NotificationCode.KYC_REJECTED]: {
    [AccountType.Trustee]: '/dashboard/kyc',
  },

  [NotificationCode.USER_REGISTRATION_NOTIFICATION]: {
    [AccountType.Trustee]: '/trustee-kyc',
  },
};

export enum KybStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
  Draft = 'Draft',
}
