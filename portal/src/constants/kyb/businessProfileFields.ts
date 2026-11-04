import type { IFieldConfig } from '@/interface';

const TEXT_ONLY_REGEX = /^[A-Za-z\s&,-]+$/;

export const businessProfileFields: IFieldConfig[] = [
  {
    name: 'natureOfBusiness',
    label: 'Nature of Business',
    type: 'text',
    placeholder: 'Enter business category',
    required: true,
    validation: {
      required: 'Business category is required',
      pattern: {
        value: TEXT_ONLY_REGEX,
        message: 'Only letters and basic characters allowed',
      },
      minLength: {
        value: 3,
        message: 'Must be at least 3 characters',
      },
    },
  },

  {
    name: 'countriesOfOperation',
    label: 'Countries of Operation',
    type: 'select',
    placeholder: 'Select the countries in which you operate',
    required: true,
    options: [
      { label: 'India', value: 'india' },
      { label: 'UAE', value: 'uae' },
    ],
    validation: {
      required: 'Countries of operation is required',
    },
  },

  {
    name: 'expectedMonthlyTransactionVolume',
    label: 'Expected Monthly Transaction Volume',
    type: 'select',
    placeholder: 'Select range',
    required: true,
    options: [
      { label: 'Below ₹10 Lakhs', value: '10' },
      { label: '₹10L–₹50L', value: '50' },
      { label: '₹1Cr - 50Cr', value: '1' },
      { label: 'Above ₹50Cr', value: '50' },
    ],
    validation: {
      required: 'Expected monthly transaction volume is required',
    },
  },

  {
    name: 'expectedSourceOfFunds',
    label: 'Expected Source of Funds',
    type: 'select',
    placeholder: 'Select the source of funds',
    required: true,
    options: [
      { label: 'Internal Accruals', value: 'InternalAccruals' },
      { label: 'Investors', value: 'Investors' },
      { label: 'VC', value: 'Vc' },
      { label: 'Borrowings', value: 'Borrowings' },
      { label: 'Others', value: 'Others' },
    ],
    validation: {
      required: 'Source of funds is required',
    },
  },

  {
    name: 'businessDescription',
    label: 'Business Description',
    type: 'textarea',
    placeholder: 'Describe your company’s products/services',
    required: true,
    validation: {
      required: 'Description is required',
      minLength: {
        value: 20,
        message: 'Description must be at least 20 characters',
      },
      maxLength: {
        value: 500,
        message: 'Description cannot exceed 500 characters',
      },
    },
  },

  {
    name: 'isCompanyPubliclyListed',
    label: 'Is Your Company Publicly Listed',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'True' },
      { label: 'No', value: 'False' },
    ],
    validation: {
      required: 'Please select if your company is publicly listed',
    },
  },
];
