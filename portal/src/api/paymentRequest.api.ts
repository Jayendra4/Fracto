/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed payloads, matches the pattern in rwa.api.ts */
import { axiosRequest } from '@/services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface CreateDepositRequestDto {
  amount: number;
  methodType: 'Bank' | 'Upi';
  bankAccountId?: number;
  upiAccountId?: number;
}

export interface VerifyPaymentDto {
  purchase_payment_id: number;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface AddMoneyPayload {
  requestType: 'Deposit' | 'Withdraw';
  methodType: 'Bank' | 'Upi' | 'Online';
  amount: number;
  bankAccountId?: number;
  upiAccountId?: number;
  utrNumber?: string;
  screenshot?: string;
}

export const createPaymentRequest = async (payload: AddMoneyPayload) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/payment-request',
    data: payload,
  });
};

export function useAddMoneyWallet() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPaymentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
}

export interface PayoutRequestPayload {
  amount: number;
  methodType: 'Bank' | 'Upi';
  fundAccountId?: string | number | null;
  bankAccountId?: number;
  upiAccountId?: number;
}

export const payoutRequest = async (payload: PayoutRequestPayload) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/payment-request/payout-request',
    data: { ...payload, WalletType: 'Main' },
  });
};

export function usePayoutRequest() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: payoutRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
}

export interface InitiateDepositResponseData {
  orderId: string;
  amount: number;
  currency: string;
  requestId: number;
}

export const initiateDepositRequest = async (
  payload: CreateDepositRequestDto
) => {
  return axiosRequest<InitiateDepositResponseData>({
    method: 'POST',
    endpoint: '/payment-request/deposit/initiate',
    data: payload,
  });
};

export function useInitiateDeposit() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: initiateDepositRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
}

export const verifyPayment = async (payload: VerifyPaymentDto) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/payment-request/verify-payment',
    data: payload,
  });
};

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
}

export type PaymentRequest = {
  id: number;
  requestType: 'Deposit' | 'Withdraw';
  methodType: 'Bank' | 'Upi';
  amount: string;
  status: string;
  createdAt: string;
  bankAccount?: any;
};

type PaymentRequestApiResponse = {
  data: PaymentRequest[];
  total: number;
  skip: number;
  take: number;
};

const fetchPaymentRequests = async (
  requestType?: 'Deposit' | 'Withdraw'
): Promise<PaymentRequest[]> => {
  const res = await axiosRequest<PaymentRequestApiResponse>({
    method: 'GET',
    endpoint: '/payment-request',
    params: requestType ? { requestType } : undefined,
  });
  if (!res.success) return [];
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

export function usePaymentRequests(requestType?: 'Deposit' | 'Withdraw') {
  return useQuery({
    queryKey: ['payment-requests', requestType ?? 'All'],
    queryFn: () => fetchPaymentRequests(requestType),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
