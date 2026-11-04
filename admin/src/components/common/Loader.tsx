import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = true, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const loaderContent = (
    <div
      className={`dot-spinner ${sizeClasses[size]} ${className}`}
      style={
        {
          '--uib-size': size === 'sm' ? '24px' : size === 'md' ? '40px' : '56px',
        } as React.CSSProperties
      }
    >
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/50 backdrop-blur-sm animate-fade-in">
        {loaderContent}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-6">{loaderContent}</div>;
};

export default Loader;
