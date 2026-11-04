import { useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export default function ImageWithFallback({
  src,
  fallbackText = 'No Preview',
  className,
  ...rest
}: Props) {
  const [error, setError] = useState(false);

  if (!src || error) {
    const isPdf = src?.toLowerCase().endsWith('.pdf');
    return (
      <div
        className={`flex items-center justify-center bg-black/30 text-white text-xs ${className}`}
      >
        {isPdf ? 'PDF' : fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      onError={() => setError(true)}
      className={className}
      {...rest}
    />
  );
}
