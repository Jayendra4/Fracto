import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
    unreadChatCount: number;
}

const initialState: ChatState = {
    unreadChatCount: 0,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadChatCount = action.payload;
        },

        incrementUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadChatCount += action.payload;
        },

        decrementUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadChatCount = Math.max(0, state.unreadChatCount - action.payload);
        },
    },
});

export const {
    setUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;