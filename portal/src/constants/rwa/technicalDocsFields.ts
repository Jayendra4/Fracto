import type { DocumentConfigKyc } from '@/interface';

export const BUSINESS_DOC_TYPE_CODE_MAP: Record<string, string> = {
  franchiseAgreement: 'FRANCHISE_AGREEMENT',
  businessLicense: 'BUSINESS_LICENSE',
  gstReturns: 'GST_RETURNS',
  salesReports: 'SALES_REPORTS',
};

export const technicalDocsFields: DocumentConfigKyc[] = [
  {
    id: 'franchiseAgreement',
    label: 'Franchise Agreement',
    required: true,
    tooltip: false,

    toolTipContent: '',
    helpDesk: true,
  },

  {
    id: 'businessLicense',
    label: 'Business License',
    required: true,
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
  },

  {
    id: 'gstReturns',
    label: 'GST Returns',
    helperText: '(India)',
    required: true,
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
  },

  {
    id: 'salesReports',
    label: 'Sales Reports',
    required: true,
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
  },
];

export const BUSINESS_MAX_FILE_SIZE_MB = 10;

export const BUSINESS_ACCEPTED_MIME_PREFIXES = ['image/'];

export const BUSINESS_ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
