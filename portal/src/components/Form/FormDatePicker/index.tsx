import {
  Controller,
  type FieldError,
  type Control,
  type FieldValues,
} from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { IFormDatepickerConfig } from '@/interface';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface IFormDatepickerProps {
  field: IFormDatepickerConfig;
  control: Control<FieldValues>;
  error?: FieldError;
  disabled?: boolean;
  rules?: Record<string, any>;
}

export default function FormDatepicker({
  field,
  control,
  error,
  disabled,
  rules,
}: IFormDatepickerProps) {
  const isRequired = field.validation?.required;

  const [inputValue, setInputValue] = useState('');
  const [manualError, setManualError] = useState('');

  const normalizeInput = (val?: string) => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (digits.length === 8) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    }
    return val;
  };

  const parseInputToDate = (val: string) => {
    if (!val) return null;
    const formats = ['DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
    for (const f of formats) {
      const parsed = dayjs(val, f, true);
      if (parsed.isValid()) return parsed.toDate();
    }
    return null;
  };

  const toISO = (date: Date) => dayjs(date).format('YYYY-MM-DD');
  const fromISO = (iso: string) =>
    dayjs(iso, 'YYYY-MM-DD').format('DD-MM-YYYY');

  return (
    <div className="w-full">
      <label className="block h-[30px] font-18 font-medium mb-2 text-[var(--fg)]">
        {field.label} {isRequired && <span className="text-red">*</span>}
      </label>

      <Controller
        control={control}
        name={field.name}
        rules={rules}
        render={({ field: { onChange, value }, fieldState }) => {
          useEffect(() => {
            if (!value) {
              setInputValue('');
              setManualError('');
              return;
            }
            setInputValue(fromISO(value));
          }, [value]);

          return (
            <>
              <DatePicker
                selected={
                  value
                    ? dayjs(value, 'YYYY-MM-DD').toDate()
                    : parseInputToDate(inputValue)
                }
                disabled={disabled}
                placeholderText={field.placeholder}
                minDate={field.minDate}
                maxDate={field.maxDate}
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={80}
                scrollableYearDropdown
                wrapperClassName="w-full"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                onChange={(date) => {
                  setManualError('');

                  if (!date) {
                    onChange('');
                    setInputValue('');
                    return;
                  }

                  const iso = toISO(date);
                  onChange(iso);
                  setInputValue(fromISO(iso));
                }}
                onChangeRaw={(e) => {
                  const target = e?.currentTarget as HTMLInputElement | null;
                  const val = target?.value ?? '';

                  setInputValue(val);
                  setManualError('');

                  if (!val) {
                    onChange('');
                    return;
                  }

                  const normalized = normalizeInput(val);
                  const parsed = parseInputToDate(normalized);

                  if (!parsed) {
                    setManualError('Invalid date format');
                    onChange('');
                    return;
                  }

                  if (dayjs(parsed).isAfter(dayjs().endOf('day'))) {
                    setManualError('Future dates are not allowed');
                    onChange('');
                    return;
                  }

                  onChange(toISO(parsed));
                }}
                className={`w-full md:py-[15px] py-[10px] text-white font-normal font-16 leading-[20px]
                  px-4 border-[1.6px] rounded-[6px] focus:outline-none
                  placeholder:text-dark-grey
                  ${manualError || error ? 'border-red' : 'border-[#475462]'}
                  ${inputValue ? 'bg-black' : 'bg-dark-black'}
                  ${disabled ? 'cursor-not-allowed' : 'cursor-text'}
                `}
                isClearable
              />

              {(manualError || fieldState.error?.message) && (
                <p className="text-red text-sm leading-[20px] font-medium mt-1">
                  {manualError || fieldState.error?.message}
                </p>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
