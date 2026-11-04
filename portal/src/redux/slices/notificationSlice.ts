import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    token: null as string | null,
  },
  reducers: {
    setFcmToken(state, action) {
      state.token = action.payload;
    },
  },
});

export const { setFcmToken } = notificationSlice.actions;
export default notificationSlice.reducer;
