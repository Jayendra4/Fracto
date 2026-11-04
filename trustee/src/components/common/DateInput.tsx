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
}

const DateInput: React.FC<DateInputProps> = ({ label, name, register, error, min, max }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Input
        id={name}
        type="date"
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
