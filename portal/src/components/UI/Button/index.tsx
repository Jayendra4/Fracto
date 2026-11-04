import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group/btn transition-all duration-300 ${className} ${disabled ? 'opacity-60 bg-inactive-blue cursor-not-allowed text-[#949494]' : 'cursor-pointer bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white shadow-md hover:shadow-lg hover:brightness-110'}`}
    >
      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
      <span className="relative z-10 flex items-center justify-center w-full gap-2">
        {children}
      </span>
    </button>
  );
}
