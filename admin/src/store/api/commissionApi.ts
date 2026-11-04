import { apiSlice } from './apiSlice';

export const commissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommissions: builder.query<
      any,
      {
        skip: number;
        take: number;
        type?: string;
        search?: string;
        brokerId?: number;
      }
    >({
      query: (params) => ({
        url: '/broker/commissions',
        method: 'GET',
        params: {
          skip: params.skip,
          take: params.take,
          ...(params.brokerId ? { brokerId: params.brokerId } : {}),
          ...(params.type ? { type: params.type } : {}),
          ...(params.search ? { search: params.search } : {}),
        },
      }),
      providesTags: ['Commissions'],
    }),

    getCommissionById: builder.query<any, number>({
      query: (id) => `/broker/commissions/${id}`,
      providesTags: ['Commissions'],
    }),
  }),
});

export const { useGetCommissionsQuery, useGetCommissionByIdQuery } = commissionApi;
