import { axiosRequest } from '@/services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface UpiAccount {
  upiId: string;
  qrCode: string | null;
  id: number | null;
  isActive: boolean;
}

export const fetchMyUpiAccountApi = async () => {
  return axiosRequest<UpiAccount[]>({
    method: 'GET',
    endpoint: '/upi-account/me',
  });
};

export const addUpiAccountApi = async (upiId: string) => {
  return axiosRequest<UpiAccount>({
    method: 'POST',
    endpoint: '/upi-account',
    data: { upiId, qrCode: null },
  });
};

export function useMyUpiAccount() {
  return useQuery({
    queryKey: ['my-upi-account'],
    queryFn: fetchMyUpiAccountApi,
  });
}

export function useAddUpiAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (upiId: string) => {
      return addUpiAccountApi(upiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-upi-account'],
      });
    },
  });
}

export const updateUpiStatusApi = async (
  upiId: number | string,
  payload: {
    isActive?: boolean;
    isDeleted?: boolean;
    upiId?: string;
    qrCode?: string | null;
  }
) => {
  return axiosRequest<UpiAccount>({
    method: 'PATCH',
    endpoint: `/upi-account/${upiId}/status`,
    data: payload,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

export function useUpdateUpiStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      upiId,
      payload,
    }: {
      upiId: number | string;
      payload: {
        isActive?: boolean;
        isDeleted?: boolean;
        upiId?: string;
        qrCode?: string | null;
      };
    }) => updateUpiStatusApi(upiId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-upi-account'] });
    },
  });
}
