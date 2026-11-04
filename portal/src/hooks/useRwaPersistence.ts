import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '@/redux/store';
import {
  saveStep,
  saveStepData,
  saveStepDocuments,
  setAssetId,
} from '@/redux/slices/rwaAssetSlice';

import { persistStepUtil } from '@/utils/CompanyKyb';

type WizardStep = 1 | 2 | 3 | 4;

export const useRwaPersistence = () => {
  const dispatch = useDispatch();

  const savedStep = useSelector((state: RootState) => state.rwaAsset.step);
  const step1Data = useSelector((state: RootState) => state.rwaAsset.step1Data);
  const step2Data = useSelector((state: RootState) => state.rwaAsset.step2Data);
  const step3Data = useSelector((state: RootState) => state.rwaAsset.step3Data);
  const step4Data = useSelector((state: RootState) => state.rwaAsset.step4Data);

  const step1Docs = useSelector((state: RootState) => state.rwaAsset.step1Docs);
  const step2Docs = useSelector((state: RootState) => state.rwaAsset.step2Docs);
  const step3Docs = useSelector((state: RootState) => state.rwaAsset.step3Docs);
  const step4Docs = useSelector((state: RootState) => state.rwaAsset.step4Docs);

  const [step, setStep] = useState<WizardStep>(savedStep || 1);

  useEffect(() => {
    try {
      const savedId = localStorage.getItem('rwa_asset_id');
      const savedStepLS = localStorage.getItem('rwa_asset_step');
      const savedDataLS = localStorage.getItem('rwa_asset_step_data');

      if (savedId) dispatch(setAssetId(JSON.parse(savedId)));
      if (savedStepLS) dispatch(saveStep(JSON.parse(savedStepLS)));

      if (savedDataLS) {
        const parsed = JSON.parse(savedDataLS);

        if (parsed.step1Data)
          dispatch(saveStepData({ step: 1, data: parsed.step1Data }));
        if (parsed.step2Data)
          dispatch(saveStepData({ step: 2, data: parsed.step2Data }));
        if (parsed.step3Data)
          dispatch(saveStepData({ step: 3, data: parsed.step3Data }));
        if (parsed.step4Data)
          dispatch(saveStepData({ step: 4, data: parsed.step4Data }));

        if (parsed.step1Docs)
          dispatch(saveStepDocuments({ step: 1, documents: parsed.step1Docs }));
        if (parsed.step2Docs)
          dispatch(saveStepDocuments({ step: 2, documents: parsed.step2Docs }));
        if (parsed.step3Docs)
          dispatch(saveStepDocuments({ step: 3, documents: parsed.step3Docs }));
        if (parsed.step4Docs)
          dispatch(saveStepDocuments({ step: 4, documents: parsed.step4Docs }));
      }
    } catch {}
  }, [dispatch]);

  useEffect(() => {
    if (savedStep) setStep(savedStep as WizardStep);
  }, [savedStep]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step]);

  const persistStep = (newStep: WizardStep) => {
    persistStepUtil(dispatch, newStep, setStep);
    localStorage.setItem('rwa_asset_step', JSON.stringify(newStep));
  };

  const saveAllToLocalStorage = (obj: any) => {
    const clean: any = {};

    Object.keys(obj).forEach((key) => {
      clean[key] = obj[key];
    });

    localStorage.setItem('rwa_asset_step_data', JSON.stringify(clean));
  };

  const goBack = () => {
    if (step > 1) persistStep((step - 1) as WizardStep);
  };

  return {
    step,
    persistStep,
    goBack,
    saveAllToLocalStorage,
    dispatch,
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    step1Docs,
    step2Docs,
    step3Docs,
    step4Docs,
  };
};
