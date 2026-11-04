import Tooltip from '@/components/Common/Tooltip';
import { motion } from 'framer-motion';
// import { BiSupport } from 'react-icons/bi';
import { FiInfo } from 'react-icons/fi';

interface IRadioOption {
  label: string;
  value: string | number;
}

interface ICustomRadioProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: IRadioOption[];
  disabled?: boolean;
  error?: string;
  rules?: Record<string, any>;
  required?: boolean;

  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
}

export default function CustomRadio({
  label,
  value,
  onChange,
  options,
  disabled,
  required,
  error,
  rules,
  tooltip,
  toolTipContent,
  helpDesk,
}: ICustomRadioProps) {
  const isRequired = rules?.required ? true : required;

  return (
    <div className="w-full">
      <label className="flex items-center gap-1.5 min-h-[30px] font-18 font-medium mb-2 text-[var(--fg)]">
        {/* label + * */}
        <span className="flex items-center gap-1">
          <span>{label}</span>
          {isRequired && <span className="text-red">*</span>}
        </span>

        {/* icons */}
        <span className="flex items-center gap-1.5">
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
        </span>
      </label>

      <div className="w-full py-4">
        <div className="flex gap-4 md:gap-8 items-start md:items-center flex-wrap">
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <label
                key={String(opt.value)}
                className={`inline-flex items-center gap-3 cursor-pointer group transition-colors
                  ${isSelected ? 'text-[var(--fg)]' : 'text-[var(--fg)]/40 hover:text-[var(--fg)]/60'}
                  ${disabled ? 'pointer-events-none' : ''}
                `}
                onClick={() => onChange(opt.value)}
              >
                <div className="relative flex items-center justify-center">
                  {/* Outer circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-300
                    ${
                      isSelected
                        ? 'border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]'
                        : 'border-[var(--fg)]/20 group-hover:border-[var(--fg)]/40'
                    }
                  `}
                  />

                  {/* Inner dot with animation */}
                  {isSelected && (
                    <motion.div
                      layoutId={`radio-dot-${label}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                    />
                  )}
                </div>
                <span className="font-16 font-medium leading-none">
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs leading-[20px] font-medium mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
