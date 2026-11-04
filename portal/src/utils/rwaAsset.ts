import { saveStep } from '@/redux/slices/rwaAssetSlice';
import type { AppDispatch } from '@/redux/store';

export const persistRwaStepUtil = ({
  dispatch,
  newStep,
  setStepFn,
}: {
  dispatch: AppDispatch;
  newStep: 1 | 2 | 3 | 4;
  setStepFn: (step: 1 | 2 | 3 | 4) => void;
}) => {
  dispatch(saveStep(newStep));

  try {
    localStorage.setItem('rwa_asset_step', JSON.stringify(newStep));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded) — step still lives in redux
  }

  setStepFn(newStep);
};

export const AssetTypes = [
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
];

export const AssetSubTypes = [
  { label: 'Industrial', value: 'Industrial' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Residential', value: 'Residential' },
];

export const OwnerMode = [
  { label: 'Private limited', value: 'Privatelimited' },
  { label: 'Limited', value: 'Limited' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'Individual', value: 'Individual' },
  { label: 'Trust', value: 'Trust' },
  { label: 'LLP', value: 'LLP' },
];

export const getFileType = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  if (ext === 'pdf') return 'pdf';
  return 'image';
};
