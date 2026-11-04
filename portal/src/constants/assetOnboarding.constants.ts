import type { IFieldConfig } from '@/interface';

export const assetOnboardingFields: IFieldConfig[] = [
  {
    name: 'ownerFirstName',
    label: "Asset Owner's First Name",
    type: 'text',
    placeholder: 'Enter first name',
    required: true,
    validation: {
      required: 'First name is required',
      minLength: { value: 2, message: 'Minimum 2 characters' },
    },
  },
  {
    name: 'ownerLastName',
    label: "Asset Owner's Last Name",
    type: 'text',
    placeholder: 'Enter last name',
    required: true,
    validation: {
      required: 'Last name is required',
      minLength: { value: 2, message: 'Minimum 2 characters' },
    },
  },
  {
    name: 'ownerEmail',
    label: "Asset Owner's Email",
    type: 'email',
    placeholder: 'Enter email',
    required: true,
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Enter a valid email',
      },
    },
  },
  {
    name: 'ownerMobile',
    label: "Asset Owner's Mobile Number",
    type: 'contact',
    placeholder: '+911234567890',
    required: true,
    validation: {
      required: 'Mobile number is required',
      pattern: {
        value: /^(\+91\d{10}|\+971\d{9})$/,
        // message: 'Enter valid +91 or +971 number',
        message: 'Enter valid number',
      },
    },
  },

  {
    name: 'proposedCommissionPct',
    label: 'Proposed Commission (%)',
    type: 'number',
    placeholder: 'e.g. 2.5',
    required: true,
    validation: {
      required: 'Commission percentage is required',
      min: { value: 0, message: 'Minimum is 0%' },
      max: { value: 100, message: 'Maximum is 100%' },
    },
  },

  {
    name: 'brokerNote',
    label: 'Note',
    type: 'textarea',
    placeholder: 'Add notes for internal review',
  },
];

export const assetOnboardingGroup1 = assetOnboardingFields.slice(0, 3);
// assetId + first + last

export const assetOnboardingGroup2 = assetOnboardingFields.slice(3, 5);
// email + mobile

export const assetOnboardingGroup3 = assetOnboardingFields.slice(5, 6);
// commission

export const assetOnboardingGroup4 = assetOnboardingFields.slice(6);
// note
