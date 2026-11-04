import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import { createPortal } from 'react-dom';

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
}

export default function CommonModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  contentClassName = 'p-6 pt-2',
  hideCloseButton = false,
}: CommonModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-work">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full bg-[var(--inner-card)] rounded-[24px] shadow-2xl border border-[var(--fg)]/10 ${!className?.includes('overflow-visible') ? 'overflow-hidden' : ''} max-h-[90vh] flex flex-col backdrop-blur-md ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || !hideCloseButton) && (
              <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                {title && (
                  <h2 className="text-xl font-semibold text-[var(--fg)]">
                    {title}
                  </h2>
                )}
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto text-[var(--fg)]/50 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-[var(--fg)]/5"
                  >
                    <RxCross1 size={20} />
                  </button>
                )}
              </div>
            )}
            <div
              className={`overflow-y-auto scrollbar-ui flex-1 ${contentClassName}`}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
