import { axiosRequest } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface SignConsentPayload {
  assetId: number;
  buyerConsent?: boolean;
  rejectionReason?: string;
}

export const signConsentApi = async (payload: SignConsentPayload) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/asset-purchase/sign-consent',
    data: payload,
  });
};

export function useSignConsent() {
  return useMutation({
    mutationFn: signConsentApi,
  });
}

export const buyAssetFractions = async (payload: {
  assetId: number;
  fractions: number;
}) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/asset-purchase',
    data: payload,
  });
};

export function useBuyAssetFractions() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: buyAssetFractions,

    onMutate: async (payload) => {
      const cached = queryClient.getQueryData<{
        data?: { price?: { currentPricePerFraction?: number | string } };
      }>(['property-details', payload.assetId]);
      const estimatedAmount =
        payload.fractions *
        Number(cached?.data?.price?.currentPricePerFraction ?? 0);

      window.dispatchEvent(
        new CustomEvent('wallet-effect', {
          detail: { type: 'DEBIT', amount: estimatedAmount },
        })
      );
      navigator.vibrate?.(60);
    },

    onSuccess: () => {
      window.dispatchEvent(
        new CustomEvent('wallet-effect', {
          detail: { type: 'CREDIT' },
        })
      );

      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
}
