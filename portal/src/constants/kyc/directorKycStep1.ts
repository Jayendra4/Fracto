import type { IFieldConfig } from '@/interface';

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const EMIRATES_ID_REGEX = /^[0-9]{15}$/;
const PASSPORT_REGEX = /^[A-Z0-9]{6,9}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INDIA_PIN_REGEX = /^[0-9]{6}$/;
const UAE_PIN_REGEX = /^[0-9]{4,10}$/;
const INDIA_PHONE_REGEX = /^[6-9][0-9]{9}$/;
const UAE_PHONE_REGEX = /^[5-9][0-9]{8,9}$/;
// const UAE_PHONE_REGEX = /^(\+971|971|0)?[0-9]{8,9}$/;

export const directorKycStep1: IFieldConfig[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter the first name',
    required: true,
    validation: {
      required: 'First name is required',
      pattern: { value: NAME_REGEX, message: 'Only alphabets allowed' },
      minLength: {
        value: 2,
        message: 'First name must be at least 2 characters',
      },
    },
  },

  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter the last name',
    required: true,
    validation: {
      required: 'Last name is required',
      pattern: { value: NAME_REGEX, message: 'Only alphabets allowed' },
      minLength: {
        value: 2,
        message: 'Last name must be at least 2 characters',
      },
    },
  },

  {
    name: 'roleInCompany',
    label: 'Role In Company',
    type: 'select',
    placeholder: 'Select the role',
    required: true,
    options: [
      { label: 'Director', value: 'Director' },
      { label: 'Promoter', value: 'Promoter' },
      { label: 'Ultimate Beneficial Owner', value: 'Ubo' },
      { label: 'Authorized Signatory', value: 'AuthorisedSignatory' },
    ],
    validation: { required: 'Role is required' },
  },

  {
    name: 'dateOfBirth',
    label: 'Date of Birth',
    type: 'date',
    placeholder: 'DD/MM/YYYY',
    required: true,
    validation: {
      required: 'Date of birth is required',
      validate: (value: string) => {
        if (!value) return true;
        return (
          new Date(value) < new Date() || 'Date of birth must be in the past'
        );
      },
    },
  },

  {
    name: 'nationality',
    label: 'Nationality',
    type: 'select',
    placeholder: 'Select the nationality',
    required: true,
    options: [
      { label: 'Indian', value: 'indian' },
      { label: 'Emirati', value: 'emirati' },
    ],
    validation: { required: 'Nationality is required' },
  },

  {
    name: 'passportNumber',
    label: 'Passport Number (Optional)',
    type: 'text',
    placeholder: 'Enter Passport Number',
    required: false,
    validation: {
      pattern: {
        value: PASSPORT_REGEX,
        message: 'Enter a valid passport number',
      },
    },
  },

  {
    name: 'panNumber',
    label: 'PAN Number',
    type: 'text',
    placeholder: 'Enter PAN',
    required: true,
    conditionalShow: { dependsOn: 'nationality', value: 'indian' },
    validation: {
      required: 'PAN number is required',
      pattern: { value: PAN_REGEX, message: 'Enter a valid PAN (ABCDE1234F)' },
    },
  },

  {
    name: 'emiratesIdNumber',
    label: 'Emirates ID Number (UAE)',
    type: 'text',
    placeholder: 'Enter Emirates ID',
    required: true,
    conditionalShow: { dependsOn: 'nationality', value: 'emirati' },
    validation: {
      required: 'Emirates ID is required',
      pattern: {
        value: EMIRATES_ID_REGEX,
        message: 'Enter a valid 15-digit Emirates ID',
      },
    },
  },

  {
    name: 'country',
    label: 'Country',
    type: 'select',
    placeholder: 'Select Country',
    required: true,
    options: [],
    validation: {
      required: 'Country is required',
    },
  },

  {
    name: 'state',
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
    name: 'city',
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
    name: 'pincode',
    label: 'Pincode',
    placeholder: 'Enter Pincode',
    type: 'text',
    required: true,
    validation: {
      required: 'Pincode is required',
      validate: (value: string, formValues: any) => {
        if (!value) return true;

        if (formValues.nationality === 'indian') {
          return (
            INDIA_PIN_REGEX.test(value) ||
            'Enter a valid 6-digit Indian pincode'
          );
        }

        if (formValues.nationality === 'emirati') {
          return UAE_PIN_REGEX.test(value) || 'Enter a valid UAE pincode';
        }

        return true;
      },
    },
  },

  {
    name: 'addressLine1',
    label: 'Residential Address',
    type: 'text',
    placeholder: 'Enter Building / Street / Plot number',
    required: true,
    validation: {
      required: 'Residential address is required',
      minLength: { value: 5, message: 'Address must be at least 5 characters' },
    },
  },

  {
    name: 'addressLine2',
    label: ' ',
    type: 'text',
    placeholder: 'Enter Landmark / Area',
    required: false,
  },

  {
    name: 'mobileNumber',
    label: 'Phone Number',
    placeholder: 'Enter 10-digit phone number',
    type: 'text',
    required: true,
    validation: {
      required: 'Phone number is required',
      validate: (value: string, formValues: any) => {
        if (!value) return true;
        if (!/^\d+$/.test(value)) {
          return 'Enter a valid number ';
        }
        if (formValues.nationality === 'indian') {
          return (
            INDIA_PHONE_REGEX.test(value) || 'Enter a valid Indian phone number'
          );
        }

        if (formValues.nationality === 'emirati') {
          return (
            UAE_PHONE_REGEX.test(value) || 'Enter a valid UAE phone number'
          );
        }

        return true;
      },
    },
  },

  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter the email',
    required: true,
    validation: {
      required: 'Email is required',
      pattern: { value: EMAIL_REGEX, message: 'Enter a valid email address' },
    },
  },
];
