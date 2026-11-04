import type { DocumentConfigKyc } from '@/interface';

export const RWA_DOCUMENT_TYPE_CODE_MAP: Record<string, string> = {
  registeredTitleDeed: 'REGISTERED_TITLE_DEED',
  encumbranceCertificate: 'EC',
  propertyTaxReceipts: 'PROPERTY_TAX_RECEIPTS',
  mutationRecords: 'MUTATION_RECORDS',
  ownershipChainDocs: 'OWNERSHIP_CHAIN_DOCUMENTS',
  reraRegistrationCert: 'RERA_CERTIFICATE',
  noc: 'NOC_DOCUMENT',
  occupancyCertificate: 'OCCUPANCY_CERTIFICATE',
  completionCertificate: 'COMPLETION_CERTIFICATE',
  electricityBill: 'ELECTRICITY_BILL',
};

export const OwnershipDocFields: DocumentConfigKyc[] = [
  {
    id: 'registeredTitleDeed',
    label: 'Registered Title Deed / Sale Deed',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the registered sale deed as proof of legal ownership of the property.',
  },

  {
    id: 'encumbranceCertificate',
    label: 'Encumbrance Certificate',
    helperText: '(EC)',
    required: false,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the encumbrance certificate to confirm the property is free from legal or financial liabilities.',
  },

  {
    id: 'propertyTaxReceipts',
    label: 'Property Tax Receipts',
    helperText: '(Last 2 yrs)',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the latest property tax receipt as proof of tax payment.',
  },

  {
    id: 'mutationRecords',
    label: 'Mutation Records',
    required: false,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the mutation document showing transfer of ownership in local land records.',
  },

  {
    id: 'ownershipChainDocs',
    label: 'Ownership Chain Documents',
    helperText: '(Last 15 yrs if possible)',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Provide documents showing the history of ownership transfers for the property.',
  },

  {
    id: 'reraRegistrationCert',
    label: 'RERA Registration Certificate',
    helperText: '(if applicable)',
    required: false,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the RERA registration certificate for the property/project, if applicable.',
  },

  {
    id: 'noc',
    label: 'NOCs',
    type: 'radio-image',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload relevant NOCs from authorities confirming no objections for the property.',
    options: [
      { label: 'Society NOC', value: 'society' },
      { label: 'Builder NOC', value: 'builder' },
      { label: 'Fire NOC (for commercial)', value: 'fire' },
      { label: 'Environmental NOC (if required)', value: 'environmental' },
    ],
    validation: {
      required: 'Please select NOC type',
    },
  },

  {
    id: 'occupancyCertificate',
    label: 'Occupancy Certificate',
    helperText: '(OC)',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the occupancy certificate confirming the property is fit for occupation.',
  },

  {
    id: 'completionCertificate',
    label: 'Completion Certificate',
    helperText: '(CC)',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the completion certificate issued by authorities after construction is completed.',
  },

  {
    id: 'electricityBill',
    label: 'Latest Electricity Bill',
    helperText: '(For address verification)',
    required: true,
    tooltip: true,
    helpDesk: true,
    toolTipContent:
      'Upload the latest electricity bill as proof of property usage and address verification.',
  },
];

export const RWA_MAX_FILE_SIZE_MB = 10;

export const RWA_ACCEPTED_MIME_PREFIXES = ['image/'];

export const RWA_ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
