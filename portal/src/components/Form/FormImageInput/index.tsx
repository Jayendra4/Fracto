import { Controller, type Control, type FieldValues } from 'react-hook-form';
import CustomImageInput from '@/components/Base/CustomImageInput';

export default function FormImageInput({
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
        <CustomImageInput
          label={field.label}
          value={controllerField.value || []}
          onChange={controllerField.onChange}
          maxFiles={field.maxFiles}
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
