import Tooltip from '@/components/Common/Tooltip';
// import { BiSupport } from 'react-icons/bi';
import { FiInfo } from 'react-icons/fi';

interface CustomTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rules?: Record<string, any>;
  onBlur?: () => void;
  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
}

export default function CustomTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  onBlur,
  disabled,
  required,
  rules,
  tooltip,
  toolTipContent,
  helpDesk,
}: CustomTextareaProps) {
  const isRequired = rules?.required ? true : required;

  const minLength = rules?.minLength?.value ?? rules?.minLength ?? null;
  const maxLength = rules?.maxLength?.value ?? rules?.maxLength ?? null;
  const showCounter = minLength !== null || maxLength !== null;
  const charCount = value?.length || 0;
  const isUnderMin = minLength !== null && charCount < minLength;
  const isOverMax = maxLength !== null && charCount > maxLength;
  return (
    <div>
      <label className="flex items-center gap-2 min-h-[30px] font-18 font-medium mb-2 text-[var(--fg)]">
        <span className="flex items-center gap-1">
          {label}
          {isRequired && <span className="text-red">*</span>}
        </span>

        {tooltip && (
          <Tooltip content={toolTipContent || ''}>
            <FiInfo className="text-gray-400 cursor-pointer" />
          </Tooltip>
        )}

        {helpDesk && (
          <button
            type="button"
            // onClick={() => window.open('/dashboard/rwa/vendors', '_blank')}
            className="cursor-pointer"
            title="Help"
          >
            {/* <BiSupport size={20} /> */}
          </button>
        )}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        onBlur={onBlur}
        className={`
          resize-none
          w-full
          py-3
          px-4
          rounded-xl
          text-[var(--fg)]
          font-normal
          font-16
          leading-[20px]
          border
          bg-[var(--fg)]/5
          border-[var(--fg)]/10
          focus:outline-none
          focus:border-[var(--fg)]/25
          focus:bg-[var(--fg)]/8
          focus:shadow-[0_0_15px_rgba(var(--fg-rgb),0.02)]
          transition-all
          duration-300
          placeholder:text-[var(--fg)]/30
          placeholder:font-normal
          placeholder:font-16
          placeholder:leading-[20px]
          ${error ? 'border-red-500/50' : ''}
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-auto'}
        `}
      />

      {/* {error && (
        <p className="text-red text-sm leading-[20px] font-medium mt-1">
          {error}
        </p>
      )} */}

      <div className="flex items-start justify-between mt-1 gap-2">
        {error ? (
          <p className="text-red text-sm leading-[20px] font-medium">{error}</p>
        ) : (
          <span />
        )}

        {showCounter && (
          <p
            className={`text-xs leading-[20px] font-medium whitespace-nowrap ml-auto
              ${isOverMax ? 'text-red-500' : isUnderMin ? 'text-[var(--fg)]/40' : 'text-green-600'}
            `}
          >
            {charCount}
            {maxLength !== null ? `/${maxLength}` : ''}
            {minLength !== null && maxLength === null
              ? ` / min ${minLength}`
              : ''}
          </p>
        )}
      </div>
    </div>
  );
}
