import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  isFullPage?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isFullPage = true }) => {
  return (
    <div
      className={`${isFullPage
        ? 'min-h-screen bg-[var(--bg)]/90 backdrop-blur-xl fixed inset-0 z-[9999]'
        : 'h-full py-20 relative'
        } w-full flex flex-col justify-center items-center gap-8`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Glowing Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-[#3A76C0]/30 rounded-full"
        />

        {/* Pulsing Back Glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-20 h-20 md:w-28 md:h-28 bg-[#3A76C0]/10 blur-3xl rounded-full"
        />

        {/* The Rotating Logo */}
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 md:w-20 md:h-20 relative z-10"
        >
          <img
            src="/images/hof-logo2.png"
            alt="HOF"
            className="w-full h-full object-contain dark:invert-0 invert"
          />
        </motion.div>
      </div>

      {isFullPage && (
        <div className="flex flex-col items-center gap-3">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--fg)] font-bold tracking-[0.3em] uppercase text-[10px] md:text-sm opacity-60"
          >
            Loading
          </motion.p>
          <div className="w-48 h-[2px] bg-[var(--fg)]/5 rounded-full overflow-hidden">
            <motion.div
              animate={{ x: [-200, 200] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#3A76C0] to-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Loader;
