import type { IFieldConfig } from '@/interface';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

const UAE_TRADE_LICENSE_REGEX = /^[A-Za-z0-9/-]{5,30}$/;

export const taxAndRegDetailsFields: IFieldConfig[] = [
  {
    name: 'panNumber',
    label: 'PAN Number',
    type: 'text',
    placeholder: 'Enter PAN',
    required: true,
    validation: {
      required: 'PAN number is required',
      pattern: {
        value: PAN_REGEX,
        message: 'Enter a valid PAN (e.g. ABCDE1234F)',
      },
    },
    externalConditionalShow: {
      key: 'registeredCountry',
      value: 'IN',
    },
  },

  {
    name: 'gstNumber',
    label: 'GST Number',
    type: 'text',
    placeholder: 'Enter GST',
    required: false,
    validation: {
      // required: 'GST number is required',
      pattern: {
        value: GST_REGEX,
        message: 'Enter a valid 15-character GST number',
      },
    },
    externalConditionalShow: {
      key: 'registeredCountry',
      value: 'IN',
    },
  },

  {
    name: 'tanNumber',
    label: 'TAN Number',
    type: 'text',
    placeholder: 'Enter TAN',
    required: false,
    validation: {
      pattern: {
        value: TAN_REGEX,
        message: 'Enter a valid TAN (e.g. ABCD12345E)',
      },
    },
    externalConditionalShow: {
      key: 'registeredCountry',
      value: 'IN',
    },
  },

  {
    name: 'tradeLicenseExpiry',
    label: 'Trade License Expiry Date',
    type: 'date',
    placeholder: 'DD/MM/YYYY',
    required: true,
    validation: {
      required: 'Trade license expiry date is required',
    },
  },

  {
    name: 'tradeLicenseNumber',
    label: 'Trade License Number',
    type: 'text',
    placeholder: 'Enter Trade License Number',
    required: true,
    validation: {
      required: 'Trade license number is required',
      pattern: {
        value: UAE_TRADE_LICENSE_REGEX,
        message: 'Only letters, numbers, / and - allowed (5–30 characters)',
      },
    },
    externalConditionalShow: {
      key: 'registeredCountry',
      value: 'AE',
    },
  },

  {
    name: 'proofOfPlaceOfBusiness',
    label: 'Proof of Place of Business',
    type: 'select',
    placeholder: 'Select the proof type',
    required: true,
    options: [
      { label: 'Municipality DOC', value: 'municipality_doc' },
      { label: 'Rent Agreement', value: 'rent_agreement' },
      { label: 'Utility Bill', value: 'utility_bill' },
    ],
    validation: {
      required: 'Proof of place of business is required',
    },
  },
];
