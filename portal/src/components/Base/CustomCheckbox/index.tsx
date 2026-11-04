import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';

interface ICustomCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function CustomCheckbox({
  label,
  checked,
  onChange,
  disabled,
}: ICustomCheckboxProps) {
  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer group select-none transition-all duration-300
        ${disabled ? 'cursor-not-allowed opacity-60 pointer-events-none' : ''}
      `}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer box */}
        <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300
          ${checked
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-transparent shadow-[0_0_10px_rgba(96,165,250,0.3)]'
            : 'border-[var(--fg)]/20 group-hover:border-[var(--fg)]/40 bg-[var(--fg)]/5'}
        `} />

        {/* Checkmark icon with animation */}
        {checked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute text-white"
          >
            <HiCheck size={16} strokeWidth={1} />
          </motion.div>
        )}
      </div>

      <span className={`font-16 font-medium transition-colors duration-300
        ${checked ? 'text-[var(--fg)]' : 'text-[var(--fg)]/50 group-hover:text-[var(--fg)]/70'}
      `}>
        {label}
      </span>
    </label>
  );
}
