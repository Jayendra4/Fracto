import {
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormWatch,
} from 'react-hook-form';

import type {
  IFieldConfig,
  IFormDatepickerConfig,
  IFormInputConfig,
  IFormImageConfig,
  IFormVideoConfig,
  IAuthSendCodeReq,
} from '@/interface';

import FormSelect from '@/components/Form/FormSelect';
import FormInput from '@/components/Form/FormInput';
import FormTextarea from '@/components/Form/FormTextarea';
import FormCheckbox from '@/components/Form/FormCheckbox';
import FormRadio from '@/components/Form/FormRadio';
import CustomButton, {
  type ICustomButtonProps,
} from '@/components/Base/CustomButton';
import FormDatepicker from '@/components/Form/FormDatePicker';
import FormMobile from './FormMobile';
import FormOTP from './FormOtp';
import FormImageInput from './FormImageInput';
import FormVideoInput from './FormVideoInput';
import { useEffect, useRef } from 'react';

interface IFormProps {
  fields: IFieldConfig[];
  onSubmit: SubmitHandler<FieldValues>;
  width?: string;
  button?: {
    variant?: ICustomButtonProps['variant'];
    label?: React.ReactNode;
    disabled?: boolean;
  };
  extraText?: string;
  initialValues?: Record<string, unknown>;
  isSignup?: boolean;
  emailMask?: string;
  mobileMask?: string;
  autoFocus?: boolean;
  className?: string;
  emailResendPayload?: IAuthSendCodeReq;
  mobileResendPayload?: IAuthSendCodeReq;
  otpSentKey?: number;
  isLogin?: boolean;
  disabled?: boolean;
  isVendorSuggestion?: boolean;
}

const isFormInputConfig = (f: IFieldConfig): f is IFormInputConfig => {
  return (
    f.type === 'text' ||
    f.type === 'email' ||
    f.type === 'password' ||
    f.type === 'number' ||
    f.type === 'contact' ||
    f.type === 'file' ||
    f.type === 'date'
  );
};

const isFormImageConfig = (f: IFieldConfig): f is IFormImageConfig => {
  return f.type === 'image';
};

const isFormVideoConfig = (f: IFieldConfig): f is IFormVideoConfig => {
  return f.type === 'video';
};

export default function Form({
  fields,
  onSubmit,
  width = '',
  button = { variant: 'primary', label: 'Submit' },
  initialValues = {},
  isSignup = false,
  emailMask,
  mobileMask,
  autoFocus,
  className = '',
  emailResendPayload,
  mobileResendPayload,
  otpSentKey,
  isLogin,
  isVendorSuggestion,
}: IFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm({
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  const emailOtpRef = useRef<() => void>(() => {});
  const mobileOtpRef = useRef<() => void>(() => {});

  const submitRef = useRef<() => void>(() => {});
  const hasSubmittedRef = useRef(false);

  const emailOTP = watch('emailOTP');
  const mobileOTP = watch('mobileOTP');

  const emailOtpDone = Array.isArray(emailOTP) && emailOTP.every(Boolean);

  useEffect(() => {
    if (!isSignup) return;
    if (hasSubmittedRef.current) return; // Prevent infinite loop

    const emailDone = Array.isArray(emailOTP) && emailOTP.every(Boolean);
    const mobileDone = Array.isArray(mobileOTP) && mobileOTP.every(Boolean);

    if (emailDone && mobileDone) {
      hasSubmittedRef.current = true; // Mark as submitted
      handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSubmit/onSubmit intentionally excluded: onSubmit is a fresh inline prop every render, adding it would refire this on every render instead of only on OTP completion (hasSubmittedRef already guards re-entry)
  }, [emailOTP, mobileOTP, isSignup]);

  useEffect(() => {
    if (!isSignup) return;

    if (emailOtpDone) {
      mobileOtpRef.current?.();
    }
  }, [emailOtpDone, isSignup]);

  const otp = watch('otp');

  useEffect(() => {
    if (!isLogin) return;
    if (!Array.isArray(otp)) return;

    const otpDone = otp.length === 6 && otp.every(Boolean);
    if (otpDone) {
      handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSubmit/onSubmit intentionally excluded: onSubmit is a fresh inline prop every render, adding it would refire this on every render instead of only on OTP completion
  }, [otp, isLogin]);

  const renderField = (field: IFieldConfig) => {
    switch (field.type) {
      case 'select':
        return <FormSelect key={field.name} field={field} control={control} />;
      case 'textarea':
        return (
          <FormTextarea key={field.name} field={field} control={control} />
        );
      case 'checkbox':
        return (
          <FormCheckbox key={field.name} field={field} control={control} />
        );
      case 'radio':
        return <FormRadio key={field.name} field={field} control={control} />;
      case 'datepicker':
        return (
          <FormDatepicker
            key={field.name}
            field={field as IFormDatepickerConfig}
            control={control}
          />
        );
      case 'mobile':
        return <FormMobile key={field.name} field={field} control={control} />;
      case 'otp':
        return (
          <FormOTP
            key={field.name}
            field={field}
            control={control}
            emailMask={emailMask}
            setFocusRef={
              field.name === 'emailOTP'
                ? emailOtpRef
                : field.name === 'mobileOTP'
                  ? mobileOtpRef
                  : undefined
            }
            mobileMask={mobileMask}
            autoFocus={
              isLogin ? true : (autoFocus ?? true) && field.name === 'emailOTP'
            }
            emailResendPayload={emailResendPayload}
            mobileResendPayload={mobileResendPayload}
            otpSentKey={otpSentKey}
            className={`!max-w-[500px] text-left `}
            autoSubmit={isLogin}
          />
        );
      case 'image':
        if (isFormImageConfig(field)) {
          return (
            <FormImageInput key={field.name} field={field} control={control} />
          );
        }
        return null;
      case 'video':
        if (isFormVideoConfig(field)) {
          return (
            <FormVideoInput key={field.name} field={field} control={control} />
          );
        }
        return null;
      default:
        if (isFormInputConfig(field)) {
          return (
            <FormInput
              key={field.name}
              field={field}
              control={control}
              required={field.required}
              extraText={field.extraText}
              watch={watch as UseFormWatch<FieldValues>}
              showStrength={isSignup}
              isLogin={isLogin}
              isVendorSuggestion={isVendorSuggestion}
              disabled={field.disabledByDefault}
            />
          );
        }

        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      ref={() => {
        submitRef.current = handleSubmit(onSubmit);
      }}
      className={`${width} ${className} w-full mx-auto rounded-xl gap- font-work`}
    >
      {fields.map(renderField)}

      <div className="flex items-end ">
        <CustomButton
          type="submit"
          variant={button.variant}
          className="w-full"
          disabled={button.disabled || !isValid}
        >
          {button.label}
        </CustomButton>
      </div>
    </form>
  );
}
