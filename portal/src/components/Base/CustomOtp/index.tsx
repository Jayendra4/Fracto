import { useEffect, useRef, useState } from 'react';
import type { IAuthSendCodeReq } from '@/interface';
import { useOtpFlow } from '@/hooks/useOtpFlow';

const vibrate = (pattern: number | number[]) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};

const hapticError = () => {
  vibrate([100, 60, 100]);
};

export default function CustomOTP({
  label,
  value = [],
  onChange,
  error,
  length = 6,
  emailMask = '',
  mobileMask = '',
  inputType = 'email',
  autoFocus = true,
  emailResendPayload,
  mobileResendPayload,
  otpSentKey,
  onError,
  autoSubmit,
  setFocusRef,
  className = '',
}: {
  label: string;
  value: string[];
  onChange: (val: string[]) => void;
  error?: string;
  setFocusRef?: React.MutableRefObject<() => void>;
  length?: number;
  emailMask?: string;
  mobileMask?: string;
  onComplete?: (otp: string) => void;
  inputType?: 'email' | 'mobile';
  autoFocus?: boolean;
  priority?: boolean;
  emailResendPayload?: IAuthSendCodeReq;
  mobileResendPayload?: IAuthSendCodeReq;
  otpSentKey?: number;
  onError?: (message: string) => void;
  autoSubmit?: boolean;
  className?: string;
}) {
  const safeValue = Array.isArray(value) ? value : Array(length).fill('');
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (setFocusRef) {
      setFocusRef.current = () => {
        const el = inputRefs.current[0];
        if (el) {
          el.focus();
          console.log(
            '[CustomOTP] Programmatic focus triggered via setFocusRef'
          );
        }
      };
    }
  }, [setFocusRef]);

  const [timer, setTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const submittedRef = useRef(false);

  const { sendOtp, sending } = useOtpFlow();

  useEffect(() => {
    if (!otpSentKey) return;

    // otpSentKey is likely Date.now() when sent
    const elapsedSeconds = Math.floor((Date.now() - otpSentKey) / 1000);
    const remaining = Math.max(0, 120 - elapsedSeconds);

    setTimer(remaining);
    setResending(false);
    submittedRef.current = false;
  }, [otpSentKey]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    const completed = safeValue.every((d) => d.length === 1);
    if (completed && !error) {
      vibrate(60);
    }
  }, [safeValue, error]);

  useEffect(() => {
    if (!error) return;
    hapticError();
    submittedRef.current = false;
    setShakeKey((k) => k + 1);
  }, [error]);

  useEffect(() => {
    if (!Array.isArray(value)) return;

    const done = value.length === length && value.every(Boolean);
    if (!done || error) return;

    if (autoSubmit) {
      requestAnimationFrame(() => {
        inputRefs.current[0]?.form?.requestSubmit();
      });
    }
  }, [value, error, length, autoSubmit]);

  useEffect(() => {
    if (!autoFocus) return;

    let attempts = 0;
    const maxAttempts = 10;

    const attemptFocus = () => {
      const el = inputRefs.current[0];
      if (el && document.activeElement !== el) {
        el.focus();
      }

      attempts++;
      if (
        attempts < maxAttempts &&
        document.activeElement !== inputRefs.current[0]
      ) {
        setTimeout(attemptFocus, 100);
      }
    };

    const initialDelay = setTimeout(attemptFocus, 150);

    return () => {
      clearTimeout(initialDelay);
    };
  }, [autoFocus, otpSentKey]);

  useEffect(() => {
    if (safeValue.every((d) => d.length === 1)) {
      inputRefs.current[length - 1]?.blur();
    }
  }, [safeValue]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);

    if (!pasted) return;

    const chars = pasted.split('');
    const filled = Array(length).fill('');

    chars.forEach((char, i) => {
      filled[i] = char;
    });

    onChange(filled);

    const nextIndex = Math.min(chars.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleChange = (index: number, val: string) => {
    const updated = [...safeValue];
    updated[index] = val.slice(-1);
    onChange(updated);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
      return;
    }

    if (e.key === 'Backspace' && !safeValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;

    try {
      setResending(true);

      const payload =
        inputType === 'email' ? emailResendPayload : mobileResendPayload;

      if (!payload) {
        throw new Error('Resend payload missing');
      }

      const success = await sendOtp(payload);
      if (!success) throw new Error('Failed to resend OTP');

      setTimer(120);
    } catch (err: any) {
      onError?.(err?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const allFilled = safeValue.every((d) => d && d.length === 1);
  const borderColor = error
    ? 'border-red-500/50'
    : allFilled
      ? 'border-[#33BD56]/50'
      : 'border-[var(--fg)]/10';

  return (
    <div className="h-full flex flex-col gap-2 justify-between">
      <div className="h-full flex flex-col justify-between">
        <h3
          className={`font-24 leading-[48px] font-medium text-[var(--fg)] ${className}`}
        >
          {label}
        </h3>

        <p className="text-[#5C6C7C] font-14 text-left">
          Enter the OTP sent to{' '}
          <span className="text-gray-400">
            {inputType === 'email' ? emailMask : mobileMask}
          </span>
        </p>
      </div>

      <div className=" h-full flex flex-col gap-2 justify-between">
        <div
          key={shakeKey}
          className={`flex items-center gap-1 md:gap-3 justify-between ${className} ${
            error ? 'otp-shake' : ''
          }`}
        >
          {Array.from({ length }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                if (el) {
                  inputRefs.current[i] = el;
                }
              }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              value={safeValue[i] || ''}
              onPaste={handlePaste}
              onChange={(e) => {
                const digit = e.target.value.replace(/\D/g, '');
                handleChange(i, digit);
              }}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-[40px] w-[40px] sm:w-[52px] sm:h-[52px] bg-[var(--fg)]/5 ${borderColor} border rounded-xl text-center text-[var(--fg)] text-xl focus:border-[var(--fg)]/30 focus:bg-[var(--fg)]/8 focus:shadow-[0_0_15px_rgba(var(--fg-rgb),0.02)] outline-none transition-all duration-300`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-sm mt-2">
          <p className="text-gray-400 text-left">Didn’t receive the OTP? </p>

          <div className="flex items-center gap-3">
            <span className="text-gray-400">
              {timer === 0 ? '0:00' : formatTime(timer)}
            </span>

            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || resending || sending}
              className={`${
                timer > 0 || resending || sending
                  ? 'text-inactive-gray cursor-not-allowed'
                  : 'text-[#2F5BCC] hover:underline cursor-pointer'
              }`}
            >
              Resend
            </button>
          </div>
        </div>

        {error && <p className="text-red text-sm">{error}</p>}
      </div>
    </div>
  );
}
