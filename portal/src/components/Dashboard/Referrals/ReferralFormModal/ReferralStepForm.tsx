import type { IFieldConfig } from '@/interface';
import RefferalCustomForm from '../RefferalCustomForm';

interface Props {
  fields: IFieldConfig[];
  onSubmit: (data: any) => void;
  submitLabel: string;
}

export default function ReferralStepForm({
  fields,
  onSubmit,
  submitLabel,
}: Props) {
  return (
    <RefferalCustomForm
      fields={fields}
      onSubmit={onSubmit}
      button={{ label: submitLabel }}
      className="!shadow-none"
    />
  );
}
