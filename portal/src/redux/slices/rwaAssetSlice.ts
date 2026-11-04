import { createSlice } from '@reduxjs/toolkit';

interface RwaAssetState {
  step: 1 | 2 | 3 | 4;
  assetId: string | null;

  step1Data: any;
  step2Data: any;
  step3Data: any;
  step4Data: any;

  step1Docs?: any[];
  step2Docs?: any[];
  step3Docs?: any[];
  step4Docs?: any[];
}

const initialState: RwaAssetState = {
  step: 1,
  assetId: null,

  step1Data: null,
  step2Data: null,
  step3Data: null,
  step4Data: null,

  step1Docs: undefined,
  step2Docs: undefined,
  step3Docs: undefined,
  step4Docs: undefined,
};

const stripFileFields = (data: any) => {
  if (!data) return data;

  const clean: any = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === undefined || value === null) return;

    if (
      value instanceof File ||
      value instanceof Blob ||
      (Array.isArray(value) && value.some((v) => v instanceof File)) ||
      (typeof value === 'object' && value?.__isFile) ||
      key === 'documents' ||
      key === 'extra'
    ) {
      return;
    }

    clean[key] = value;
  });

  return clean;
};

const rwaAssetSlice = createSlice({
  name: 'rwaAsset',
  initialState,
  reducers: {
    saveStep(state, action) {
      state.step = action.payload;
    },

    saveStepData(state, action) {
      const { step, data } = action.payload;
      const cleaned = stripFileFields(data);
      // @ts-ignore
      state[`step${step}Data`] = cleaned;
    },

    saveStepDocuments(state, action) {
      const { step, documents } = action.payload;
      // @ts-ignore
      state[`step${step}Docs`] = documents || undefined;
    },

    setAssetId(state, action) {
      state.assetId = action.payload;
    },

    resetRwaAsset() {
      return initialState;
    },
  },
});

export const {
  saveStep,
  saveStepData,
  saveStepDocuments,
  setAssetId,
  resetRwaAsset,
} = rwaAssetSlice.actions;

export default rwaAssetSlice.reducer;
