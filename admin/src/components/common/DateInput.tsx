import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateInputProps {
  label: string;
  name: string;
  register: any;
  error?: string;
  min?: string;
  max?: string;
  takeTime?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  name,
  register,
  error,
  min,
  max,
  takeTime = false,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Input
        id={name}
        type={takeTime ? 'datetime-local' : 'date'}
        {...register(name)}
        min={min}
        max={max}
        className={`appearance-auto ${error ? 'border-destructive' : ''}`}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default DateInput;
