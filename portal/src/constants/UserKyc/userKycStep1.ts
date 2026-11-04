import type { IFieldConfig } from '@/interface';

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const AMOUNT_REGEX = /^[0-9]+(\.[0-9]{1,2})?$/;
const INDIA_PHONE_REGEX = /^[6-9][0-9]{9}$/;
const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9._%+-]+)@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/;

export const userKycStep1: IFieldConfig[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter the first name',
    required: true,
    validation: {
      required: 'First name is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets allowed, spaces only between words',
      },
      minLength: {
        value: 2,
        message: 'First name must be at least 2 characters',
      },
      maxLength: {
        value: 50,
        message: 'First name cannot exceed 50 characters',
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
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets allowed, spaces only between words',
      },
      minLength: {
        value: 1,
        message: 'Last name must be at least 1 character',
      },
      maxLength: {
        value: 50,
        message: 'Last name cannot exceed 50 characters',
      },
    },
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
        const dob = new Date(value);
        const today = new Date();
        const age =
          today.getFullYear() -
          dob.getFullYear() -
          (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
            ? 1
            : 0);

        return age >= 18 || 'You must be at least 18 years old';
      },
    },
  },

  {
    name: 'panNumber',
    label: 'PAN Number',
    type: 'text',
    required: true,
    placeholder: 'Enter PAN',
    externalConditionalShow: {
      key: 'nationality',
      value: 'india',
    },
    validation: {
      required: 'Enter a valid PAN (ABCDE1234F)',
      pattern: {
        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
        message: 'Enter a valid PAN (ABCDE1234F)',
      },
    },
  },

  {
    name: 'passportNumber',
    label: 'Passport Number',
    type: 'text',
    placeholder: 'Enter Passport Number',
    required: false,
    externalConditionalShow: {
      key: 'nationality',
      value: 'india',
    },
    validation: {
      pattern: {
        value: /^[A-Za-z0-9]{6,15}$/,
        message: 'Enter a valid passport number',
      },
    },
  },

  {
    name: 'emiratesIdNumber',
    label: 'Emirates ID Number (UAE)',
    type: 'text',
    placeholder: 'Enter Emirates ID',
    required: false,
    externalConditionalShow: {
      key: 'nationality',
      value: 'uae',
    },
    validation: {
      required: 'Enter a valid 15-digit Emirates ID',
      pattern: {
        value: /^[0-9]{15}$/,
        message: 'Enter a valid 15-digit Emirates ID',
      },
    },
  },

  {
    name: 'passportNumber',
    label: 'Passport Number',
    type: 'text',
    placeholder: 'Enter Passport Number',
    required: true,
    externalConditionalShow: {
      key: 'nationality',
      value: 'uae',
    },
    validation: {
      required: 'Passport number is required',
      pattern: {
        value: /^[A-Za-z0-9]{6,15}$/,
        message: 'Enter a valid passport number',
      },
    },
  },

  {
    name: 'occupation',
    label: 'Occupation',
    type: 'text',
    placeholder: 'Enter your Occupation',
    required: true,
    validation: {
      required: 'Occupation is required',
      pattern: {
        value: NAME_REGEX,
        message: 'Only alphabets allowed',
      },
      minLength: {
        value: 2,
        message: 'Occupation must be at least 2 characters',
      },
    },
  },

  {
    name: 'monthlyIncome',
    label: 'Monthly Income',
    type: 'text',
    placeholder: 'Enter your Monthly Income',
    required: true,
    validation: {
      required: 'Monthly Income is required',
      pattern: {
        value: AMOUNT_REGEX,
        message: 'Enter a valid amount (up to 2 decimals)',
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
    searchable: true,
    options: [],
    validation: {
      required: 'State is required',
    },
  },

  {
    name: 'city',
    label: 'City',
    type: 'select',
    placeholder: 'Select City',
    searchable: true,
    required: true,
    options: [],
    validation: {
      required: 'City is required',
    },
  },

  {
    name: 'pincode',
    label: 'Pincode',
    type: 'text',
    placeholder: 'Enter Pincode',
    required: true,
    validation: {
      required: 'Pincode is required',
      pattern: {
        value: /^[0-9]{4,10}$/,
        message: 'Enter a valid pincode',
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
      required: 'Residential Address is required',
      minLength: {
        value: 5,
        message: 'Address must be at least 5 characters',
      },
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
    type: 'text',
    placeholder: 'Enter the phone number',
    required: true,
    validation: {
      required: 'Phone number is required',
      pattern: {
        value: INDIA_PHONE_REGEX,
        message: 'Enter a valid 10-digit Indian mobile number',
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
      pattern: {
        value: EMAIL_REGEX,
        message: 'Enter a valid email address',
      },
    },
  },
];
