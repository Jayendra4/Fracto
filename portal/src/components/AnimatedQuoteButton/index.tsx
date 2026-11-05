import type { RootState } from '@/redux/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const ArrowIcon = () => (
  <svg
    className="stroke-current w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M5 19L19 5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 5H19V19"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default function AnimatedQuoteButton({ title }: { title: string }) {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );
  const targetPath = isAuthenticated ? '/primary-club' : '/login';

  const [hovered, setHovered] = useState(false);
  const arrowVariants: Variants = {
    initial: { x: 0, y: 0, opacity: 1 },
    in: { x: -8, y: 8, opacity: 0 },
    out: { x: 8, y: -8, opacity: 0, transition: { duration: 0.18 } },
    enter: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
    },
  };
  return (
    <Link
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex items-center justify-center bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white rounded-full font-medium shadow-lg w-fit transition-all duration-300 cursor-pointer hover:brightness-110 active:scale-95"
      aria-label={title}
      to={targetPath}
    >
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mr-2">
        <span
          className="
            relative flex items-center justify-center rounded-full overflow-hidden bg-white/20 text-white transition-colors duration-300 group-hover:bg-white group-hover:text-[#4F46E5] w-9 h-9 sm:w-11 sm:h-11 md:w-16 md:h-16 "
        >
          <div className="relative flex items-center justify-center w-full h-full">
            <AnimatePresence initial={false} mode="wait">
              {!hovered ? (
                <motion.span
                  key="arrow-default"
                  variants={arrowVariants}
                  initial="initial"
                  animate="enter"
                  exit="out"
                  className="absolute flex items-center justify-center"
                >
                  <ArrowIcon />
                </motion.span>
              ) : (
                <motion.span
                  key="arrow-hover"
                  variants={arrowVariants}
                  initial="in"
                  animate="enter"
                  exit="out"
                  className="absolute flex items-center justify-center"
                >
                  <ArrowIcon />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </span>

        <span
          className="
            font-work font-medium text-white transition-colors duration-300 text-[14px] sm:text-[15px] md:text-[16px] xl:text-[25px] pl-2 pr-6"
        >
          {title}
        </span>
      </div>
    </Link>
  );
}
