import { Option } from '@/types';

export const RWA_STORAGE_KEY = 'MASTER_RWA_FORM';
export const KYC_STORAGE_KEY = 'KYC_FORM';
export const FCM_STORAGE_KEY = 'FCM_TOKEN_SENT';

export const occupationOptions: Option[] = [
  { label: 'Employed', value: 'employed' },
  { label: 'Self Employed', value: 'self_employed' },
  { label: 'Student', value: 'student' },
  { label: 'Homemaker', value: 'homemaker' },
  { label: 'Retired', value: 'retired' },
];

export const industryOptions: Option[] = [
  { label: 'Agriculture', value: 'agriculture' },
  { label: 'Arms and Ammunition', value: 'arms' },
  { label: 'Art and Entertainment', value: 'entertainment' },
  { label: 'Aviation', value: 'aviation' },
  { label: 'Banking & Financial Services', value: 'banking' },
  { label: 'Construction', value: 'construction' },
  { label: 'Education', value: 'education' },
  { label: 'Energy', value: 'energy' },
  { label: 'Food & Beverage', value: 'food' },
];

export const incomeOptions: Option[] = [
  { label: '₹25,000 or Less', value: '<25000' },
  { label: '₹25,000 - ₹50,000', value: '25000-50000' },
  { label: '₹50,000 - ₹100,000', value: '50000-100000' },
  { label: '₹100,000 - ₹200,000', value: '100000-200000' },
  { label: '₹200,000 - ₹300,000', value: '200000-300000' },
  { label: '₹300,000 - ₹400,000', value: '300000-400000' },
  { label: '₹400,000 - ₹1,000,000', value: '400000-1000000' },
];
