import type { IFieldConfig } from '@/interface';
// const AMOUNT_REGEX = /^[0-9]+(\.[0-9]{1,2})?$/;
const AMOUNT_REGEX = /^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/;
const INTEGER_REGEX = /^[0-9]+$/;
const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const PERCENTAGE_REGEX = /^(100(\.0{1,2})?|[0-9]{1,2}(\.[0-9]{1,2})?)$/;

export const valuationFields: IFieldConfig[] = [
  {
    name: 'marketValue',
    label: 'Market Value',
    type: 'text',
    isCurrency: true,
    tooltip: true,
    helpDesk: false,
    toolTipContent: 'Current estimated market value of the asset.',
    placeholder: 'Enter your market value',
    required: true,
    validation: {
      required: 'Market Value is required',
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
      },
    },
  },

  {
    name: 'currency',
    label: 'Currency',
    type: 'select',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    placeholder: 'Enter currency',
    required: true,
    options: [
      { label: 'INR', value: 'INR' },
      // { label: 'USD', value: 'USD' },
      // { label: 'EUR', value: 'EUR' },
      // { label: 'AED', value: 'AED' },
    ],
    validation: {
      required: 'Currency is required',
    },
  },

  {
    name: 'valuationAgencyName',
    label: 'Valuation Agency Name',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Provide the name of the certified agency or valuer who assessed the asset.',
    placeholder: 'Enter valuation agency name',
    required: true,
    validation: {
      required: 'Valuation Agency Name is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets and spaces allowed',
      },
      minLength: {
        value: 3,
        message: 'Minimum 3 characters required',
      },
      maxLength: {
        value: 100,
        message: 'Maximum 100 characters allowed',
      },
    },
  },

  {
    name: 'valuationReportDate',
    label: 'Valuation Report Date',
    type: 'date',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Enter the date on which the asset valuation was conducted.',
    placeholder: 'Enter the valuation report date',
    required: true,
    validation: {
      required: 'Valuation Report Date is required',
      validate: (value: string) =>
        !value || new Date(value) <= new Date()
          ? true
          : 'Date cannot be in the future',
    },
  },

  {
    name: 'lastPurchasePrice',
    label: 'Last Purchases Price',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent: 'Specify the price at which the asset was last purchased.',
    isCurrency: true,
    placeholder: 'Enter last purchases price',
    required: false,
    validation: {
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
      },
    },
  },

  {
    name: 'rentalIncomeMonthly',
    label: 'Rental Income Monthly',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Enter the current monthly rental income generated from the asset.',
    isCurrency: true,
    placeholder: 'Enter rental income monthly',
    required: true,
    validation: {
      required: 'Rental Income Monthly is required',
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
      },
    },
  },

  {
    name: 'leaseTenureRemainingMonths',
    label: 'Lease Tenure Remaining Months',
    type: 'number',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Specify the remaining lease duration in months for the tenant.',
    placeholder: 'Enter lease tenure remaining months',
    required: true,
    validation: {
      required: 'Lease Tenure Remaining Months is required',
      pattern: {
        value: INTEGER_REGEX,
        message: 'Enter a valid number of months',
      },
      validate: (value: number) =>
        value >= 0 || 'Lease tenure cannot be negative',
    },
  },

  {
    name: 'last3YearRevenue',
    label: 'Last 3 Year Revenue',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Provide the total revenue generated from the asset over the past 3 years.',
    isCurrency: true,
    placeholder: 'Enter the last 3 year revenue',
    required: true,
    validation: {
      required: 'Last 3 Year Revenue is required',
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
      },
    },
  },

  {
    name: 'operationalExpensesAnnual',
    label: 'Operational Expenses Annual',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Enter the yearly expenses incurred for maintaining and operating the asset.',
    isCurrency: true,
    placeholder: 'Enter operational expenses annual',
    required: false,
    validation: {
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
      },
    },
  },

  {
    name: 'netOperationalIncome',
    label: 'Net Operational Income',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Provide the annual income after deducting operational expenses from total revenue.',
    isCurrency: true,
    placeholder: 'Enter net operational income',
    required: true,
    validation: {
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
      },
    },
  },

  {
    name: 'expectedYieldPercentage',
    label: 'Expected Yield Percentage',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Provide the expected annual return on investment as a percentage.',
    placeholder: 'Enter expected yield percentage',
    required: true,
    validation: {
      pattern: {
        value: PERCENTAGE_REGEX,
        message: 'Enter a valid percentage between 0 and 100',
      },
    },
  },

  {
    name: 'expectedAppreciationPercentage',
    label: 'Expected Appreciation Percentage',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Provide the estimated annual increase in asset value as a percentage.',
    placeholder: 'Enter expected appreciation percentage',
    required: true,
    validation: {
      pattern: {
        value: PERCENTAGE_REGEX,
        message: 'Enter a valid percentage between 0 and 100',
      },
    },
  },
];
