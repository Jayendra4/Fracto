import CustomUploadBase from '../CustomUploadBase';
import type { AssetFileItem } from '@/interface';

export default function CustomVideoInput({
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
      // helperText="Atleast 1 video is required"
      value={value}
      onChange={onChange}
      maxFiles={maxFiles}
      accept=".mp4,.mov,.webm"
      type="video"
      rules={rules}
      error={error}
      tooltip={tooltip}
      toolTipContent={toolTipContent}
      helpDesk={helpDesk}
    />
  );
}
