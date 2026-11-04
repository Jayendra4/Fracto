export interface Option {
  label: string;
  value: string;
}

export const countryOptions: Option[] = [
  { label: '🇮🇳 India', value: 'IN' },
  { label: '🇦🇪 United Arab Emirates', value: 'AE' },
];

export const stateOptionsByCountry: Record<string, Option[]> = {
  IN: [
    { label: 'Maharashtra', value: 'MH' },
    { label: 'Delhi', value: 'DL' },
    { label: 'Madhya Pradesh', value: 'MP' },
    { label: 'Karnataka', value: 'KA' },
    { label: 'Uttar Pradesh', value: 'UP' },
    { label: 'Tamil Nadu', value: 'TN' },
    { label: 'Telangana', value: 'TS' },
    { label: 'Gujarat', value: 'GJ' },
    { label: 'Rajasthan', value: 'RJ' },
    { label: 'West Bengal', value: 'WB' },
  ],

  AE: [
    { label: 'Dubai', value: 'DXB' },
    { label: 'Abu Dhabi', value: 'AUH' },
    { label: 'Sharjah', value: 'SHJ' },
    { label: 'Ajman', value: 'AJM' },
    { label: 'Ras Al Khaimah', value: 'RAK' },
    { label: 'Fujairah', value: 'FUJ' },
    { label: 'Umm Al Quwain', value: 'UAQ' },
  ],
};

export const cityOptionsByState: Record<string, Option[]> = {
  //India
  MP: [
    { label: 'Gwalior', value: 'gwalior' },
    { label: 'Bhopal', value: 'bhopal' },
    { label: 'Indore', value: 'indore' },
  ],

  DL: [
    { label: 'New Delhi', value: 'new_delhi' },
    { label: 'Dwarka', value: 'dwarka' },
    { label: 'Rohini', value: 'rohini' },
  ],

  MH: [
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Pune', value: 'pune' },
    { label: 'Nagpur', value: 'nagpur' },
    { label: 'Nashik', value: 'nashik' },
  ],

  KA: [
    { label: 'Bengaluru', value: 'bengaluru' },
    { label: 'Mysuru', value: 'Mysuru' },
    { label: 'Mangaluru', value: 'mangaluru' },
  ],

  TN: [
    { label: 'Chennai', value: 'chennai' },
    { label: 'Coimbatore', value: 'coimbatore' },
    { label: 'Madurai', value: 'madurai' },
  ],

  TS: [
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Warangal', value: 'warangal' },
  ],

  UP: [
    { label: 'Lucknow', value: 'lucknow' },
    { label: 'Noida', value: 'noida' },
    { label: 'Ghaziabad', value: 'ghaziabad' },
  ],

  GJ: [
    { label: 'Ahmedabad', value: 'ahmedabad' },
    { label: 'Surat', value: 'surat' },
    { label: 'Vadodara', value: 'vadodara' },
  ],

  WB: [
    { label: 'Kolkata', value: 'kolkata' },
    { label: 'Howrah', value: 'howrah' },
  ],

  //UAE
  DXB: [
    { label: 'Dubai City', value: 'dubai_city' },
    { label: 'Jumeirah', value: 'jumeirah' },
    { label: 'Deira', value: 'deira' },
    { label: 'Bur Dubai', value: 'bur_dubai' },
  ],

  AUH: [
    { label: 'Abu Dhabi City', value: 'abu_dhabi_city' },
    { label: 'Al Ain', value: 'al_ain' },
  ],

  SHJ: [
    { label: 'Sharjah City', value: 'sharjah_city' },
    { label: 'Kalba', value: 'kalba' },
  ],

  AJM: [{ label: 'Ajman City', value: 'ajman_city' }],

  RAK: [{ label: 'Ras Al Khaimah City', value: 'rak_city' }],

  FUJ: [{ label: 'Fujairah City', value: 'fujairah_city' }],

  UAQ: [{ label: 'Umm Al Quwain City', value: 'uaq_city' }],
};
