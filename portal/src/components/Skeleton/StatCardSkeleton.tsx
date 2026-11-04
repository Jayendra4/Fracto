import React from 'react';
import Skeleton from './index';

const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--fg)]/10 h-full flex flex-col justify-between space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-6 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-1/2 h-4" />
        <Skeleton className="w-3/4 h-10" />
      </div>
    </div>
  );
};

export default StatCardSkeleton;
