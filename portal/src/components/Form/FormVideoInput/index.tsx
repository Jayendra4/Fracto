import { Controller, type Control, type FieldValues } from 'react-hook-form';
import CustomVideoInput from '@/components/Base/CustomVideoInput';

export default function FormVideoInput({
  field,
  control,
  rules,
}: {
  field: any;
  control: Control<FieldValues>;
  rules?: any;
}) {
  return (
    <Controller
      name={field.name}
      control={control}
      rules={rules ?? field.validation}
      shouldUnregister={false}
      render={({ field: controllerField, fieldState }) => (
        <CustomVideoInput
          label={field.label}
          value={controllerField.value || []}
          maxFiles={field.maxFiles}
          onChange={controllerField.onChange}
          rules={rules ?? field.validation}
          error={fieldState.error?.message}
          tooltip={field?.tooltip}
          toolTipContent={field?.toolTipContent}
          helpDesk={field.helpDesk}
        />
      )}
    />
  );
}
