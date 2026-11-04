/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { FiChevronDown } from 'react-icons/fi';

export const Input = ({
  label,
  required,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  error: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    {label && (
      <p className="text-white text-left text-sm mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
    )}

    <input
      {...props}
      autoComplete="off"
      onWheel={(e) => {
        if (props.type === 'number') {
          (e.target as HTMLInputElement).blur();
          e.preventDefault(); //
        }
      }}
      className="w-full bg-[#0A1A2F] p-3 rounded-md text-white placeholder-gray-500 outline-none border border-white/10 focus:border-[#3A76C0] transition-all"
    />

    {error && (
      <p className="text-red-600 text-start capitalize text-xs mt-1 ml-1">
        {error}
      </p>
    )}
  </div>
);

export const TextArea = ({
  label,
  required,
  error,
  minLength,
  maxLength,
  ...props
}: {
  label: string;
  required?: boolean;
  error: string;
  minLength?: number;
  maxLength?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const charCount = String(props.value || '').length;
  const showCounter = minLength !== undefined || maxLength !== undefined;
  const isOverMax = maxLength !== undefined && charCount > maxLength;
  const isUnderMin = minLength !== undefined && charCount < minLength;

  return (
    <div>
      {label && (
        <p className="text-white text-left text-sm mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
      )}

      <textarea
        {...props}
        rows={4}
        className="w-full bg-[#0A1A2F] p-3 rounded-md text-white placeholder-gray-500 outline-none border border-white/10 focus:border-[#3A76C0] transition-all resize-none"
      />

      <div className="flex justify-between items-start mt-1">
        {error ? (
          <p className="text-red-600 text-start capitalize text-xs ml-1">
            {error}
          </p>
        ) : (
          <span />
        )}

        {showCounter && (
          <p
            className={`text-xs ml-auto ${isOverMax ? 'text-red-500' : isUnderMin ? 'text-gray-400' : 'text-green-500'}`}
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

export const Select = ({
  label,
  name,
  value,
  options,
  onChange,
  error,
  onBlur,
}: any) => (
  <div>
    <p className="text-white text-sm text-start mb-1">
      {label} <span className="text-red-500">*</span>
    </p>

    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="w-full bg-[#0A1A2F] p-3 pr-10 rounded-md outline-none border border-white/10 focus:border-[#3A76C0] text-white appearance-none"
      >
        <option value="">Select</option>

        {options.map((o: any, i: number) => (
          <option key={i} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white" />
    </div>

    {error && <p className="text-red-600 text-start text-xs mt-1">{error}</p>}
  </div>
);

// SearchableSelect.tsx ya same file mein upar
import { useState, useRef, useEffect } from 'react';

export const SearchableSelect = ({
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
  options?: { label: string; value: string }[]; // ✅ optional
  onChange: (e: any) => void;
  onBlur?: (e: any) => void;
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

  // value change hone par search clear karo
  useEffect(() => {
    setSearch('');
    setOpen(false);
  }, [value]);

  return (
    <div>
      <p className="text-white text-start text-sm mb-1">
        {label} <span className="text-red-500">*</span>
      </p>

      <div className="relative" ref={ref}>
        <div
          onClick={() => {
            if (disabled) return;
            setOpen(!open);
          }}
          onBlur={() => {
            onBlur?.({ target: { name, value } });
          }}
          className={`w-full bg-[#0A1A2F] p-3  rounded-md border border-white/10 text-white flex items-center justify-between cursor-pointer transition
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/30'}
            ${open ? 'border-[#3A76C0]' : ''}
          `}
        >
          <span className={selected ? 'text-white' : 'text-white/40'}>
            {selected ? selected.label : placeholder}
          </span>
          <FiChevronDown
            className={`text-white transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          />
        </div>

        {open && (
          <div className="absolute z-[9999] w-full mt-1 bg-[#0A1A2F] border border-white/10 rounded-md shadow-xl overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-white/10">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#0d2035] text-white text-sm px-3 py-2 rounded-md outline-none border border-white/10 focus:border-[#3A76C0] placeholder:text-white/30"
              />
            </div>

            {/* Options List */}
            <ul className="max-h-48 overflow-y-auto modal-scroll">
              <li
                onClick={() => {
                  onChange({ target: { name, value: '' } });
                  setOpen(false);
                  setSearch('');
                }}
                className="px-3 py-2 text-white/40 hover:bg-white/5 cursor-pointer text-sm text-start"
              >
                {placeholder}
              </li>

              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-white/30 text-sm text-center">
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
                    className={`px-3 py-2 text-sm text-start cursor-pointer hover:bg-white/5 transition
                      ${value === o.value ? 'bg-[#3A76C0]/20 text-[#3A76C0]' : 'text-white'}
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

      {error && (
        <p className="text-red-600 text-start capitalize text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
