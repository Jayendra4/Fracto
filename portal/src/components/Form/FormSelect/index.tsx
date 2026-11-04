import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form';
import type { IFormSelectConfig } from '@/interface';
import CustomSelect from '@/components/Base/CustomSelect';

interface IFormSelectProps {
  field: IFormSelectConfig;
  control: Control<FieldValues>;
  error?: FieldError;
  disabled?: boolean;
  rules?: RegisterOptions;
}

export default function FormSelect({
  field,
  control,
  rules,
}: IFormSelectProps) {
  return (
    <div className="lg:mb-4 sm:mb-8 mb-2">
      <Controller
        name={field.name}
        control={control}
        rules={rules || field.validation}
        render={({ field: controllerField, fieldState }) => (
          <CustomSelect
            {...controllerField}
            label={field.label}
            options={field.options}
            placeholder={field.placeholder}
            isMulti={field.multiple}
            required={field.required}
            error={fieldState.error?.message}
            isSearchable={field.searchable}
            tooltip={field.tooltip}
            toolTipContent={field.toolTipContent}
            helpDesk={field.helpDesk}
          />
        )}
      />
    </div>
  );
}
