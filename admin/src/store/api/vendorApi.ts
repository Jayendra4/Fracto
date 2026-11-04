import { PaginatedResponse } from '@/types';
import { apiSlice } from './apiSlice';

/* ===================== TYPES ===================== */

export interface Vendor {
  id: number;
  name: string;
  category: 'Legal' | 'Compliance' | 'Valuation' | 'Audit' | 'Trustee';
  email: string;
  // phone?: string;
  mobile?: string; // new update
  website?: string;
  description?: string; // new update
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ===================== SUGGESTION TYPE ===================== */
export interface VendorSuggestion {
  id: number;
  vendorName: string;
  category: string;
  email: string;
  mobile?: string;
  website?: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

/* ===================== API ===================== */

export const vendorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<
      PaginatedResponse<Vendor>,
      {
        status?: string; // new update
        skip?: number;
        take?: number;
        search?: string;
        category?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, category, status }) => ({
        url: '/vendors', // new update
        params: {
          status, // new update
          skip,
          take,
          ...(search ? { search } : {}),
          ...(category ? { category } : {}),
        },
      }),
      providesTags: ['Vendors'],
    }),

    /* ===================== GET VENDOR BY ID ===================== */
    getVendorById: builder.query<Vendor, number>({
      query: (vendorId) => `/vendors/${vendorId}`,
      providesTags: ['Vendors'],
    }),

    /* ===================== CREATE VENDOR (ADMIN) ===================== */
    createVendor: builder.mutation<
      Vendor,
      {
        vendorName: string;
        category: 'Legal' | 'Compliance' | 'Valuation' | 'Audit' | 'Trustee';
        description?: string;
        email: string;
        phone?: string;
        website?: string;
        mobile?: string;
      }
    >({
      query: (body) => ({
        url: '/vendors',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vendors'],
    }),

    /* ===================== UPDATE VENDOR ===================== */
    // from new update
    updateVendor: builder.mutation<
      void,
      {
        vendorId: number;
        isActive?: boolean;
        mobile?: string;
        website?: string;
        description?: string;
        name?: string;
        email?: string;
        category?: 'Legal' | 'Compliance' | 'Valuation' | 'Audit' | 'Trustee'; // ✅ add
      }
    >({
      query: ({ vendorId, ...body }) => ({
        url: `/vendors/${vendorId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Vendors'],
    }),

    // from new 4 update
    /* ===================== DELETE VENDOR ===================== */
    deleteVendor: builder.mutation<void, number>({
      query: (vendorId) => ({
        url: `/vendors/${vendorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vendors'],
    }),
    // to new 4 update

    /* ===================== REVIEW VENDOR (APPROVE / REJECT) ===================== */
    // from new update
    reviewVendor: builder.mutation<void, { vendorId: number; status: 'Approved' | 'Rejected' }>({
      query: ({ vendorId, status }) => ({
        url: `/vendors/${vendorId}/review`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Vendors'],
    }),

    /* ===================== GET VENDOR SUGGESTIONS ===================== */
    getVendorSuggestions: builder.query<
      PaginatedResponse<VendorSuggestion>,
      {
        skip?: number;
        take?: number;
        search?: string;
        category?: string;
        status?: string;
      }
    >({
      query: ({ skip = 0, take = 10, search, category, status }) => ({
        url: '/vendors/suggestions',
        params: {
          skip,
          take,
          ...(search ? { search } : {}),
          ...(category ? { category } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ['Vendors'], // new 4 update
    }),

    /* ===================== CREATE VENDOR SUGGESTION (USER) ===================== */
    createVendorSuggestion: builder.mutation<
      void,
      {
        vendorName: string;
        category: string;
        email: string;
        mobile?: string;
        website?: string;
        description?: string;
      }
    >({
      query: (body) => ({
        url: '/vendors/suggestions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vendors'], // new 4 update
    }),
  }),
});

/* ===================== HOOKS ===================== */

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation, // new update
  useReviewVendorMutation, // new update
  useDeleteVendorMutation, // from new 4 update
  useGetVendorSuggestionsQuery,
  useCreateVendorSuggestionMutation,
} = vendorApi;
