import type { IApiRequestOptions, IApiResponse } from '@/interface';
import axiosClient from '@/lib/axios';
import { AxiosError } from 'axios';

// function handleSuccess<T>(data: T): IApiResponse<T> {
//   return {
//     success: true as const,
//     data,
//     message: 'Success',
//   };
// }

// function handleError<T>(error: unknown): IApiResponse<T> {
//   let message = 'Something went wrong';

//   if (error instanceof AxiosError) {
//     message =
//       (error.response?.data as { message?: string })?.message ||
//       error.message ||
//       message;
//   } else if (error instanceof Error) {
//     message = error.message;
//   }

//   return {
//     success: false as const,
//     error: message,
//     message: message,
//   };
// }

export async function axiosRequest<
  T,
  TData = unknown,
  TParams = Record<string, unknown>,
>({
  method = 'GET',
  endpoint,
  data,
  params,
  headers = {},
}: IApiRequestOptions<TData, TParams>): Promise<IApiResponse<T>> {
  try {
    const response = await axiosClient({
      method,
      url: endpoint,
      data,
      params,
      headers,
    });

    const resData = response.data;

    const hasSuccess = typeof resData === 'object' && resData !== null && 'success' in resData;

    // Use success/message from backend if they exist
    const isActuallySuccessful = hasSuccess ? resData.success : true;

    const backendMessage =
      typeof resData === 'object' && resData !== null && 'message' in resData
        ? resData.message
        : 'Success';

    // Only unwrap if it's a standard envelope (has success AND data)
    const payload =
      hasSuccess &&
        typeof resData === 'object' &&
        resData !== null &&
        'data' in resData
        ? resData.data
        : resData;

    return {
      success: isActuallySuccessful,
      data: payload as T,
      message: backendMessage,
    };
  } catch (error) {
    let message = 'Something went wrong';

    if (error instanceof AxiosError) {
      message =
        (error.response?.data as any)?.message || error.message || message;
    }

    return {
      success: false,
      error: message,
      message,
    };
  }
}
