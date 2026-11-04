import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';
import type { IApiResponse } from '@/interface';

export interface WalletTransaction {
  id: string;
  amount: string;
  availableBalance: string;
  type: 'Credit' | 'Debit';
  context: string;
  status: string;
  timestamp: string;
  narration?: string;
}

export interface WalletTransactionResponse {
  count: number;
  skip: number;
  take: number;
  data: WalletTransaction[];
}

export const fetchMyTransactionsApi = async (): Promise<
  IApiResponse<WalletTransactionResponse>
> => {
  return axiosRequest<WalletTransactionResponse>({
    method: 'GET',
    endpoint: '/users/me/transactions',
  });
};

export function useMyTransactions() {
  return useQuery({
    queryKey: ['my-transactions'],
    queryFn: fetchMyTransactionsApi,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    // Polls every minute while a component using this hook (e.g. the
    // Wallet page's TransactionHistory) stays mounted.
    refetchInterval: 60_000,
  });
}
