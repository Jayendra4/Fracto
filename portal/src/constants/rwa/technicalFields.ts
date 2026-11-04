import type { IFieldConfig } from '@/interface';

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const AMOUNT_REGEX = /^[0-9]+(\.[0-9]{1,2})?$/;
const INTEGER_REGEX = /^[0-9]+$/;

export const technicalFields: IFieldConfig[] = [
  {
    name: 'storeType',
    label: 'Store Type',
    type: 'text',
    placeholder: 'Enter store type',
    required: true,
    validation: {
      required: 'Store Type is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets and spaces allowed',
      },
      minLength: {
        value: 3,
        message: 'Minimum 3 characters required',
      },
      maxLength: {
        value: 50,
        message: 'Maximum 50 characters allowed',
      },
    },
  },

  {
    name: 'brandAffiliation',
    label: 'Brand Affiliation',
    type: 'select',
    placeholder: 'Enter brand affiliation',
    required: true,
    options: [
      { label: 'Brand A', value: 'brand_a' },
      { label: 'Brand B', value: 'brand_b' },
      { label: 'Brand C', value: 'brand_c' },
      { label: 'Independent', value: 'independent' },
    ],
    validation: {
      required: 'Brand Affiliation is required',
    },
  },

  {
    name: 'averageMonthlySales',
    label: 'Average Monthly Sales',
    type: 'text',
    placeholder: 'Enter average monthly sales',
    required: true,
    validation: {
      required: 'Average Monthly Sales is required',
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
      },
    },
  },

  {
    name: 'footFallData',
    label: 'Foot Fall Data',
    type: 'text',
    placeholder: 'Enter footfall data',
    required: true,
    validation: {
      required: 'Foot Fall Data is required',
      pattern: {
        value: INTEGER_REGEX,
        message: 'Enter a valid numeric footfall count',
      },
      validate: (value: string) =>
        Number(value) > 0 || 'Footfall must be greater than zero',
    },
  },

  {
    name: 'leaseRentPerMonth',
    label: 'Lease Rent Per Month',
    type: 'text',
    placeholder: 'Enter lease rent per month',
    required: true,
    validation: {
      required: 'Lease Rent Per Month is required',
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
      },
    },
  },

  {
    name: 'staffCount',
    label: 'Staff Count',
    type: 'number',
    placeholder: 'Enter staff count',
    required: true,
    validation: {
      required: 'Staff Count is required',
      pattern: {
        value: INTEGER_REGEX,
        message: 'Enter a valid whole number',
      },
      validate: (value: number) =>
        value > 0 || 'Staff count must be at least 1',
    },
  },
];
