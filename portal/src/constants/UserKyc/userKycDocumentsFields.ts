import type { DocumentConfigKyc, KycDocumentId } from '@/interface';

export const KYC_DOCUMENT_TYPE_CODE_MAP: Record<KycDocumentId, string> = {
  pan_indian: 'pan_indian',
  emirates_id: 'emirates_id',
  passport_indian: 'passport_indian',
  passport_emirati: 'passport_emirati',
  address_proof: 'address_proof',
  passport_size_photo: 'passport_size_photo',
  secondary_id: 'secondary_id',
};

export const USER_KYC_DOCUMENTS: DocumentConfigKyc[] = [
  {
    id: 'pan_indian',
    label: 'PAN Card',
    required: true,
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    externalConditionalShow: {
      key: 'nationality',
      value: 'india',
    },
  },
  {
    id: 'emirates_id',
    label: 'Emirates ID',
    required: true,
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    externalConditionalShow: {
      key: 'nationality',
      value: 'uae',
    },
  },
  {
    id: 'passport_indian',
    label: 'Passport',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    externalConditionalShow: {
      key: 'nationality',
      value: 'india',
    },
  },
  {
    id: 'passport_emirati',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    label: 'Passport (If Emirates ID unavailable)',
    externalConditionalShow: {
      key: 'nationality',
      value: 'uae',
    },
  },

  {
    id: 'address_proof',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    label: 'Address Proof',
    type: 'radio-image',
    required: true,
    options: [
      { label: 'Bank statement', value: 'bankStatement' },
      { label: 'Utility bill', value: 'utilityBill' },
      { label: 'Aadhaar XML', value: 'adhaarXml' },
    ],
    validation: {
      required: 'Please select Address proof type',
    },
  },

  {
    id: 'passport_size_photo',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    label: 'Passport-Size Photo',
  },
  {
    id: 'secondary_id',
    label: 'Secondary ID',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    type: 'radio-image',
    options: [
      { label: 'Passport', value: 'passport' },
      { label: 'License', value: 'license' },
      { label: 'Aadhaar', value: 'adhaar' },
      { label: 'Voter', value: 'voter' },
    ],
    validation: {
      required: 'Please select secondary ID type',
    },
  },
];

export const MAX_FILE_SIZE_MB = 10;

export const ACCEPTED_MIME_PREFIXES = ['image/'];

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
