import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
  type RegisterOptions,
  type UseFormWatch,
} from 'react-hook-form';
import type { IFormInputConfig } from '../../../interface';
import CustomInput from '@/components/Base/CustomInput';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState, type ReactNode } from 'react';

type IFormInputProps = {
  field: IFormInputConfig & { showToggle?: boolean };
  control: Control<FieldValues>;
  error?: FieldError;
  required?: boolean;
  extraText?: string;
  rightIcon?: ReactNode;
  watch?: UseFormWatch<FieldValues>;
  showStrength?: boolean;
  disabled?: boolean;
  rules?: RegisterOptions;
  isLogin?: boolean;
  isForgot?: boolean;
  isAssetOnboarding?: boolean;
  isVendorSuggestion?: boolean;
};

export default function FormInput({
  field,
  control,
  extraText,
  disabled,
  watch,
  showStrength = false,
  rules,
  isLogin,
  isAssetOnboarding,
  isForgot,
  isVendorSuggestion,
}: IFormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = field.type === 'password';

  const inputType =
    isPassword && field.showToggle
      ? showPassword
        ? 'text'
        : 'password'
      : field.type;

  const mergedRules = {
    ...(field.validation || {}),
    ...(rules || {}),
  };

  const passwordValue = watch?.('newPassword') || watch?.('password') || '';
  const confirmValue = watch?.('confirmPassword') || '';

  if (field.name === 'confirmPassword' && watch) {
    mergedRules.validate = (value: string) =>
      value === passwordValue || 'Passwords do not match';
  }

  const calculateStrength = (password: string) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = calculateStrength(passwordValue);
  const strengthTexts = [
    'Very Weak',
    'Weak',
    'Medium',
    'Strong',
    'Very Strong',
  ];
  const strengthLabel = strengthTexts[strength - 1] || 'Very Weak';

  return (
    <div className="lg:mb-4 sm:mb-8 mb-2">
      <Controller
        name={field.name}
        control={control}
        rules={mergedRules}
        render={({ field: controllerField, fieldState }) => (
          <div>
            <CustomInput
              label={field.label}
              type={inputType}
              value={controllerField.value || ''}
              onChange={controllerField.onChange}
              rules={mergedRules}
              placeholder={field.placeholder}
              error={fieldState.error?.message}
              required={field.required}
              onBlur={controllerField.onBlur}
              extraText={extraText}
              disabled={disabled}
              isLogin={isLogin}
              isAssetOnboarding={isAssetOnboarding}
              isVendorSuggestion={isVendorSuggestion}
              isForgot={isForgot}
              isCurrency={field.isCurrency}
              tooltip={field.tooltip}
              toolTipContent={field.toolTipContent}
              helpDesk={field.helpDesk}
              rightIcon={
                isPassword && field.showToggle ? (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className=""
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                ) : null
              }
            />

            {showStrength &&
              isPassword &&
              (field.name === 'password' || field.name === 'newPassword') &&
              passwordValue && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-[var(--fg)]">
                    Your password is{' '}
                    <span className="text-green">
                      {strengthLabel.toLowerCase()}
                    </span>
                  </p>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-[4px] w-[25px] rounded-[2px] border ${
                          strength >= lvl
                            ? 'bg-green border-green'
                            : 'border-inactive-gray'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}

            {field.name === 'confirmPassword' &&
              confirmValue &&
              !fieldState.error && (
                <p
                  className={`text-xs mt-1 ${
                    confirmValue === passwordValue
                      ? 'text-green'
                      : 'text-red-500'
                  }`}
                >
                  {confirmValue === passwordValue
                    ? 'Passwords match'
                    : 'Password doesn’t match'}
                </p>
              )}

            {field.name === 'mapUrl' &&
              controllerField.value &&
              !fieldState.error && (
                <a
                  href={controllerField.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline"
                >
                  Show in Map ↗
                </a>
              )}
          </div>
        )}
      />
    </div>
  );
}
