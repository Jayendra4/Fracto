import {
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormWatch,
} from 'react-hook-form';

import type { IFieldConfig, IFormInputConfig } from '@/interface';
import FormInput from '@/components/Form/FormInput';
import CustomButton from '@/components/Base/CustomButton';

interface ChangePasswordFormProps {
  fields: IFieldConfig[];
  onSubmit: SubmitHandler<FieldValues>;
  className?: string;
  button?: {
    label?: React.ReactNode;
    variant?: any;
  };
}

const isFormInputConfig = (f: IFieldConfig): f is IFormInputConfig =>
  f.type === 'password' || f.type === 'text' || f.type === 'email';

export default function ChangePasswordForm({
  fields,
  onSubmit,
  className = '',
  button = { label: 'Update Password', variant: 'formButton' },
}: ChangePasswordFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');
  const oldPassword = watch('oldPassword');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`w-full ${className} flex flex-col mt-4`}
    >
      {fields.map((field) =>
        isFormInputConfig(field) ? (
          <FormInput
            key={field.name}
            field={field}
            control={control}
            watch={watch as UseFormWatch<FieldValues>}
            required={field.required}
            rules={
              field.name === 'confirmPassword'
                ? {
                  validate: (value: string) => {
                    if (value !== newPassword)
                      return 'Passwords do not match';
                    if (value === oldPassword)
                      return 'New password must be different';
                    return true;
                  },
                }
                : undefined
            }
          />
        ) : null
      )}

      <CustomButton
        type="submit"
        variant={button.variant}
        className="w-full !mt-6 shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
        disabled={!isValid}
      >
        {button.label}
      </CustomButton>
    </form>
  );
}
