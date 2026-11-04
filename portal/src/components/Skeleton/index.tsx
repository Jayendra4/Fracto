import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rect' | 'circle' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseStyles = 'animate-pulse bg-gray-200/20 dark:bg-gray-700/20';
    const variantStyles = {
        rect: 'rounded-md',
        circle: 'rounded-full',
        text: 'rounded h-4 w-full',
    };

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} />
    );
};

export default Skeleton;
