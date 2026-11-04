import * as React from 'react';
import { cn } from '@/utils';

export interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm \
         placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 \
         disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';

export { CustomSelect };
