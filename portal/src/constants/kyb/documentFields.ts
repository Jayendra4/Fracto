import type { DocumentConfig, DocumentId } from '@/interface';

export const DOCUMENT_TYPE_CODE_MAP: Record<DocumentId, string> = {
  certificateOfIncorporation: 'certificate_of_incorporation',
  moa: 'moa',
  aoa: 'aoa',
  companyPan: 'company_pan',
  gstCertificate: 'gst_certificate',
  tradeLicense: 'trade_license',
  shareholdingPattern: 'shareholding_pattern',
  auditedFinancials: 'audited_financials',
  netWorthCertificate: 'net_worth_certificate',
  businessPanCard: 'business_pan_card',
  registered_address_proof: 'registered_address_proof',
};

export const DOCUMENTS: DocumentConfig[] = [
  {
    id: 'certificateOfIncorporation',
    label: 'Certificate of Incorporation',
    required: true,
  },
  {
    id: 'moa',
    label: 'MoA',
    helperText: '(Memorandum of Association)',
    required: true,
  },
  {
    id: 'aoa',
    label: 'AoA',
    helperText: '(Articles of Association)',
    required: true,
  },
  {
    id: 'companyPan',
    label: 'Company PAN',
    required: true,
    externalConditionalShow: {
      key: 'registeredCountry',
      value: 'IN',
    },
  },
  {
    id: 'gstCertificate',
    label: 'GST Certificate',
    required: true,
    externalConditionalShow: {
      key: 'registeredCountry',
      value: 'IN',
    },
  },
  {
    id: 'tradeLicense',
    label: 'Trade License',
    required: true,
    externalConditionalRequired: {
      key: 'registeredCountry',
      value: 'AE',
      message: 'Trade license is required for UAE companies',
    },
  },
  {
    id: 'registered_address_proof',
    label: 'Registered Address Proof',
    type: 'radio-image',
    required: true,
    options: [
      { label: 'Tax receipt', value: 'taxReceipt' },
      { label: 'Utility bill', value: 'utilityBill' },
    ],
  },
  {
    id: 'auditedFinancials',
    label: 'Audited Financials',
    required: true,
  },
  {
    id: 'netWorthCertificate',
    label: 'Net Worth Certificate',
    required: true,
  },
  {
    id: 'shareholdingPattern',
    label: 'Shareholding Pattern',
    required: true,
    isTextField: true,
  },
];

export const MAX_FILE_SIZE_MB = 10;

export const ACCEPTED_MIME_PREFIXES = ['image/'];

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
