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
import FormMobile from '@/components/Form/FormMobile';
import FormOTP from '@/components/Form/FormOtp';
import FormImageInput from '@/components/Form/FormImageInput';
import FormVideoInput from '@/components/Form/FormVideoInput';

interface IFormProps {
  fields: IFieldConfig[];
  onSubmit: SubmitHandler<FieldValues>;
  width?: string;
  button?: {
    variant?: ICustomButtonProps['variant'];
    label?: React.ReactNode;
  };
  extraText?: string;
  initialValues?: Record<string, any>;
  isSignup?: boolean;
  emailMask?: string;
  mobileMask?: string;
  autoFocus?: boolean;
  className?: string;
  emailResendPayload?: IAuthSendCodeReq;
  mobileResendPayload?: IAuthSendCodeReq;
  otpSentKey?: number;
  isLogin?: boolean;
  isForgot?: boolean;
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

export default function ForgotForm({
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
  isForgot,
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
            mobileMask={mobileMask}
            autoFocus={autoFocus}
            emailResendPayload={emailResendPayload}
            mobileResendPayload={mobileResendPayload}
            otpSentKey={otpSentKey}
            className={`!max-w-[500px] text-left `}
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
              isForgot={isForgot}
            />
          );
        }

        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${width} ${className} w-full mx-auto bg-transparent rounded-xl gap-4 font-work`}
    >
      {fields.map(renderField)}

      <CustomButton
        type="submit"
        variant={button.variant}
        className="w-full rounded-[4px] !mt-2"
        disabled={!isValid}
      >
        {button.label}
      </CustomButton>
    </form>
  );
}
