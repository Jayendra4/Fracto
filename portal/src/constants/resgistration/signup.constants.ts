import type { IFieldConfig } from '@/interface';
export const signupFields: IFieldConfig[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter your first name',
    validation: {
      required: 'First name is required',
      pattern: {
        value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        message: 'First name must contain only letters and no spaces',
      },
      minLength: {
        value: 2,
        message: 'First name must be at least 2 characters',
      },
    },
    required: true,
  },

  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter your last name',
    validation: {
      required: 'Last name is required',
      pattern: {
        value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        message: 'Last name must contain only letters and no spaces',
      },
      minLength: {
        value: 2,
        message: 'Last name must be at least 2 characters',
      },
    },
    required: true,
  },

  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter your email',
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
        message: 'Enter a valid email address',
      },
    },
    required: true,
    extraText: 'We will never share your email',
  },

  {
    name: 'number',
    label: 'Mobile Number',
    type: 'contact',
    placeholder: 'Enter mobile number',
    validation: {
      required: 'Mobile number is required',
      pattern: {
        value: /^(\+91[6-9]\d{9}|\+9715\d{8})$/,
        // message: 'Enter a valid +91 or +971 mobile number',
        message: 'Enter a valid mobile number',
      },
    },
    required: true,
    extraText: 'We will never share your mobile number',
  },
];
