import { saveStep } from '@/redux/slices/kybSlice';
import type { Dispatch } from '@reduxjs/toolkit';

export const persistStepUtil = (
  dispatch: Dispatch,
  newStep: 1 | 2 | 3 | 4,
  setStep: (s: 1 | 2 | 3 | 4) => void
) => {
  setStep(newStep);
  dispatch(saveStep(newStep));

  try {
    localStorage.setItem('kyb_step', JSON.stringify(newStep));
  } catch {}
};
