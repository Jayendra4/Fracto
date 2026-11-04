import type { JSX } from 'react';

interface FormButtonProps {
  title: string;
  onClick?: () => void;
}

export default function FormButton({
  title,
  onClick,
}: FormButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center  cursor-pointer bg-gradient-to-b from-[#2A5A8D] from-10% to-[#4F86C0] to-90% px-6 py-3 w-[320px] xl:w-[520px] lg:h-16 h-10 rounded-[6px] text-center mt-4 font-medium font-24 text-[#FFFFFF] leading-[100%]"
    >
      {title}
    </button>
  );
}
