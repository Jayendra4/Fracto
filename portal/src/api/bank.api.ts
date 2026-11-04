import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface IBankPayload {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface IBankResponse {
  message: string;
  success: boolean;
  data?: any;
}

export const submitBankApi = async (
  payload: IBankPayload
): Promise<IApiResponse<IBankResponse>> => {
  return axiosRequest<IBankResponse>({
    method: 'POST',
    endpoint: '/bank-account',
    data: payload,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

export function useBankSubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitBankApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bank-accounts'] });
    },
  });
}

export const getBanksApi = async (params: { skip: number; take: number }) => {
  return axiosRequest<any>({
    method: 'GET',
    endpoint: `/bank-account?skip=${params.skip}&take=${params.take}`,
  });
};

export function useBanks(params: { skip: number; take: number }) {
  return useQuery({
    queryKey: ['banks', params],
    queryFn: () => getBanksApi(params),
  });
}

export const updateBankStatusApi = async (
  bankId: number,
  payload: Partial<IBankPayload> & { isActive?: boolean; isDeleted?: boolean }
): Promise<IApiResponse<IBankResponse>> => {
  return axiosRequest<IBankResponse>({
    method: 'PATCH',
    endpoint: `/bank-account/${bankId}/status`,
    data: payload,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

export function useUpdateBankStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bankId, payload }: { bankId: number; payload: any }) =>
      updateBankStatusApi(bankId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['banks'] });
    },
  });
}
