import { apiSlice } from './apiSlice';

export const masterRwaFormApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAsset: builder.mutation<any, any>({
      query: (payload) => ({
        url: '/assets',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['rwa'],
    }),
  }),
});

export const { useCreateAssetMutation } = masterRwaFormApi;
