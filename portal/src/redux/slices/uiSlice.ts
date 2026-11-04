import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isStepperOpen: boolean;
  stepperHeight: number;
  activeRoute: string | null;
}

const initialState: UiState = {
  isStepperOpen: true,
  stepperHeight: 0,
  activeRoute: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setStepperOpen(state, action: PayloadAction<boolean>) {
      state.isStepperOpen = action.payload;
    },
    setStepperHeight(state, action: PayloadAction<number>) {
      state.stepperHeight = action.payload;
    },
    setActiveRoute(state, action: PayloadAction<string>) {
      state.activeRoute = action.payload;
      state.isStepperOpen = true;
    },
  },
});

export const { setStepperOpen, setStepperHeight, setActiveRoute } =
  uiSlice.actions;

export default uiSlice.reducer;
