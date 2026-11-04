import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface KYBState {
  step: 1 | 2 | 3 | 4;
  step1Data: Record<string, any>;
  step2Data: Record<string, any>;
  step3Data: Record<string, any>;
  step4Data: {
    filesMeta?: Record<
      string,
      { name: string; type: string; size: number } | null
    >;
    extraData?: any;
  };
  companyId: string | null;
}

const initialState: KYBState = {
  step: 1,
  step1Data: {},
  step2Data: {},
  step3Data: {},
  step4Data: {},
  companyId: null,
};

export const kybSlice = createSlice({
  name: 'kyb',
  initialState,
  reducers: {
    saveStep: (state, action: PayloadAction<1 | 2 | 3 | 4>) => {
      state.step = action.payload;
    },

    saveStepData: (
      state,
      action: PayloadAction<{ step: number; data: any }>
    ) => {
      const { step, data } = action.payload;

      if (step === 1) state.step1Data = data;
      if (step === 2) state.step2Data = data;
      if (step === 3) state.step3Data = data;

      if (step === 4) {
        state.step4Data = {
          filesMeta: data.filesMeta || state.step4Data.filesMeta || {},
          extraData: data.extraData || state.step4Data.extraData || {},
        };
      }
    },

    setCompanyId: (state, action: PayloadAction<string>) => {
      state.companyId = action.payload;
    },

    setKybDataFromApi: (state, action: PayloadAction<Partial<KYBState>>) => {
      if (action.payload.step1Data) state.step1Data = action.payload.step1Data;
      if (action.payload.step2Data) state.step2Data = action.payload.step2Data;
      if (action.payload.step3Data) state.step3Data = action.payload.step3Data;
      if (action.payload.companyId) state.companyId = action.payload.companyId;
    },

    resetKyb: () => {
      return initialState;
    },
  },
});

export const {
  saveStep,
  saveStepData,
  setCompanyId,
  setKybDataFromApi,
  resetKyb,
} = kybSlice.actions;
export default kybSlice.reducer;
