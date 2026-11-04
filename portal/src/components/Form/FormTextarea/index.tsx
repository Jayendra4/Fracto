import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
} from 'react-hook-form';

import type { IFormTextareaConfig } from '@/interface';
import CustomTextarea from '@/components/Base/CustomTextarea';

interface IFormTextareaProps {
  field: IFormTextareaConfig;
  control: Control<FieldValues>;
  error?: FieldError;
  disabled?: boolean;
  rules?: Record<string, any>;
}

export default function FormTextarea({
  field,
  control,
  disabled,
  rules,
}: IFormTextareaProps) {
  const mergedRules = {
    ...(field.validation || {}),
    ...(rules || {}),
  };

  return (
    <div className="lg:mb-4 sm:mb-8 mb-2">
      <Controller
        name={field.name}
        control={control}
        rules={mergedRules}
        render={({ field: controllerField, fieldState }) => (
          <CustomTextarea
            rules={mergedRules}
            onBlur={controllerField.onBlur}
            label={field.label}
            value={controllerField.value || ''}
            onChange={controllerField.onChange}
            placeholder={field.placeholder}
            rows={field.rows}
            disabled={disabled}
            error={fieldState.error?.message}
            tooltip={field.tooltip}
            toolTipContent={field.toolTipContent}
            helpDesk={field.helpDesk}
          />
        )}
      />
    </div>
  );
}
