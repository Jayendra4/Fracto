// components/Common/Tooltip.tsx

import { useState } from 'react';

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

export default function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* Trigger */}
      <div
        onClick={() => setShow(!show)} // mobile support
        className="cursor-pointer"
      >
        {children}
      </div>

      {/* Tooltip */}
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-black text-white text-xs rounded-md px-3 py-2 shadow-lg z-50 w-max max-w-[220px]">
          {content}
        </div>
      )}
    </div>
  );
}
