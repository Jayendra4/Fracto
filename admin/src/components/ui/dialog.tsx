import * as React from 'react';
import { cn } from '@/utils';

interface DialogContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error('DialogTrigger must be used inside Dialog');

  return (
    <div onClick={() => ctx.setOpen(true)} className="inline-block">
      {children}
    </div>
  );
}

export function DialogContent({
  children,
  className,
  preventCloseOnOutsideClick,
}: {
  children: React.ReactNode;
  className?: string;
  preventCloseOnOutsideClick?: boolean;
}) {
  const ctx = React.useContext(DialogContext);
  if (!ctx || !ctx.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          if (!preventCloseOnOutsideClick) {
            ctx.setOpen(false);
          }
        }}
      />

      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg animate-scale-in ',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 space-y-1">{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
}

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
      {children}
    </div>
  );
}
