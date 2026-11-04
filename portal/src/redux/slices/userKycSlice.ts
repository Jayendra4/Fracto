import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserKycState {
  step: 1 | 2;
}

const initialState: UserKycState = {
  step: 1,
};

const userKycSlice = createSlice({
  name: 'userKyc',
  initialState,
  reducers: {
    saveUserKycStep(state, action: PayloadAction<1 | 2>) {
      state.step = action.payload;
    },
    resetUserKyc() {
      return initialState;
    },
  },
});

export const { saveUserKycStep, resetUserKyc } = userKycSlice.actions;
export default userKycSlice.reducer;
