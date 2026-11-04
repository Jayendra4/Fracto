import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';
import { clearAuth } from '@/store/slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('accept', 'application/json');
    return headers;
  },
});

const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  // If token is invalid / expired → force logout
  if (result.error && result.error.status === 401) {
    api.dispatch(clearAuth());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'User',
    'Auth',
    'FeatureFlags',
    'PaymentRequest',
    'BankAccount',
    'UpiAccount',
    'Accounts',
    'rwa',
    'Assets',
    'Notification',
    'Kyc',
    'Coupon',
    'Vendors',
    'Leads',
    'Commissions',
    'Category',
    'Group',
    'Location',
    'GroupMembers',
    'GroupAssets',
    'ManualPayment',
    'Role',
  ],
  endpoints: () => ({}),
});

// Optional (advanced usage)
export const {
  util: { getRunningQueriesThunk },
} = apiSlice;

export default apiSlice;
