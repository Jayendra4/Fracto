import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationItem {
    id: number;
    code: string;
    title: string;
    body: string;
    data: any | null;
    type: string;
    viewed: boolean;
    readAt: string | null;
    createdAt: string;
}

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        setNotifications(state, action: PayloadAction<NotificationItem[]>) {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.viewed).length;
        },

        appendNotifications: (state, action) => {
            const newItems = action.payload;
            const existingIds = new Set(state.notifications.map(n => n.id));
            const filtered = newItems.filter((item: any) => !existingIds.has(item.id));
            state.notifications = [...state.notifications, ...filtered];
            const newUnread = filtered.filter((item: any) => !item.viewed).length;
            state.unreadCount += newUnread;
        },

        markAsRead(state, action: PayloadAction<number>) {
            const item = state.notifications.find(n => n.id === action.payload);
            if (item && !item.viewed) {
                item.viewed = true;
                state.unreadCount -= 1;
            }
        },

        markAllAsRead(state) {
            state.notifications = state.notifications.map(n => ({
                ...n,
                viewed: true,
            }));
            state.unreadCount = 0;
        },

        resetNotifications(state) {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
});

export const {
    setNotifications,
    appendNotifications,
    markAsRead,
    markAllAsRead,
    resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;