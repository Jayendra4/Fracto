import type { IFieldConfig } from '@/interface';
import dayjs from 'dayjs';

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const ALPHANUMERIC_REGEX = /^[A-Za-z0-9/-]+$/;
const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9._%+-]+)@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/;
const INDIA_PHONE_REGEX = /^[6-9][0-9]{9}$/;
const UAE_PHONE_REGEX = /^(\+971|971|0)?[0-9]{8,9}$/;
const PIN_REGEX = /^[1-9][0-9]{5}$/;
const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/;

export const companyBasicKybFields: IFieldConfig[] = [
  {
    name: 'legalEntityName',
    label: 'Legal Entity Name',
    type: 'text',
    placeholder: 'Enter the legal entity name',
    required: true,
    validation: {
      required: 'Legal entity name is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets allowed, no numbers or special characters',
      },
    },
  },

  {
    name: 'tradeName', //'legalEntityLastName',
    label: 'Trade Name',
    type: 'text',
    placeholder: 'Enter Legal Entity last Name',
    required: false,
    validation: {
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets allowed',
      },
    },
  },

  {
    name: 'cinOrTradeLicenseNo',
    label: 'CIN or Trade License Number',
    type: 'text',
    placeholder: 'Enter registration or license number',
    required: true,
    validation: {
      required: 'CIN or Trade License Number is required',
      pattern: {
        value: ALPHANUMERIC_REGEX,
        message: 'Only letters, numbers, / or - allowed',
      },
    },
  },

  {
    name: 'dateOfIncorporation',
    label: 'Date of incorporation',
    type: 'date',
    placeholder: 'DD/MM/YYYY',
    required: true,
    validation: {
      required: 'Date of incorporation is required',
      validate: (value: string) => {
        if (!value) return 'Date of incorporation is required';

        if (dayjs(value).isAfter(dayjs(), 'day')) {
          return 'Future dates are not allowed';
        }

        return true;
      },
    },
  },

  {
    name: 'entityType',
    label: 'Entity Type',
    type: 'select',
    placeholder: 'Select the entity type',
    required: true,
    options: [
      { label: 'Pvt Ltd', value: 'PvtLtd' },
      { label: 'LLP', value: 'Llp' },
      { label: 'LLC', value: 'Llc' },
      { label: 'FZ-LLC', value: 'FzLlc' },
      { label: 'SPV', value: 'Spv' },
      { label: 'Partnership', value: 'Partnership' },
      { label: 'Trust', value: 'Trust' },
    ],
    validation: {
      required: 'Entity Type is required',
    },
  },

  {
    name: 'registeredCountry',
    label: 'Country',
    type: 'select',
    placeholder: 'Select the country',
    required: true,
    options: [],
    validation: {
      required: 'Country is required',
    },
  },

  {
    name: 'registeredState',
    label: 'State',
    type: 'select',
    placeholder: 'Select State',
    required: true,
    options: [],
    searchable: true,
    validation: {
      required: 'State is required',
    },
  },

  {
    name: 'registeredCity',
    label: 'City',
    type: 'select',
    placeholder: 'Select City',
    required: true,
    options: [],
    searchable: true,
    validation: {
      required: 'City is required',
    },
  },

  {
    name: 'registeredPincode',
    label: 'Pincode',
    type: 'text',
    placeholder: 'Enter Pincode',
    required: true,
    validation: {
      required: 'Pincode is required',
      pattern: {
        value: PIN_REGEX,
        message: 'Please enter valid  PIN code',
      },
    },
  },

  {
    name: 'registeredAddressLine1',
    label: 'Registered Address',
    type: 'text',
    placeholder: 'Enter Building / Street / Plot number',
    required: true,
    validation: {
      required: 'Registered Address is required',
      minLength: {
        value: 5,
        message: 'Address must be at least 5 characters',
      },
    },
  },

  {
    name: 'registeredAddressLine2',
    label: ' ',
    type: 'text',
    placeholder: 'Enter Landmark / Area',
    required: false,
  },

  {
    name: 'industryType',
    label: 'Industry Type',
    type: 'text',
    placeholder: 'Enter the industry type',
    required: true,
    validation: {
      required: 'Industry Type is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Industry type must contain only letters',
      },
    },
  },

  {
    name: 'companyEmail',
    label: 'Company Email',
    type: 'email',
    placeholder: 'Enter the company email',
    required: true,
    validation: {
      required: 'Company email is required',
      pattern: {
        value: EMAIL_REGEX,
        message: 'Enter a valid business email address',
      },
    },
  },

  {
    name: 'companyPhone',
    label: 'Company Phone',
    type: 'text',
    placeholder: 'Enter the company phone number',
    required: true,
    conditionalShow: {
      dependsOn: 'registeredCountry',
      value: 'IN',
    },
    validation: {
      required: 'Company phone number is required',
      pattern: {
        value: INDIA_PHONE_REGEX,
        message: 'Enter a valid Indian phone number (10 digits)',
      },
    },
  },

  {
    name: 'companyPhone',
    label: 'Company Phone',
    type: 'text',
    placeholder: 'Enter the company phone number',
    required: true,
    conditionalShow: {
      dependsOn: 'registeredCountry',
      value: 'AE',
    },
    validation: {
      required: 'Company phone number is required',
      pattern: {
        value: UAE_PHONE_REGEX,
        message: 'Enter a valid UAE phone number (7–15 digits)',
      },
    },
  },

  {
    name: 'websiteUrl',
    label: 'Website URL',
    type: 'text',
    placeholder: 'Enter the company website URL',
    required: false,
    validation: {
      pattern: {
        value: URL_REGEX,
        message: 'Enter a valid website URL',
      },
    },
  },
];
