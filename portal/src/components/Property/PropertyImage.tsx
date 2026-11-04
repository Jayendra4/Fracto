import { useState } from 'react';

interface PropertyImageProps {
  src: string;
  alt: string;
  heightClass?: string;
  imgClassName?: string;
  wrapperClassName?: string;
}

export default function PropertyImage({
  src,
  alt,
  heightClass = 'h-full',
  imgClassName,
  wrapperClassName,
}: PropertyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={`relative w-full ${heightClass} bg-gray-700 rounded-xl overflow-hidden ${wrapperClassName}`}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-600 animate-pulse"></div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className={`w-full object-cover h-full transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
    </div>
  );
}
