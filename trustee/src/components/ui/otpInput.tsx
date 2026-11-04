import * as React from 'react';
import OTPInput from 'react-otp-input';
import { cn } from '@/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
  disabled?: boolean;
  className?: string;
}

const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  ({ value, onChange, numInputs = 6, disabled = false, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex  justify-between mt-4', className)}>
        <OTPInput
          value={value}
          onChange={onChange}
          numInputs={numInputs}
          inputType="tel"
          containerStyle="flex w-full justify- gap-2"
          renderSeparator={<span>-</span>}
          renderInput={(inputProps, index) => (
            <input
              {...inputProps}
              key={index}
              inputMode="numeric"
              style={{ width: '42px' }}
              className={cn(
                'h-10 w-24 rounded-xl border text-center text-[20px] font-bold transition-all',
                'text-gray-700 dark:text-white bg-background border-muted-foreground',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            />
          )}
        />
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';

export { OtpInput };
