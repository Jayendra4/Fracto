import { useState, useCallback } from 'react';
import { useVerifyPayment } from '@/api/paymentRequest.api';
import { useQueryClient } from '@tanstack/react-query';

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  config?: Record<string, unknown>;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayPaymentResult {
  success: boolean;
  data?: unknown;
}

export const useRazorpay = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const queryClient = useQueryClient();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpayModal = useCallback(
    async (params: {
      method: 'bank' | 'upi';
      orderData: {
        orderId: string;
        amount: number;
        currency: string;
        requestId: number;
      };
      userData?: {
        name?: string;
        email?: string;
        contact?: string;
      };
    }) => {
      setIsProcessing(true);
      try {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Razorpay SDK failed to load. Are you online?');
        }

        const { orderId, amount, currency, requestId } = params.orderData;

        return new Promise<RazorpayPaymentResult>((resolve, reject) => {
          const options: RazorpayOptions = {
            key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_placeholder',
            amount: amount,
            currency: currency,
            name: 'Fracto',
            description: 'Wallet Deposit',
            image: '/images/hof-logo2.png',
            order_id: orderId,
            handler: async (response: RazorpayHandlerResponse) => {
              try {
                const verifyRes = await verifyPayment({
                  purchase_payment_id: requestId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                });

                if (verifyRes.success) {
                  // Invalidate wallet query after successful payment verification
                  await queryClient.invalidateQueries({
                    queryKey: ['my-wallet'],
                  });
                  resolve({ success: true, data: verifyRes.data });
                } else {
                  reject(
                    new Error(
                      verifyRes.message || 'Payment verification failed'
                    )
                  );
                }
              } catch (err) {
                reject(err);
              }
            },
            prefill: params.userData,
            theme: {
              color: '#2A5A8D',
            },
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
                reject(new Error('Payment cancelled by user'));
              },
            },
          };

          // Filter payment methods based on selected type
          if (params.method === 'bank') {
            options.config = {
              display: {
                blocks: {
                  banks: {
                    name: 'Net Banking',
                    instruments: [{ method: 'netbanking' }],
                  },
                },
                sequence: ['block.banks'],
                preferences: { show_default_blocks: false },
              },
            };
          } else if (params.method === 'upi') {
            options.config = {
              display: {
                blocks: {
                  upi: {
                    name: 'UPI Pay',
                    instruments: [{ method: 'upi' }],
                  },
                },
                sequence: ['block.upi'],
                preferences: { show_default_blocks: false },
              },
            };
          }

          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [verifyPayment, queryClient]
  );

  return {
    openRazorpayModal,
    isProcessing,
  };
};
