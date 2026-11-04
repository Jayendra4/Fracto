type VerificationCodeMailPayload = {
  username: string;
  code: string;
  expirationTime: string;
};

type VendorSuggestionMailPayload = {
  vendorName: string;
  category: string;
  description: string;
  website: string;
  email: string;
  suggestionId?: number;
};

type AssetOwnerInviteMailPayload = {
  brokerEmail: string;
  commissionPct: number;
  referralCode: string;
  propertyDetails: Record<string, any>;
  brokerNote?: string;
  signupLink: string;
};

type StatusUpdateMailPayload = {
  name: string;
  assetTitle: string;
  status: string;
  rejection?: string;
};

type PaymentInvoiceMailPayload = {
  name: string;
  assetTitle: string;
  amount: number;
  orderId: string;
  razorpayPaymentId: string;
  invoiceUrl: string;
};

type ContactUsTemplatePayload = {
  name: string;
  email: string;
  mobile?: string;
  description?: string;
  type: string;
};

export type RegisterVerificationCodeMailTemplate = {
  name: 'register-verification-code';
  data: VerificationCodeMailPayload;
};

export type ResetPasswordVerificationCodeMailTemplate = {
  name: 'reset-password-verification-code';
  data: VerificationCodeMailPayload;
};

export type VendorSuggestionMailTemplate = {
  name: 'vendor-suggestion';
  data: VendorSuggestionMailPayload;
};

export type AssetOwnerInviteMailTemplate = {
  name: 'asset-owner-invite';
  data: AssetOwnerInviteMailPayload;
};

export type StatusApprovedForGroupMailTemplate = {
  name: 'status-update';
  data: StatusUpdateMailPayload;
};

export type PropertyVerificationReportChargeMailTemplate = {
  name: 'payment-invoice';
  data: PaymentInvoiceMailPayload;

  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
};

export type ContactUsTemplate = {
  name: 'contact-us';
  data: ContactUsTemplatePayload;
};

export type MailTemplate =
  | RegisterVerificationCodeMailTemplate
  | ResetPasswordVerificationCodeMailTemplate
  | VendorSuggestionMailTemplate
  | StatusApprovedForGroupMailTemplate
  | PropertyVerificationReportChargeMailTemplate
  | ContactUsTemplate
  | AssetOwnerInviteMailTemplate;

export type MailParams = { subject: string; template: MailTemplate };
