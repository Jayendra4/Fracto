import type { DocumentConfigKyc, KycDocumentId } from '@/interface';

export const KYC_DOCUMENT_TYPE_CODE_MAP: Record<KycDocumentId, string> = {
  pan_indian: 'pan_indian',
  emirates_id: 'emirates_id',
  passport_indian: 'passport_indian',
  passport_emirati: 'passport_emirati',
  address_proof: 'address_proof',
  passport_size_photo: 'passport_size_photo',
  secondary_id: 'secondary_id',
  business_pancard: 'business_pan_card',
  selfie_photo: 'selfie_photo',
};

export const KYC_DOCUMENTS: DocumentConfigKyc[] = [
  {
    id: 'pan_indian',
    label: 'PAN Card',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    description: ' Upload the PAN Card. It only takes a few minutes...',
    required: true,
    externalConditionalShow: { key: 'nationality', value: 'indian' },
  },
  {
    id: 'emirates_id',
    label: 'Emirates ID',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    description: ' Upload the Emirates ID. It only takes a few minutes...',
    required: true,
    externalConditionalShow: { key: 'nationality', value: 'emirati' },
  },
  // {
  //   id: 'passport_indian',
  //   label: 'Passport',
  //   description: ' Upload the Passport. It only takes a few minutes...',
  //   externalConditionalShow: { key: 'nationality', value: 'indian' },
  // },
  // {
  //   id: 'passport_emirati',
  //   label: 'Passport (If Emirates ID unavailable)',
  //   description: ' Upload the Passport. It only takes a few minutes...',
  //   required: true,
  //   externalConditionalShow: { key: 'nationality', value: 'emirati' },
  // },

  {
    id: 'address_proof',
    label: 'Address Proof',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    description: ' Upload the Address Proof. It only takes a few minutes...',
    type: 'radio-image',
    required: true,
    options: [
      { label: 'Bank statement', value: 'bankStatement' },
      { label: 'Utility bill', value: 'utilityBill' },
      { label: 'Aadhaar XML', value: 'adhaarXml' },
    ],
  },

  {
    id: 'secondary_id',
    label: 'Secondary ID',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    description: ' Upload the Secondary ID. It only takes a few minutes...',
    type: 'radio-image',
    required: true,
    options: [
      { label: 'Passport', value: 'passport' },
      { label: 'License', value: 'license' },
      { label: 'Aadhaar', value: 'adhaar' },
      { label: 'Voter', value: 'voter' },
    ],
  },
  {
    id: 'passport_size_photo',
    label: 'Passport-Size Photo',
    tooltip: false,
    toolTipContent: '',
    helpDesk: true,
    description:
      ' Upload the Passport-Size Photo. It only takes a few minutes...',
  },
  // {
  //   id: 'business_pan_card',
  //   label: 'Business PAN Card (Optional)',
  //   description:
  //     ' Upload the Business PAN Card . It only takes a few minutes...',
  // },
];

export const MAX_FILE_SIZE_MB = 10;

export const ACCEPTED_MIME_PREFIXES = ['image/'];

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
