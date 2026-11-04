import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';

type WalletResponse = {
  success: true;
  data: {
    availableBalance: number;
    pendingAmount: number;
    pendingTransactionCount: number;
  };
};

type WalletApiResponse = {
  id: string;
  type: string;
  amount: string;
  approvedAmount: string;
  pendingAmount: string;
  rejectedAmount: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  accountId: number;
  pendingTransactionCount: string;
};

export const fetchMyWallet = async (): Promise<WalletResponse> => {
  const res = await axiosRequest<WalletApiResponse>({
    method: 'GET',
    endpoint: '/users/me/wallets',
  });

  if (!res || res.success === false) {
    return {
      success: true,
      data: {
        availableBalance: 0,
        pendingAmount: 0,
        pendingTransactionCount: 0,
      },
    };
  }

  const wallet = res.data;

  return {
    success: true,
    data: {
      availableBalance: Number(wallet?.amount ?? 0),
      pendingAmount: Number(wallet?.pendingAmount ?? 0),
      pendingTransactionCount: Number(wallet?.pendingTransactionCount ?? 0),
    },
  };
};

export function useMyWallet(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['my-wallet'],
    queryFn: fetchMyWallet,

    enabled: options?.enabled ?? true,

    retry: (count, error: any) => {
      if (error?.response?.status === 401) return false;
      return count < 2;
    },

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
