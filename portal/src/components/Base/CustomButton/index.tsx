export interface ICustomButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'formButton';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  isValid?: string;
}

export default function CustomButton({
  type = 'button',
  variant = 'primary',
  children,
  disabled = false,
  onClick,
  className = '',
}: ICustomButtonProps) {
  const baseClasses =
    'py-2.5 px-6 rounded-xl font-medium transition-all duration-300 focus:outline-none flex items-center justify-center gap-2 relative overflow-hidden group/btn mt-3';

  const variantStyles: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white hover:shadow-lg hover:brightness-110 shadow-md',
    secondary: 'bg-[var(--fg)]/10 text-[var(--fg)] hover:bg-[var(--fg)]/20',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline:
      'border border-[var(--fg)]/10 text-[var(--fg)] hover:bg-[var(--fg)]/5',
    formButton:
      'bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white hover:shadow-lg hover:brightness-110 shadow-md',
  };

  const variantClasses = disabled
    ? 'bg-[var(--fg)]/10 text-[var(--fg)]/30 cursor-not-allowed border border-[var(--fg)]/5'
    : (variantStyles[variant] || variantStyles.primary) + ' cursor-pointer';

  return (
    <button
      type={type}
      className={`${baseClasses} font-18 ${variantClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
      <span className="relative z-10 flex items-center justify-center w-full gap-2">
        {children}
      </span>
    </button>
  );
}
