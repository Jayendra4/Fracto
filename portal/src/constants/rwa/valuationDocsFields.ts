import type { DocumentConfigKyc } from '@/interface';

export const VALUATION_DOC_TYPE_CODE_MAP: Record<string, string> = {
  registeredValuationReport: 'REGISTERED_VALUATION_REPORT',
  rentalAgreement: 'RENTAL_AGREEMENT',
  rentLedger: 'RENT_LEDGER',
  projectedCashFlow: 'PROJECTED_CASH_FLOW',
  financials: 'FINANCIALS',
};

export const ValuationDocFields: DocumentConfigKyc[] = [
  {
    id: 'registeredValuationReport',
    label: 'Registered Valuation Report',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the official valuation report issued by a certified valuer.',
  },

  {
    id: 'rentalAgreement',
    label: 'Rental Agreement',
    helperText: '(If Leased)',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent: 'Upload the signed agreement between the owner and tenant.',
  },

  {
    id: 'rentLedger',
    label: 'Rent Ledger',
    helperText: '(Last 12 Months)',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent: 'Provide a record of rent payments received over time.',
  },

  {
    id: 'projectedCashFlow',
    label: 'Projected Cash Flow Statement',
    required: false,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload a document showing expected future income and expenses of the asset.',
  },

  {
    id: 'financials',
    label: 'Financials',
    helperText: '(if business asset)',
    type: 'radio-image',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload relevant financial statements supporting asset performance.',

    options: [
      { label: 'P&L', value: 'pl' },
      { label: 'Balance Sheet', value: 'balanceSheet' },
      { label: 'GST Filings', value: 'gstFilings' },
      { label: 'Bank Statements', value: 'bankStatements' },
    ],

    validation: {
      required: 'Please select a Financials document type',
    },
  },
];

export const VALUATION_DOC_MAX_FILE_SIZE_MB = 10;

export const VALUATION_DOC_ACCEPTED_MIME_PREFIXES = ['image/'];

export const VALUATION_DOC_ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
