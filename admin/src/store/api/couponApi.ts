import { Coupon, CouponStatus, CreateCouponPayload, PaginatedResponse } from '@/types';
import { apiSlice } from './apiSlice';
export interface RegisterCouponResponse {
  message: string;
}
export const couponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<
      PaginatedResponse<Coupon>,
      {
        skip?: number;
        take?: number;
        search?: string;
        discountType?: string;
        fromDate?: string;
        toDate?: string;
        couponStatus?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, discountType, couponStatus, fromDate, toDate }) => ({
        url: '/coupons',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),

          discountType,
          fromDate,
          toDate,
          couponStatus,
        },
      }),
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation<RegisterCouponResponse, CreateCouponPayload>({
      query: (payload) => ({
        url: '/coupons',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Coupon'],
    }),
    getCouponById: builder.query<Coupon, number>({
      query: (accountId) => `/accounts/${accountId}`,
      providesTags: ['Coupon'],
    }),

    updateCouponStatus: builder.mutation<
      void,
      {
        couponId: number;
        isActive?: boolean;
        isDeleted?: boolean;
      }
    >({
      query: ({ couponId, ...body }) => ({
        url: `/coupons/${couponId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useUpdateCouponStatusMutation,
  useCreateCouponMutation,
} = couponApi;
