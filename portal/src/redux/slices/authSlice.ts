import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  registration: Record<string, any>;
}
const draft = (() => {
  try {
    const d = localStorage.getItem('hof_registration_draft');
    return d ? JSON.parse(d) : {};
  } catch {
    return {};
  }
})();

const initialState: AuthState = {
  registration: draft,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    saveRegistrationData: (
      state,
      action: PayloadAction<Record<string, any>>
    ) => {
      state.registration = { ...state.registration, ...action.payload };
    },
    clearRegistrationData: (state) => {
      state.registration = {};
    },
  },
});

export const { saveRegistrationData, clearRegistrationData } =
  authSlice.actions;
export default authSlice.reducer;
