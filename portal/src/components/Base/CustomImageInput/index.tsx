import CustomUploadBase from '../CustomUploadBase';
import type { AssetFileItem } from '@/interface';

export default function CustomImageInput({
  label,
  value,
  onChange,
  error,
  maxFiles,
  rules,
  tooltip,
  toolTipContent,
  helpDesk,
}: {
  label: string;
  value: AssetFileItem[];
  onChange: (v: AssetFileItem[]) => void;
  error?: string;
  maxFiles?: number;
  rules?: any;
  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
}) {
  return (
    <CustomUploadBase
      label={label}
      helperText="Atleast 5 images are required"
      value={value}
      onChange={onChange}
      accept=".png,.jpeg,.jpg"
      type="image"
      maxFiles={maxFiles}
      rules={rules}
      error={error}
      tooltip={tooltip}
      toolTipContent={toolTipContent}
      helpDesk={helpDesk}
    />
  );
}
