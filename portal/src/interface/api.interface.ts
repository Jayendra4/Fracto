import type { Method } from 'axios';

export type IApiResponse<T> =
  | {
      success: true;
      data?: T;
      message?: string;
    }
  | {
      success: false;
      error?: string;
      message?: string;
    };

export interface IApiRequestOptions<
  TData = unknown,
  TParams = Record<string, unknown>,
> {
  method?: Method;
  endpoint: string;
  data?: TData;
  params?: TParams;
  headers?: Record<string, string>;
  unwrapData?: boolean;
}
