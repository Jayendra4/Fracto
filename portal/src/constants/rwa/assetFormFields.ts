import type { IFieldConfig } from '@/interface';

const TITLE_REGEX = /^[A-Za-z0-9\-_,.()]+(?: [A-Za-z0-9\-_,.()]+)*$/;

const PINCODE_REGEX = /^[0-9]{6}$|^[0-9]{4,10}$/;

const GEO_REGEX =
  /^-?(?:90(?:\.0+)?|[1-8]?\d(?:\.\d+)?),\s*-?(?:180(?:\.0+)?|1[0-7]\d(?:\.\d+)?|[1-9]?\d(?:\.\d+)?)$/;

const isValidMapUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const assetFormFields: IFieldConfig[] = [
  {
    name: 'assetType',
    label: 'Asset Type',
    type: 'select',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    placeholder: 'Select asset type',
    required: true,
    options: [
      { label: 'Real Estate', value: 'RealEstate' },
      { label: 'Solar', value: 'Solar' },
      { label: 'Machinery', value: 'Machinery' },
      { label: 'EVFleet', value: 'EVFleet' },
      { label: 'Warehouse', value: 'Warehouse' },
      { label: 'Store', value: 'Store' },
      { label: 'Gold', value: 'Gold' },
      { label: 'Business', value: 'Business' },
      { label: 'IP', value: 'IP' },
      { label: 'Others', value: 'Others' },
    ],
    validation: {
      required: 'Asset type is required',
    },
  },

  {
    name: 'assetSubType',
    label: 'Asset Sub-Type',
    type: 'select',
    placeholder: 'Select asset sub-type',
    required: true,
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    options: [
      { label: 'Industrial', value: 'Industrial' },
      { label: 'Commercial', value: 'Commercial' },
      { label: 'Retail', value: 'Retail' },
      { label: 'Residential', value: 'Residential' },
    ],
    validation: {
      required: 'Asset sub-type is required',
    },
  },

  {
    name: 'assetTitle',
    label: 'Asset Name',
    type: 'text',
    placeholder: 'Enter a title or identifier',
    required: true,
    tooltip: true,
    helpDesk: false,
    toolTipContent: 'Title for the asset to help users easily identify it.',
    validation: {
      required: 'Asset name is required',
      minLength: { value: 5, message: 'Minimum 5 characters required' },
      maxLength: { value: 100, message: 'Maximum 100 characters allowed' },
      pattern: {
        value: TITLE_REGEX,
        message: 'No spaces allowed. Use letters, numbers or symbols only',
      },
    },
  },

  {
    name: 'shortDescription',
    label: 'Short Description',
    type: 'textarea',
    placeholder: 'Describe your asset in 50–250 characters',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Provide a brief summary of the asset highlighting key details.',
    required: true,
    validation: {
      required: 'Short description is required',
      minLength: { value: 50, message: 'Minimum 50 characters required' },
      maxLength: { value: 250, message: 'Maximum 250 characters allowed' },
    },
  },

  {
    name: 'detailedDescription',
    label: 'Detailed Description',
    type: 'textarea',
    placeholder: 'Give full detailed explanation of the asset',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Add a comprehensive description including features, specifications, and important information.',
    required: true,
    validation: {
      required: 'Detailed description is required',
      minLength: { value: 100, message: 'Minimum 100 characters required' },
      maxLength: { value: 2000, message: 'Maximum 2000 characters allowed' },
    },
  },

  {
    name: 'country',
    label: 'Country',
    type: 'select',
    placeholder: 'Select country',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
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
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
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
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
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
    type: 'text',
    placeholder: 'Enter Pincode',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    required: true,
    validation: {
      required: 'Pincode is required',
      pattern: {
        value: PINCODE_REGEX,
        message: 'Enter a valid Indian or UAE pincode',
      },
    },
  },

  {
    name: 'mapUrl',
    label: 'Location URL',
    type: 'text',
    placeholder: 'Paste Google Maps or location link (optional)',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    required: false,
    fullWidth: true,
    validation: {
      validate: (value?: string) => {
        if (!value) return true;
        return (
          isValidMapUrl(value) ||
          'Enter a valid URL (starting with http:// or https://)'
        );
      },
    },
  },

  {
    name: 'geoLocation',
    label: 'Geo Location',
    type: 'geo',
    placeholder: 'Latitude, Longitude',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    required: true,
    validation: {
      required: 'Geo location is required',
      pattern: {
        value: GEO_REGEX,
        message: 'Enter valid latitude, longitude',
      },
    },
  },

  {
    name: 'assetImages',
    label: 'Asset Images',
    type: 'image',
    placeholder: 'Upload images',
    tooltip: true,
    helpDesk: false,
    toolTipContent:
      'Upload at least 5 images. Maximum file size allowed is 300 MB per file.',
    maxFiles: 25,
    required: true,
    validation: {
      required: 'At least 5 images are required',
      validate: (files: unknown[]) => {
        if (!files || files.length < 5) {
          return 'Minimum 5 images are required';
        }
        if (files.length > 25) {
          return 'Maximum 25 images allowed';
        }
        return true;
      },
    },
  },

  {
    name: 'assetVideos',
    label: 'Asset Videos',
    type: 'video',
    placeholder: 'Upload videos',
    tooltip: false,
    toolTipContent: '',
    helpDesk: false,
    required: false,
    maxFiles: 5,
    validation: {
      // required: 'At least 1 video is required',
      // validate: (files: any[]) => {
      //   if (!files || files.length < 1) {
      //     return 'Minimum 1 video is required';
      //   }
      //   if (files.length > 5) {
      //     return 'Maximum 5 videos allowed';
      //   }
      //   return true;
      // },
    },
  },
  {
    name: 'whyInvested',
    label: 'Why they invested on this property',
    type: 'whyInvested',
    required: true,
    validation: {
      validate: (value) => {
        if (!value || value.length !== 4) {
          return 'All 4 entries are required';
        }
        return true;
      },
    },
  },
];
