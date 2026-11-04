import { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

type FieldChangeEvent =
  | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  | { target: { name: string; value: string } };

export const AaInput = ({
  label,
  required,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="font-12 text-gray-500 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      {...props}
      autoComplete="off"
      onWheel={(e) => {
        if (props.type === 'number') {
          (e.target as HTMLInputElement).blur();
          e.preventDefault();
        }
      }}
      className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg font-12 md:font-14 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-[#1F4FE0] focus:bg-white dark:focus:bg-white/10 scheme-light dark:scheme-dark"
    />
    {error && <p className="text-red-500 text-[11px] mt-0.5">{error}</p>}
  </div>
);

export const AaMobileInput = ({
  label,
  required,
  error,
  name,
  value,
  onChange,
  onBlur,
  placeholder = 'Enter 10-digit mobile number',
}: {
  label: string;
  required?: boolean;
  error?: string;
  name: string;
  value: string;
  onChange: (e: FieldChangeEvent) => void;
  onBlur?: (e: FieldChangeEvent) => void;
  placeholder?: string;
}) => {
  const digits = (value || '').startsWith('+91')
    ? value.slice(3)
    : (value || '').replace(/\D/g, '').slice(0, 10);

  const emit = (nextDigits: string) => {
    onChange({ target: { name, value: nextDigits ? `+91${nextDigits}` : '' } });
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-12 text-gray-500 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`flex items-center border rounded-lg overflow-hidden bg-gray-50 dark:bg-white/5 focus-within:border-[#1F4FE0] ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-white/10'
        }`}
      >
        <span className="px-3 py-2 font-12 md:font-14 text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-white/10 select-none shrink-0">
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          value={digits}
          onChange={(e) => emit(e.target.value.replace(/\D/g, '').slice(0, 10))}
          onBlur={() =>
            onBlur?.({ target: { name, value: digits ? `+91${digits}` : '' } })
          }
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 py-2 font-12 md:font-14 bg-transparent text-gray-800 dark:text-white outline-none"
        />
      </div>
      {error && <p className="text-red-500 text-[11px] mt-0.5">{error}</p>}
    </div>
  );
};

export const AaTextArea = ({
  label,
  required,
  error,
  minLength,
  maxLength,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
  minLength?: number;
  maxLength?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const charCount = String(props.value || '').length;
  const showCounter = minLength !== undefined || maxLength !== undefined;
  const isOverMax = maxLength !== undefined && charCount > maxLength;
  const isUnderMin = minLength !== undefined && charCount < minLength;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-12 text-gray-500 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        {...props}
        rows={4}
        className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg font-12 md:font-14 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-[#1F4FE0] focus:bg-white dark:focus:bg-white/10 resize-none scheme-light dark:scheme-dark"
      />
      <div className="flex justify-between items-start">
        {error ? <p className="text-red-500 text-[11px]">{error}</p> : <span />}
        {showCounter && (
          <p
            className={`text-[11px] ml-auto ${
              isOverMax
                ? 'text-red-500'
                : isUnderMin
                  ? 'text-gray-400'
                  : 'text-green-600'
            }`}
          >
            {charCount}
            {maxLength !== undefined ? `/${maxLength}` : ''}
            {minLength !== undefined && maxLength === undefined
              ? ` / min ${minLength}`
              : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export const AaSelect = ({
  label,
  name,
  value,
  options = [],
  onChange,
  onBlur,
  error,
  disabled = false,
  placeholder = 'Select',
}: {
  label: string;
  name: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (e: FieldChangeEvent) => void;
  onBlur?: (e: FieldChangeEvent) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-12 text-gray-500 font-medium">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative" ref={ref}>
        <div
          onClick={() => {
            if (disabled) return;
            setOpen(!open);
          }}
          onBlur={() => onBlur?.({ target: { name, value } })}
          className={`px-3 py-2 border rounded-lg font-12 md:font-14 flex items-center justify-between cursor-pointer transition
            border-gray-300 dark:border-white/10
            ${open ? 'bg-white dark:bg-[#132436] border-[#1F4FE0]' : 'bg-gray-50 dark:bg-white/5'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#1F4FE0]/50'}
          `}
        >
          <span
            className={
              selected
                ? 'text-gray-800 dark:text-white font-medium'
                : 'text-gray-400 dark:text-gray-500'
            }
          >
            {selected ? selected.label : placeholder}
          </span>
          <FiChevronDown
            className={`text-gray-500 dark:text-gray-300 transition-transform shrink-0 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>

        {open && (
          <div className="absolute z-[999] w-full mt-1 bg-white dark:bg-[#132436] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
            <ul className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-100 dark:divide-white/5 scrollbar-ui">
              <li
                onClick={() => {
                  onChange({ target: { name, value: '' } });
                  setOpen(false);
                }}
                className="px-3 py-2 text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-sm text-start"
              >
                {placeholder}
              </li>

              {options.map((o) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onChange({ target: { name, value: o.value } });
                    setOpen(false);
                  }}
                  className={`px-3 py-2 text-sm text-start cursor-pointer transition
                    ${
                      value === o.value
                        ? 'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/40 dark:text-blue-300 font-semibold'
                        : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                    }
                  `}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-[11px] mt-0.5">{error}</p>}
    </div>
  );
};

export const AaSearchableSelect = ({
  label,
  name,
  value,
  options = [],
  onChange,
  onBlur,
  error,
  disabled = false,
  placeholder = 'Select',
}: {
  label: string;
  name: string;
  value: string;
  options?: { label: string; value: string }[];
  onChange: (e: FieldChangeEvent) => void;
  onBlur?: (e: FieldChangeEvent) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setSearch('');
    setOpen(false);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-12 text-gray-500 font-medium">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative" ref={ref}>
        <div
          onClick={() => {
            if (disabled) return;
            setOpen(!open);
          }}
          onBlur={() => onBlur?.({ target: { name, value } })}
          className={`px-3 py-2 border rounded-lg font-12 md:font-14 flex items-center justify-between cursor-pointer transition
            border-gray-300 dark:border-white/10
            ${open ? 'bg-white dark:bg-[#132436] border-[#1F4FE0]' : 'bg-gray-50 dark:bg-white/5'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#1F4FE0]/50'}
          `}
        >
          <span
            className={
              selected
                ? 'text-gray-800 dark:text-white font-medium'
                : 'text-gray-400 dark:text-gray-500'
            }
          >
            {selected ? selected.label : placeholder}
          </span>
          <FiChevronDown
            className={`text-gray-500 dark:text-gray-300 transition-transform shrink-0 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>

        {open && (
          <div className="absolute z-[999] w-full mt-1 bg-white dark:bg-[#132436] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
            <div className="p-2 border-b border-gray-100 dark:border-white/10">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white text-sm px-3 py-2 rounded-md outline-none border border-gray-200 dark:border-white/10 focus:border-[#1F4FE0] placeholder:text-gray-400"
              />
            </div>

            <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 scrollbar-ui">
              <li
                onClick={() => {
                  onChange({ target: { name, value: '' } });
                  setOpen(false);
                  setSearch('');
                }}
                className="px-3 py-2 text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-sm text-start"
              >
                {placeholder}
              </li>

              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-gray-400 text-sm text-center">
                  No results found
                </li>
              ) : (
                filtered.map((o) => (
                  <li
                    key={o.value}
                    onClick={() => {
                      onChange({ target: { name, value: o.value } });
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`px-3 py-2 text-sm text-start cursor-pointer transition
                      ${
                        value === o.value
                          ? 'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/40 dark:text-blue-300 font-semibold'
                          : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    {o.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-[11px] mt-0.5">{error}</p>}
    </div>
  );
};
