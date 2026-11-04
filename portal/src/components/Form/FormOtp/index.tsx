import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
} from 'react-hook-form';
import CustomOTP from '@/components/Base/CustomOtp';
import type { IAuthSendCodeReq } from '@/interface';

export default function FormOTP({
  field,
  control,
  emailMask,
  mobileMask,
  autoFocus = true,
  emailResendPayload,
  mobileResendPayload,
  otpSentKey,
  onError,
  className,
  autoSubmit,
  setFocusRef,
}: {
  field: any;
  control: Control<FieldValues>;
  error?: FieldError;
  emailMask?: string;
  mobileMask?: string;
  setFocusRef?: React.MutableRefObject<() => void>;
  inputType?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  autoSubmit?: boolean;

  emailResendPayload?: IAuthSendCodeReq;
  mobileResendPayload?: IAuthSendCodeReq;
  otpSentKey?: number;

  onError?: (message: string) => void;
  className?: string;
}) {
  return (
    <div className="mb-10 lg:mb-10">
      <Controller
        name={field.name}
        control={control}
        rules={field.validation}
        defaultValue={Array(6).fill('')}
        render={({ field: controllerField, fieldState }) => {
          const safeValue = Array.isArray(controllerField.value)
            ? controllerField.value
            : Array(6).fill('');

          return (
            <CustomOTP
              label={field.label}
              value={safeValue}
              onChange={controllerField.onChange}
              error={fieldState.error?.message}
              length={6}
              emailMask={emailMask}
              mobileMask={mobileMask}
              inputType={field.inputType}
              autoFocus={autoFocus}
              emailResendPayload={emailResendPayload}
              mobileResendPayload={mobileResendPayload}
              otpSentKey={otpSentKey}
              onError={onError}
              className={className}
              onComplete={(otp) => {
                controllerField.onChange(otp.split(''));
                controllerField.onBlur();
              }}
              setFocusRef={setFocusRef}
              autoSubmit={autoSubmit}
            />
          );
        }}
      />
    </div>
  );
}
