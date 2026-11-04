export const validators = {
  required: (v: string) => (v.trim() ? '' : 'This field is required'),

  minLength: (len: number) => (v: string) =>
    v.length >= len ? '' : `Must be at least ${len} characters`,

  pan: (v: string) =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) ? '' : 'Invalid PAN format',

  pincode: (v: string) => (/^\d{6}$/.test(v) ? '' : 'Pincode must be 6 digits'),

  dob: (v: string) => {
    if (!v) return 'Date of birth is required';

    const selected = new Date(v);
    const today = new Date();

    if (selected > today) {
      return 'Date of birth cannot be in the future';
    }

    return '';
  },

  file: (f: File | null) => (f ? '' : 'File is required'),
};
