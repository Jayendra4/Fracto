import React from 'react';
import Skeleton from './index';

const PropertyCardSkeleton: React.FC = () => {
    return (
        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--fg)]/10 h-full space-y-4">
            {/* Image Placeholder */}
            <Skeleton className="w-full h-[220px] rounded-xl" />

            <div className="space-y-3">
                {/* Location Placeholder */}
                <div className="flex gap-2">
                    <Skeleton className="w-4 h-4" variant="circle" />
                    <Skeleton className="w-1/3 h-4" />
                </div>

                {/* Title Placeholder */}
                <Skeleton className="w-3/4 h-8" />

                {/* Stats Grid Placeholder */}
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-[var(--fg)]/10">
                    <div className="space-y-2 flex flex-col items-center">
                        <Skeleton className="w-1/2 h-3" />
                        <Skeleton className="w-3/4 h-6" />
                    </div>
                    <div className="space-y-2 flex flex-col items-center">
                        <Skeleton className="w-1/2 h-3" />
                        <Skeleton className="w-3/4 h-6" />
                    </div>
                    <div className="space-y-2 flex flex-col items-center">
                        <Skeleton className="w-1/2 h-3" />
                        <Skeleton className="w-3/4 h-6" />
                    </div>
                </div>

                {/* Button Placeholder */}
                <Skeleton className="w-full h-12" />
            </div>
        </div>
    );
};

export default PropertyCardSkeleton;
