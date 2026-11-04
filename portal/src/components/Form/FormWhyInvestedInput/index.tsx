/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useState } from 'react';
import {
  Controller,
  useFormState,
  useWatch,
  type Control,
  type FieldValues,
} from 'react-hook-form';
import type { IFormWhyInvestedConfig } from '@/interface';

import CustomInput from '@/components/Base/CustomInput';
import CustomSelect from '@/components/Base/CustomSelect';
import CustomTextarea from '@/components/Base/CustomTextarea';

interface IFormWhyInvestedInputProps {
  field: IFormWhyInvestedConfig;
  control: Control<FieldValues>;
  iconOptions?: { label: string; value: string; url: string }[];
}

const getWordCount = (text: string) => {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
};

export default function FormWhyInvestedInput({
  field,
  control,
  iconOptions = [],
}: IFormWhyInvestedInputProps) {
  const fixedArray = [0, 1, 2, 3];

  const [activeIndex, setActiveIndex] = useState(0);
  const values = useWatch({
    control,
    name: field.name,
  });
  const { errors } = useFormState({ control, name: field.name });

  const isEntryFilled = (index: number) => {
    const entry = values?.[index];

    return entry?.icon && entry?.title && entry?.description;
  };

  const entryError = errors?.[field.name] as
    | Array<Record<string, { message?: string } | undefined> | undefined>
    | undefined;

  const hasEntryError = (index: number) => {
    const err = entryError?.[index];
    return !!(err?.icon || err?.title || err?.description);
  };

  const selectedIcons =
    values?.map((item: any) => item?.icon).filter(Boolean) || [];

  const getFilteredOptions = (currentIndex: number) => {
    // console.log(iconOptions, 'iconOptions');
    return iconOptions.filter((opt) => {
      const isSelectedElsewhere = selectedIcons.includes(opt.value);
      const isCurrentSelected = values?.[currentIndex]?.icon === opt.value;
      return !isSelectedElsewhere || isCurrentSelected;
    });
  };

  return (
    <div className="col-span-12">
      <label className="font-18 font-medium mb-4 block text-[var(--fg)]">
        {field.label} {field.required && <span className="text-red">*</span>}
      </label>

      {fixedArray.map((_, index) => {
        const isOpen = activeIndex === index;

        return (
          <div
            key={index}
            className="mb-4 rounded-xl border border-white/10 bg-[var(--card)]"
          >
            <div
              onClick={() => setActiveIndex(index)}
              className={`p-4 cursor-pointer flex justify-between items-center rounded-xl transition-all duration-200
    ${
      isOpen
        ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
        : hasEntryError(index)
          ? 'bg-red-500/5 border border-red-500/40'
          : 'hover:bg-white/5 border border-transparent'
    }
  `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
        ${
          isOpen
            ? 'bg-[var(--primary)] text-white'
            : hasEntryError(index)
              ? 'bg-red-500/20 text-red-500'
              : 'bg-white/10 text-[var(--fg)]'
        }
      `}
                ></div>

                {/* Title */}
                <p className="text-[var(--fg)] font-medium">
                  {index + 1}. Investment Reason {index + 1}
                  {index === 0 ? (
                    <span className="text-red ml-1">*</span>
                  ) : (
                    <span className="text-[var(--fg)]/40 font-normal text-xs ml-1">
                      (Optional)
                    </span>
                  )}
                </p>
                {isEntryFilled(index) ? (
                  <span className="text-green-500 text-lg">✔</span>
                ) : (
                  hasEntryError(index) && (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                      ⚠ Incomplete
                    </span>
                  )
                )}
              </div>

              {/* Icon */}
              <div
                className={`transition-transform duration-300 text-lg ${
                  isOpen ? 'rotate-180' : ''
                }`}
              >
                ▼
              </div>
            </div>

            {/* BODY — always mounted (never conditionally unmounted) so
                react-hook-form registers & validates all 4 entries, not just
                the one the user happens to have expanded; hidden via CSS
                when collapsed instead. */}
            <div
              className={`p-4 border-t border-white/10 ${isOpen ? '' : 'hidden'}`}
            >
              <div className="grid grid-cols-12 gap-4">
                {/* ICON */}
                <div className="col-span-12 md:col-span-6">
                  <Controller
                    control={control}
                    name={`${field.name}.${index}.icon`}
                    rules={{
                      required: index === 0 ? 'Icon is required' : false,
                    }}
                    render={({ field: controllerField, fieldState }) => (
                      <CustomSelect
                        value={controllerField.value || ''}
                        onChange={controllerField.onChange}
                        onBlur={controllerField.onBlur}
                        label="Icon"
                        options={getFilteredOptions(index)}
                        placeholder="Select icon"
                        required
                        isImage
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* TITLE */}
                <div className="col-span-12 md:col-span-6">
                  <Controller
                    control={control}
                    name={`${field.name}.${index}.title`}
                    rules={{
                      required: index === 0 ? 'Title is required' : false,
                      validate: (value: string) => {
                        // Optional entries (index > 0) can stay empty.
                        if (index !== 0 && !value) return true;

                        const count = getWordCount(value);

                        if (count < 3) return 'Minimum 3 words required';
                        if (count > 20) return 'Maximum 20 words allowed';

                        return true;
                      },
                    }}
                    render={({ field: controllerField, fieldState }) => (
                      <>
                        <CustomInput
                          type="text"
                          value={controllerField.value || ''}
                          onChange={controllerField.onChange}
                          onBlur={controllerField.onBlur}
                          label="Title"
                          placeholder="Enter title"
                          required
                          error={fieldState.error?.message}
                        />
                        <div className="flex justify-end text-end">
                          <p className="text-xs text-gray-400 mt-1">
                            {getWordCount(controllerField.value || '')}/20 words
                          </p>
                        </div>
                      </>
                    )}
                  />
                </div>

                {/* DESCRIPTION (FULL WIDTH) */}
                <div className="col-span-12">
                  <Controller
                    control={control}
                    name={`${field.name}.${index}.description`}
                    rules={{
                      required: index === 0 ? 'Description is required' : false,
                      validate: (value: string) => {
                        // Optional entries (index > 0) can stay empty.
                        if (index !== 0 && !value) return true;

                        const count = getWordCount(value);

                        if (count < 30) return 'Minimum 30 words required';
                        if (count > 100) return 'Maximum 100 words allowed';

                        return true;
                      },
                    }}
                    render={({ field: controllerField, fieldState }) => (
                      <>
                        <CustomTextarea
                          value={controllerField.value || ''}
                          onChange={controllerField.onChange}
                          onBlur={controllerField.onBlur}
                          label="Description"
                          placeholder="Explain why this property is a good investment"
                          rows={4}
                          required
                          error={fieldState.error?.message}
                        />
                        <div className="flex justify-end text-end">
                          <p className="text-xs text-gray-400 mt-1">
                            {getWordCount(controllerField.value || '')}/100
                            words
                          </p>
                        </div>
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
