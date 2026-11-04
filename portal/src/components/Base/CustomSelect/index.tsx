import Tooltip from '@/components/Common/Tooltip';
import { useState, useRef, useEffect, useMemo } from 'react';
// import { BiSupport } from 'react-icons/bi';
import { FiChevronDown, FiInfo, FiSearch } from 'react-icons/fi';

interface ICustomSelectProps {
  label?: string;
  value: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  onBlur?: () => void;
  options: { label: string; value: string | number; url?: string }[];
  placeholder?: string;
  className?: string;
  isMulti?: boolean;
  isDisabled?: boolean;
  required?: boolean;
  error?: string;
  isSearchable?: boolean;
  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
  isImage?: boolean;
}

export default function CustomSelect({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  isMulti,
  isDisabled = false,
  required,
  error,
  isSearchable = false,
  tooltip,
  toolTipContent,
  helpDesk,
  isImage,
}: ICustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (open) {
          setOpen(false);
          onBlur?.();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur, open]);

  const normalize = (v: string | number) => String(v);

  const isSelected = (val: string | number) => {
    const normVal = normalize(val);

    if (isMulti) {
      const arr = Array.isArray(value) ? value : [];
      return arr.map(normalize).includes(normVal);
    }

    return normalize(value as string | number) === normVal;
  };

  const handleSelect = (val: string | number) => {
    if (isDisabled) return;

    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      const normalized = current.map(normalize);

      if (normalized.includes(normalize(val))) {
        onChange(current.filter((v) => normalize(v) !== normalize(val)));
      } else {
        onChange([...current, val]);
      }
    } else {
      onChange(val);
      setOpen(false);
    }
  };

  const selectedLabels = isMulti
    ? options
        .filter((opt) =>
          Array.isArray(value)
            ? value.map(normalize).includes(normalize(opt.value))
            : false
        )
        .map((opt) => opt.label)
        .join(', ')
    : options.find(
        (opt) => normalize(opt.value) === normalize(value as string | number)
      )?.label || '';

  const isPlaceholder = !selectedLabels;

  const filteredOptions = useMemo(() => {
    if (!isSearchable || !search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
  }, [options, isSearchable, search]);

  return (
    <div className="w-full">
      {label && (
        <label className="flex items-center gap-2 min-h-[18px] font-18 font-medium  text-[var(--fg)]">
          <span className="flex items-center gap-1">
            {label}
            {required && <span className="text-red">*</span>}
          </span>

          {tooltip && (
            <Tooltip content={toolTipContent || ''}>
              <FiInfo className="text-gray-400 cursor-pointer shrink-0" />
            </Tooltip>
          )}

          {helpDesk && (
            <span
              // onClick={() => window.open('/dashboard/rwa/vendors', '_blank')}
              className="cursor-pointer shrink-0"
              title="Help"
            >
              {/* <BiSupport size={20} /> */}
            </span>
          )}
        </label>
      )}

      <div
        className={`relative w-full ${isDisabled ? 'opacity-50' : ''}`}
        ref={ref}
      >
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => !isDisabled && setOpen(!open)}
          className={`w-full py-2.5 md:py-3.5 px-4 rounded-xl text-left font-16 font-normal leading-[20px] focus:outline-none border bg-[var(--fg)]/5 transition-all duration-300 hover:border-[var(--fg)]/20 ${
            isDisabled ? 'cursor-not-allowed opacity-60' : ''
          } ${open ? 'border-[var(--fg)]/30 bg-[var(--fg)]/8 shadow-[0_0_15px_rgba(var(--fg-rgb),0.02)]' : 'border-[var(--fg)]/10'} 
            ${error ? 'border-red-500/50' : ''}`}
        >
          <div className="flex items-center justify-between w-full pointer-events-none">
            <span
              className={
                isPlaceholder ? 'text-[var(--fg)]/30' : 'text-[var(--fg)]'
              }
            >
              {selectedLabels || placeholder}
            </span>
            <FiChevronDown
              className={`text-[var(--fg)]/50 text-xl transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {open && !isDisabled && (
          <div className="absolute z-[100] mt-2 w-full bg-[var(--inner-card)] border border-[var(--fg)]/10 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 scrollbar-ui">
            {isSearchable && (
              <div className="px-3 py-2 border-b border-[var(--fg)]/10 flex items-center gap-2 sticky top-0 bg-[var(--inner-card)] z-10">
                <FiSearch className="text-[var(--fg)]/40 text-lg" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent outline-none text-[var(--fg)] font-14 placeholder:text-[var(--fg)]/30"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}
            <div className="overflow-y-auto w-full flex-1 scrollbar-ui">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={String(opt.value)}
                    onClick={() => {
                      handleSelect(opt.value);
                      onBlur?.();
                    }}
                    className={`px-4 py-3 text-left flex items-center gap-2 font-16 border-b border-[var(--fg)]/5 cursor-pointer transition-all duration-200 hover:bg-[var(--fg)]/5 ${
                      isSelected(opt.value)
                        ? 'bg-[var(--fg)]/10 font-medium text-blue'
                        : 'text-[var(--fg)]'
                    }`}
                  >
                    {isImage && (
                      <img
                        src={opt.url || ''}
                        alt={opt.label}
                        className="w-8 h-8 rounded object-contain"
                      />
                    )}{' '}
                    {opt.label}
                  </div>
                ))
              ) : (
                <div className="px-4 py-4 text-center font-14 text-[var(--fg)]/50 w-full">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red text-xs leading-[20px] font-medium mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
