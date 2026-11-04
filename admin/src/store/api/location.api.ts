import { apiSlice } from './apiSlice';

/* =========================
   TYPES
========================= */

export interface ICountry {
  id: number;
  name: string;
  dialCode: string;
  isoCode: string;
  flag: string;
}

export interface IState {
  name: string;
  code: string;
}

export interface ICity {
  name: string;
}

/* =========================
   API
========================= */

export const locationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* -------- COUNTRIES -------- */
    getCountries: builder.query<ICountry[], void>({
      query: () => ({
        url: '/location/countries',
      }),
      providesTags: ['Location'],
    }),

    /* -------- STATES -------- */
    getStates: builder.query<IState[], string>({
      query: (countryCode) => ({
        url: '/location/states',
        params: { countryCode },
      }),
      keepUnusedDataFor: 300, // cache 5 min
    }),

    /* -------- CITIES -------- */
    getCities: builder.query<ICity[], { countryCode: string; stateCode: string }>({
      query: ({ countryCode, stateCode }) => ({
        url: '/location/cities',
        params: { countryCode, stateCode },
      }),
      providesTags: ['Location'],
    }),
  }),
});

/* =========================
   EXPORT HOOKS
========================= */

export const { useGetCountriesQuery, useGetStatesQuery, useGetCitiesQuery } = locationApi;
