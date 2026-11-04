import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';

export interface CreateDirectorPayload {
  firstName: string;
  lastName: string;
  roleInCompany: string;
  dateOfBirth: string | null;
  nationality: string;
  panNumber?: string;
  emiratesIdNumber?: string;
  passportNumber?: string;
  email: string;
  mobileNumber: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

export const createDirectorApi = async ({
  companyId,
  payload,
  token,
}: {
  companyId: number;
  payload: CreateDirectorPayload;
  token?: string;
}): Promise<IApiResponse<any>> => {
  return axiosRequest({
    method: 'POST',
    endpoint: `/companies/${companyId}/directors`,
    data: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};

export const uploadDirectorDocumentsApi = async ({
  companyId,
  directorId,
  documents,
  token,
}: {
  companyId: number;
  directorId: number;
  documents: any[];
  token?: string;
}): Promise<IApiResponse<any>> => {
  return axiosRequest({
    method: 'POST',
    endpoint: `/companies/${companyId}/directors/document/upload/${directorId}`,
    data: { documents },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};

export const updateDirectorDocumentsApi = async ({
  companyId,
  directorId,
  documents,
  token,
}: {
  companyId: number;
  directorId: number;
  documents: any[];
  token?: string;
}): Promise<IApiResponse<any>> => {
  return axiosRequest({
    method: 'PATCH',
    endpoint: `/companies/${companyId}/directors/update/document/upload/${directorId}`,
    data: { documents },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};

export function useCreateDirector() {
  return useMutation({
    mutationFn: createDirectorApi,
    retry: 2,
    onError: (error) => {
      throw new Error(getApiErrorMessage(error));
    },
  });
}

export function useUploadDirectorDocuments(kycStatus: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: kycStatus
      ? uploadDirectorDocumentsApi
      : updateDirectorDocumentsApi,
    retry: 2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
    },
    onError: (error) => {
      throw new Error(getApiErrorMessage(error));
    },
  });
}
