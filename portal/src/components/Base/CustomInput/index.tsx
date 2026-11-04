/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import Tooltip from '@/components/Common/Tooltip';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
// import { BiSupport } from 'react-icons/bi';
import { FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface CustomInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  onBlur?: () => void;
  extraText?: string;
  rightIcon?: ReactNode;
  disabled?: boolean;
  rules?: Record<string, any>;
  isLogin?: boolean;
  isForgot?: boolean;
  isCurrency?: boolean;
  isAssetOnboarding?: boolean;
  isVendorSuggestion?: boolean;
  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
  min?: string;
  max?: string;
  autoFocus?: boolean;
}

export default function CustomInput({
  label = '',
  type,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  onBlur,
  extraText,
  rightIcon,
  // rules,
  isLogin,
  isAssetOnboarding,
  isVendorSuggestion,
  isForgot,
  isCurrency,
  tooltip,
  toolTipContent,
  helpDesk,
  min,
  max,
  autoFocus,
}: CustomInputProps) {
  const isMobile = type === 'contact';
  const allowCountryChange =
    isLogin || isForgot || isAssetOnboarding || isVendorSuggestion;

  const countryIdFromDraft = (() => {
    try {
      const ls = localStorage.getItem('hof_registration_draft');
      if (!ls) return null;

      const parsed = JSON.parse(ls);
      return parsed?.countryId ?? null;
    } catch {
      return null;
    }
  })();

  const forcedCountryCode =
    countryIdFromDraft == 1 ? '+91' : countryIdFromDraft == 2 ? '+971' : '+91';

  const [countryCode, setCountryCode] = useState(forcedCountryCode);

  const numberValue = isMobile ? value.replace(countryCode, '') : value;

  useEffect(() => {
    if (!isMobile) return;
    if (isLogin || isForgot) return;

    if (!value.startsWith(forcedCountryCode)) {
      onChange(forcedCountryCode + numberValue);
    }
    if (countryCode !== forcedCountryCode) {
      setCountryCode(forcedCountryCode);
    }
  }, [forcedCountryCode, isLogin, isForgot]);

  const handleMobileChange = (num: string) => {
    let clean = num.replace(/\D/g, '');

    if (countryCode === '+91') {
      clean = clean.slice(0, 10);

      if (clean.length === 1 && !/[6-9]/.test(clean)) return;
    }

    if (countryCode === '+971') {
      clean = clean.slice(0, 9);

      if (clean.length === 1 && !/5/.test(clean)) return;
    }

    onChange(countryCode + clean);
  };

  // const isRequired = rules?.required ? true : required;

  const isRequired = required ? true : required;

  const formatCurrency = (val: string) => {
    if (!val) return '';
    const numericOnly = val.replace(/,/g, '');
    if (isNaN(Number(numericOnly))) return val;
    const parts = numericOnly.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const displayValue = isCurrency ? formatCurrency(String(value)) : value;

  const handleInputChange = (val: string) => {
    if (isCurrency) {
      const raw = val.replace(/,/g, '');
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (raw === '' || regex.test(raw)) {
        onChange(raw);
      }
    } else if (type === 'date') {
      // Native date inputs only ever report a value once every segment is
      // filled, but browsers (Chrome in particular) can mis-register a
      // 1-3 digit year as a zero-padded 4-digit one on blur — min/max below
      // rejects those, this is a last-resort guard against a malformed year.
      if (val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        onChange(val);
      }
    } else {
      onChange(val);
    }
  };

  return (
    <div>
      <label className="flex items-center gap-2 h-[30px] font-18 font-medium mb-2 text-[var(--fg)]">
        <span>
          {label} {isRequired && <span className="text-red">*</span>}
        </span>

        {tooltip && (
          <Tooltip content={toolTipContent || ''}>
            <FiInfo className="text-gray-400 cursor-pointer" />
          </Tooltip>
        )}

        {helpDesk && (
          <span
            // onClick={() => window.open('/dashboard/rwa/vendors', '_blank')}
            className="cursor-pointer"
            title="Help"
          >
            {/* <BiSupport size={20} /> */}
          </span>
        )}
      </label>

      {isMobile ? (
        <div
          className={`custom-input-phone-shell flex w-full py-2.5 md:py-3 text-[var(--fg)] font-normal font-16 px-4 border border-[var(--fg)]/10 rounded-xl bg-[var(--fg)]/5 focus-within:border-[var(--fg)]/25 focus-within:bg-[var(--fg)]/8 focus-within:shadow-[0_0_15px_rgba(var(--fg-rgb),0.02)] transition-all duration-300 ${
            error ? 'border-red-500/50' : ''
          }`}
        >
          <select
            value={countryCode}
            disabled={!allowCountryChange}
            onChange={(e) => {
              setCountryCode(e.target.value);
              onChange(e.target.value + numberValue);
            }}
            className={`bg-transparent text-[var(--fg)] rounded-[20px] font-16 px-1 focus:outline-none ${
              allowCountryChange ? 'cursor-pointer' : 'opacity-70 '
            }`}
          >
            <option value="+91" className="bg-[var(--inner-card)]">
              +91
            </option>
            <option value="+971" className="bg-[var(--inner-card)]">
              +971
            </option>
          </select>

          <span className="text-inactive-gray px-2">|</span>

          <input
            type="text"
            value={numberValue}
            onChange={(e) => handleMobileChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            onBlur={onBlur}
            className="w-full bg-transparent text-[var(--fg)] px-2 focus:outline-none font-16"
          />
        </div>
      ) : (
        <div className="relative w-full  ">
          <input
            type={isCurrency ? 'text' : type}
            value={displayValue}
            disabled={disabled}
            autoFocus={autoFocus}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            {...(type === 'date'
              ? { min: min ?? '1900-01-01', max: max ?? '2099-12-31' }
              : {})}
            className={`w-full py-2.5 md:py-3 text-[var(--fg)] font-normal font-16 px-4 border border-[var(--fg)]/10 bg-[var(--fg)]/5 rounded-xl focus:outline-none focus:border-[var(--fg)]/25 focus:bg-[var(--fg)]/8 focus:shadow-[0_0_15px_rgba(var(--fg-rgb),0.02)] transition-all duration-300 placeholder:font-normal placeholder:font-16 placeholder:leading-[20px] placeholder:text-[var(--fg)]/30 ${
              error ? 'border-red-500/50' : ''
            }  ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-auto'}`}
          />

          {rightIcon && (
            <div
              className={`absolute right-3 top-[34%] cursor-pointer ${value.length > 0 ? 'text-[var(--fg)]' : 'text-[#333333]'}`}
            >
              {rightIcon}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red text-xs leading-[20px] font-medium mt-1">
          {error}
        </p>
      )}

      {!error && extraText && (
        <p className="text-dark-grey font-14 font-medium leading-[20px] mt-1">
          {extraText}
        </p>
      )}

      {isLogin && (type === 'password' || label === 'Password') && (
        <Link to="/forgot-password" className="font-16 flex justify-end pt-2">
          <span className="text-blue hover:underline cursor-pointer leading-none">
            Forgot Password?
          </span>
        </Link>
      )}
    </div>
  );
}
