import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
    hasUnread: boolean;
}

const initialState: NotificationState = {
    hasUnread: false,
};

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setHasUnread: (state, action: PayloadAction<boolean>) => {
            state.hasUnread = action.payload;
        },
    },
});

export const { setHasUnread } = notificationSlice.actions;

export default notificationSlice.reducer;
