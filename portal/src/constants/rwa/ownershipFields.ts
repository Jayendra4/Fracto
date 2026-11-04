import type { IFieldConfig } from '@/interface';

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const ALPHANUMERIC_REGEX = /^[A-Za-z0-9/-]+$/;
const DECIMAL_NUMBER_REGEX = /^[0-9]+(\.[0-9]+)?$/;
const YEAR_REGEX = /^[0-9]{4}$/;

export const ownershipFields: IFieldConfig[] = [
  {
    name: 'ownershipModel',
    label: 'Ownership Model',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Select how the asset ownership is structured (e.g., Developer, SPV, Platform, Single Owner, Leasehold, or Freehold).',
    type: 'select',
    placeholder: 'Select the ownership Model',
    required: true,
    options: [
      { label: 'Private limited', value: 'Privatelimited' },
      { label: 'Limited', value: 'Limited' },
      { label: 'Partnership', value: 'Partnership' },
      { label: 'Individual', value: 'Individual' },
      { label: 'Trust', value: 'Trust' },
      { label: 'LLP', value: 'LLP' },
      // { label: 'DeveloperOwned', value: 'DeveloperOwned' },
      // { label: 'SPV Owned', value: 'SPVOwned' },
      // { label: 'Platform Owned', value: 'PlatformOwned' },
      // { label: 'Single Owner', value: 'SingleOwner' },
      // { label: 'Leasehold', value: 'Leasehold' },
      // { label: 'Freehold', value: 'Freehold' },
      { label: 'Others', value: 'Others' },
    ],
    validation: {
      required: 'Ownership Model is required',
    },
  },

  // {
  //   name: 'ownershipEntityType',
  //   label: 'Ownership Entity Type',
  //   type: 'select',
  //   placeholder: 'Enter Ownership Entity Type',
  //   required: true,
  //   tooltip: true,
  //   helpDesk: false,
  //   toolTipContent:
  //     'Specify the legal entity owning the asset (e.g., Individual, Company, Partnership, Trust, SPV).',
  //   options: [
  //     { label: 'Individual', value: 'individual' },
  //     { label: 'Company', value: 'company' },
  //     { label: 'Trust', value: 'trust' },
  //     { label: 'Partnership', value: 'partnership' },
  //     { label: 'Government', value: 'government' },
  //   ],
  //   validation: {
  //     required: 'Ownership Entity Type is required',
  //   },
  // },

  {
    name: 'encumbranceDetails',
    label: 'Encumbrance Details',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Provide details of any legal liabilities, loans, or claims associated with the asset, if applicable.',
    placeholder: 'Enter Encumbrance Details',
    required: false,
    validation: {
      maxLength: {
        value: 250,
        message: 'Maximum 250 characters allowed',
      },
    },
  },

  {
    name: 'propertySurveyKhasraNumber',
    label: 'Property Survey Khasra Number',
    type: 'text',
    placeholder: 'Enter Property Survey Khasra Number',
    required: false,
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Official land identification number as per government land records.',
    validation: {
      pattern: {
        value: ALPHANUMERIC_REGEX,
        message: 'Only letters, numbers, / or - allowed',
      },
      maxLength: {
        value: 50,
        message: 'Maximum 50 characters allowed',
      },
    },
  },

  {
    name: 'currentOwnerName',
    label: 'Current Owner Name',
    type: 'text',
    placeholder: 'Enter the current Owner',
    required: true,
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    validation: {
      required: 'Current Owner Name is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets allowed',
      },
      minLength: {
        value: 2,
        message: 'Minimum 2 characters required',
      },
      maxLength: {
        value: 100,
        message: 'Maximum 100 characters allowed',
      },
    },
  },

  {
    name: 'titleStatus',
    label: 'Title Status',
    type: 'select',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    placeholder: 'Enter title status',
    required: true,
    options: [
      { label: 'Clear Title', value: 'clear' },
      { label: 'Disputed', value: 'disputed' },
      { label: 'Under Litigation', value: 'litigation' },
      { label: 'Others', value: 'others' },
    ],
    validation: {
      required: 'Title Status is required',
    },
  },

  {
    name: 'reraRegistrationNumber',
    label: 'Rera Registration Number',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Enter the registered RERA number for the property, if applicable.',
    placeholder: 'Enter Rera Registration Number',
    required: false,
    validation: {
      // required: 'Rera Registration Number is required',
      pattern: {
        value: ALPHANUMERIC_REGEX,
        message: 'Only letters, numbers, / or - allowed',
      },
      minLength: {
        value: 5,
        message: 'Minimum 5 characters required',
      },
      maxLength: {
        value: 50,
        message: 'Maximum 50 characters allowed',
      },
    },
  },

  {
    name: 'landArea',
    label: 'Land Area',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent: 'Land Area - Specify the total land area of asset.',
    placeholder: 'Enter land area',
    required: true,
    extraText: 'Sq. / Meter',
    validation: {
      required: 'Land Area is required',
      pattern: {
        value: DECIMAL_NUMBER_REGEX,
        message: 'Enter a valid numeric value',
      },
      validate: (value: string) =>
        parseFloat(value) > 0 || 'Land area must be greater than 0',
    },
  },

  {
    name: 'builtupArea',
    label: 'Builtup Area',
    type: 'text',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Built-up Area - Specify the total constructed (built-up) area of the asset in appropriate units.',
    placeholder: 'Enter Builtup Area',
    required: false,
    extraText: 'Sq. / Meter',
    validation: {
      // required: 'Builtup Area is required',
      pattern: {
        value: DECIMAL_NUMBER_REGEX,
        message: 'Enter a valid numeric value',
      },
      // validate: (value: string) =>
      //   parseFloat(value) > 0 || 'Builtup area must be greater than 0',
    },
  },

  {
    name: 'yearOfConstruction',
    label: 'Year of Construction',
    type: 'number',
    tooltip: true,
    helpDesk: false,
    toolTipContent: 'Enter the year the asset was constructed.',
    placeholder: 'Enter Year of Construction',
    required: true,
    validation: {
      required: 'Year of Construction is required',
      pattern: {
        value: YEAR_REGEX,
        message: 'Enter a valid year (YYYY)',
      },
      validate: (value: number) => {
        const year = Number(value);
        const currentYear = new Date().getFullYear();
        return (
          (year >= 1825 && year <= currentYear) ||
          `Year must be between 1825 and ${currentYear}`
        );
      },
    },
  },

  {
    name: 'assetAge',
    label: 'Asset Age',
    type: 'number',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    placeholder: 'Enter Asset age',
    required: false,
    disabledByDefault: true, //
    validation: {
      // required: 'Year of Construction is required',
      // validate: (value: string) => {
      //   const year = Number(value);
      //   const currentYear = new Date().getFullYear();
      //   if (!year) return 'Enter a valid year';
      //   if (year < 1825) return 'Year must be greater than 1825';
      //   if (year > currentYear)
      //     return `Year cannot be greater than ${currentYear}`;
      //   return true;
      // },
    },
  },
];
