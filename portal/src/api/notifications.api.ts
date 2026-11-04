/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed error handling, matches the pattern in rwa.api.ts */
import type { IApiResponse } from '@/interface';
import { useMutation, type InfiniteData } from '@tanstack/react-query';
import { axiosRequest } from '@/services';
import { useInfiniteQuery } from '@tanstack/react-query';

export interface DeviceTokenReq {
  token: string;
}

export const registerDeviceTokenApi = async (
  data: DeviceTokenReq
): Promise<IApiResponse<null>> => {
  return axiosRequest<null>({
    method: 'POST',
    endpoint: '/auth/device-token',
    data,
  });
};

export function useRegisterDeviceToken() {
  return useMutation({
    mutationFn: (data: DeviceTokenReq) => registerDeviceTokenApi(data),
  });
}

export type NotificationItem = {
  id: number;
  title: string;
  body: string | null;
  path: string | null;
  viewed: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsResponse = {
  count: number;
  skip: number;
  take: number;
  data: NotificationItem[];
};

const fetchMyNotifications = async ({
  pageParam = 0,
}: {
  pageParam?: number;
}): Promise<IApiResponse<NotificationsResponse>> => {
  return axiosRequest<NotificationsResponse>({
    method: 'GET',
    endpoint: '/notification/me',
    params: {
      skip: pageParam,
      take: 10,
    },
  });
};

export function useMyNotifications(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useInfiniteQuery<
    IApiResponse<NotificationsResponse>,
    any,
    InfiniteData<IApiResponse<NotificationsResponse>>,
    ['my-notifications'],
    number
  >({
    queryKey: ['my-notifications'],
    initialPageParam: 0,

    queryFn: ({ pageParam }) => fetchMyNotifications({ pageParam }),

    enabled: options?.enabled ?? true,

    getNextPageParam: (lastPage) => {
      if (!lastPage.success) return undefined;

      const { skip, take, count } = lastPage.data ?? {
        skip: 0,
        take: 0,
        count: 0,
      };
      const nextSkip = skip + take;

      return nextSkip < count ? nextSkip : undefined;
    },

    retry: (count, error: any) => {
      if (error?.response?.status === 401) return false;
      return count < 2;
    },

    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: options?.refetchInterval ?? false,
    refetchIntervalInBackground: false,
  });
}

export const markNotificationReadApi = async (id: number) => {
  return axiosRequest<null>({
    method: 'PATCH',
    endpoint: `/notification/${id}/read`,
  });
};

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: (id: number) => markNotificationReadApi(id),
  });
}
