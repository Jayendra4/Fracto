import { useState } from 'react';
import { useSendOtp } from '@/api';
import type { IAuthSendCodeReq } from '@/interface';

export function useOtpFlow() {
  const [error, setError] = useState('');
  const { mutateAsync: sendOtp, isPending } = useSendOtp();

  const send = async (payload: IAuthSendCodeReq) => {
    try {
      setError('');
      const res = await sendOtp(payload);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to send OTP');
      }
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP');
      return false;
    }
  };

  return {
    sendOtp: send,
    sending: isPending,
    error,
    clearError: () => setError(''),
  };
}
