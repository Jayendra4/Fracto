/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { motion } from 'framer-motion';
import { BsCheck2Circle, BsArrowRightShort, BsStars } from 'react-icons/bs';

export default function Congrats({
  title,
  highlightText,
  showNext,
  onNext,
}: any) {
  return (
    <div className="w-full relative overflow-hidden">
      {/* Celebratory Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center justify-center py-10 relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-full shadow-lg shadow-green-500/30">
            <BsCheck2Circle className="text-4xl text-white" />
          </div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-2 -right-2 text-yellow-400 text-xl"
          >
            <BsStars />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 px-6"
        >
          <div className="space-y-1.5">
            <h4 className="text-green-600 dark:text-green-400 font-bold tracking-widest uppercase text-[10px]">
              Success!
            </h4>
            <h2 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
              {title}
            </h2>
          </div>

          <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            <span className="text-green-600 dark:text-green-400 font-medium">
              {highlightText}
            </span>
            <br />
            You're moving fast! Let's get to the next step and finish your
            profile.
          </p>
        </motion.div>

        {showNext && onNext && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onNext}
            className="group mt-8 px-5 py-2.5 bg-[#1F4FE0] hover:bg-[#153eb2]
                       text-white font-12 font-semibold rounded-lg shadow-sm hover:shadow-md
                       transition-all duration-300
                       flex items-center gap-2 cursor-pointer"
          >
            <span>Continue to Next Step</span>
            <BsArrowRightShort className="text-lg group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
