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
    sendFcmToken: builder.mutation<
      any,
      {
        token: string;
      }
    >({
      query: (body) => ({
        url: '/auth/device-token',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
    getAllNotifications: builder.query<
      NotificationsResponse,
      { skip?: number; take?: number; search?: string; fromDate?: string; toDate?: string }
    >({
      query: ({ skip = 0, take = 10, search, fromDate, toDate }) => ({
        url: '/notification/me',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['Notification'],
    }),
    updateReadStatus: builder.mutation<
      void,
      {
        id: number;
      }
    >({
      query: ({ id }) => ({
        url: `/notification/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notification/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useSendFcmTokenMutation,
  useGetAllNotificationsQuery,
  useUpdateReadStatusMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
