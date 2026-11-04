import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const getVendorsList = async (): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'GET',
    endpoint: '/vendors?isActive=true',
  });
};

export const useVendorsList = () => {
  return useQuery({
    queryKey: ['vendors-list'],
    queryFn: getVendorsList,
    // staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchInterval: 180000,
    refetchIntervalInBackground: true,

    staleTime: 0, // ✅ important
  });
};

export interface IVendorSuggestionPayload {
  vendorName: string;
  category: string;
  description: string;
  website: string;
  email: string;
  mobile: string;
}

export const createVendorSuggestion = async (
  payload: IVendorSuggestionPayload
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'POST',
    endpoint: '/vendors/suggestions',
    data: payload,
  });
};

export const useCreateVendorSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendorSuggestion,
    onSuccess: () => {
      // Invalidate the list so it updates if the suggestion is auto-approved or if we want to ensure freshness
      // Although usually suggestions might require approval, invalidating is good practice.
      queryClient.invalidateQueries({ queryKey: ['vendors-list'] });
    },
  });
};
