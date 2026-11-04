import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface DirectorKycState {
  step: 1 | 2;
}

const initialState: DirectorKycState = {
  step: 1,
};

const directorKycSlice = createSlice({
  name: 'directorKyc',
  initialState,
  reducers: {
    saveDirectorKycStep(state, action: PayloadAction<1 | 2>) {
      state.step = action.payload;
    },
    resetDirectorKyc() {
      return initialState;
    },
  },
});

export const { saveDirectorKycStep, resetDirectorKyc } =
  directorKycSlice.actions;

export default directorKycSlice.reducer;
