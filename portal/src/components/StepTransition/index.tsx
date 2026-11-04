import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

export default function StepTransition({
  step,
  children,
}: {
  step: number;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
