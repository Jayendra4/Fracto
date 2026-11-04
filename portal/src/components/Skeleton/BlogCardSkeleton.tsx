import React from 'react';
import Skeleton from './index';

const BlogCardSkeleton: React.FC = () => {
    return (
        <div className="bg-[#E2E2E2] rounded-tr-3xl rounded-bl-3xl overflow-hidden h-full flex flex-col">
            {/* Image Placeholder */}
            <Skeleton className="w-full h-[240px]" />

            <div className="p-5 flex-1 space-y-4">
                {/* Date & Time Placeholder */}
                <div className="flex gap-4">
                    <Skeleton className="w-16 h-3" />
                    <Skeleton className="w-16 h-3" />
                </div>

                {/* Title Placeholder */}
                <Skeleton className="w-full h-8" />

                {/* Text Placeholder */}
                <div className="space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-2/3 h-4" />
                </div>
            </div>
        </div>
    );
};

export default BlogCardSkeleton;
