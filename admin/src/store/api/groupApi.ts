import { apiSlice } from './apiSlice';

/* =========================
   TYPES
========================= */
export interface Category {
  id: number;
  name: string;
  categoryStatus: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  count: number;
  skip: number;
  take: number;
  data: Category[];
}

export interface CreateGroupPayload {
  title: string;
  description: string;
  categoryId: number;
  image: string; // filename only (not full URL)
}

/* =========================
   API
========================= */
export const groupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategory: builder.query<
      CategoryResponse,
      {
        search?: string;
        fromDate?: string;
        toDate?: string;
        skip?: number;
        take?: number;
        categoryStatus?: string;
      }
    >({
      query: ({ search, fromDate, toDate, skip, take, categoryStatus }) => ({
        url: '/category',
        params: { search, fromDate, toDate, skip, take, categoryStatus }, // ✅ added
      }),
      providesTags: ['Category'],
    }),

    createCategoryApi: builder.mutation<Category, { name: string }>({
      query: (body) => ({
        url: '/category',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (categoryId) => ({
        url: `/category/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'], // ✅ auto refetch
    }),
    updateCategoryStatus: builder.mutation<void, { id: number; status: 'Active' | 'Inactive' }>({
      query: ({ id, status }) => ({
        url: `/category/${id}/${status}`,
        method: 'POST', // (agar backend PUT use karta hai to change kar lena)
      }),
      invalidatesTags: ['Category'], // ✅ auto refresh
    }),
    updateGroup: builder.mutation<any, { id: number; body: CreateGroupPayload }>({
      query: ({ id, body }) => ({
        url: `/group/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Group'],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useCreateCategoryApiMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryStatusMutation,
  useUpdateGroupMutation,
} = groupApi;
