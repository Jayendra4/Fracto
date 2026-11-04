import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
} from 'react-hook-form';

import type { IFormRadioConfig } from '@/interface';
import CustomRadio from '@/components/Base/CustomRadio';

interface IFormRadioProps {
  field: IFormRadioConfig;
  control: Control<FieldValues>;
  error?: FieldError;
  disabled?: boolean;
  rules?: Record<string, any>;
  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
}

export default function FormRadio({
  field,
  control,
  disabled,
  rules,
  tooltip,
  toolTipContent,
  helpDesk,
}: IFormRadioProps) {
  const mergedRules = {
    ...(field.validation || {}),
    ...(rules || {}),
  };
  return (
    <div className="">
      <Controller
        name={field.name}
        control={control}
        rules={mergedRules}
        render={({ field: controllerField, fieldState }) => (
          <CustomRadio
            label={field.label}
            value={controllerField.value}
            onChange={controllerField.onChange}
            options={field.options || []}
            disabled={disabled}
            error={fieldState.error?.message}
            rules={mergedRules}
            required={field.required}
            tooltip={tooltip}
            toolTipContent={toolTipContent}
            helpDesk={helpDesk}
          />
        )}
      />
    </div>
  );
}
