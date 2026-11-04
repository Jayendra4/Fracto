import { apiSlice } from './apiSlice';

export type NotificationType = 'INFORMATIONAL' | 'TRANSACTIONAL' | 'SYSTEM' | 'MARKETING';

export interface RwaSubmittedData {
  assetId: number;
  assetTitle: string;
  rwaRequestId: number;
}

export interface DepositOrWithdrawalData {
  amount: number;
  userName: string;
}

export type NotificationData = RwaSubmittedData | DepositOrWithdrawalData;

export interface Notification {
  id: number;
  code: string;
  title: string;
  body: string;
  data: NotificationData;
  path?: string;
  type: NotificationType;
  viewed: boolean;
  readAt: string | null;
  createdAt: string; // ISO date string
}

// Paginated response interface
export interface NotificationsResponse {
  count: number;
  skip: number;
  take: number;
  data: Notification[];
}

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendFcmToken: builder.mutation<any, { token: string }>({
      query: (body) => ({
        url: '/auth/device-token',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),

    getAllNotifications: builder.query<
      NotificationsResponse,
      { skip?: number; take?: number; search?: string }
    >({
      query: ({ skip = 0, take = 10, search }) => ({
        url: '/notification/me',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Notification'],
    }),

    getUnreadNotificationCount: builder.query<number, void>({
      query: () => ({
        url: '/notification/me',
        params: { skip: 0, take: 1, viewed: false },
      }),
      transformResponse: (res: NotificationsResponse) => res.count,
      providesTags: ['Notification'],
    }),

    updateReadStatus: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/notification/${id}/read`,
        method: 'PATCH',
      }),
      // Optimistically decrement the unread count by 1
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          notificationApi.util.updateQueryData('getUnreadNotificationCount', undefined, (count) =>
            Math.max(0, count - 1)
          )
        );
      },
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notification/read-all',
        method: 'PATCH',
      }),
      // Immediately set count to 0 after mark-all-read succeeds
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          notificationApi.util.updateQueryData('getUnreadNotificationCount', undefined, () => 0)
        );
      },
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useSendFcmTokenMutation,
  useGetAllNotificationsQuery,
  useUpdateReadStatusMutation,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
