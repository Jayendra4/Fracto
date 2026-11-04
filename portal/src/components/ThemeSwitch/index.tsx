import { useDispatch, useSelector } from 'react-redux';
import { motion, type Transition } from 'framer-motion';
import type { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/modeSlice';

export default function ThemeSwitch() {
  const theme = useSelector((state: RootState) => state.mode.theme);
  const dispatch = useDispatch();
  const isDark = theme === 'dark';

  const spring: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 15
  };

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative w-10 h-10 xl:w-12 xl:h-12 md:flex items-center justify-center rounded-xl cursor-pointer
        transition-all duration-300 ease-in-out group shadow-sm border  hidden
        ${isDark
          ? 'bg-[#1e293b]/80 border-[var(--fg)]/10 hover:bg-[#1e293b]'
          : 'bg-white border-slate-200 hover:border-blue-100 hover:bg-slate-50'
        }
      `}
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{
          rotate: isDark ? 40 : 90,
          scale: isDark ? 1 : 1.1
        }}
        transition={spring}
        className={isDark ? "text-blue-200" : "text-amber-500"}
      >
        <mask id="moon-mask-desktop">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <motion.circle
            r="9"
            fill="black"
            initial={false}
            animate={{
              cx: isDark ? 17 : 30,
              cy: isDark ? 7 : 0,
            }}
            transition={spring}
          />
        </mask>

        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask="url(#moon-mask-desktop)"
          initial={false}
          animate={{
            r: isDark ? 9 : 5,
          }}
          transition={spring}
        />

        <motion.g
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1
          }}
          style={{ transformOrigin: 'center' }}
          transition={{ duration: 0.2 }}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </motion.g>
      </motion.svg>
    </button>
  );
}

export function ThemeSwitchMobile() {
  const theme = useSelector((state: RootState) => state.mode.theme);
  const dispatch = useDispatch();
  const isDark = theme === 'dark';

  const spring: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 15
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-4 border-t border-[var(--fg)]/10 mt-2">
      <div className="flex flex-col items-start leading-tight">
        <span className="text-sm font-semibold text-[var(--fg)] tracking-wide">
          Appearance
        </span>
        <span className="text-xs text-[var(--fg)]/50 font-medium">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>

      <button
        onClick={() => dispatch(toggleTheme())}
        title="Toggle Theme"
        className={`
          relative w-10 h-10 flex items-center justify-center rounded-xl
          transition-all duration-300 ease-in-out group shadow-sm border
          ${isDark
            ? 'bg-[#1e293b]/80 border-[var(--fg)]/10 active:bg-[#1e293b]'
            : 'bg-white border-slate-200 active:bg-slate-50'
          }
        `}
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            rotate: isDark ? 40 : 90,
            scale: isDark ? 1 : 1.1
          }}
          transition={spring}
          className={isDark ? "text-blue-200" : "text-amber-500"}
        >
          <mask id="moon-mask-mobile">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.circle
              r="9"
              fill="black"
              initial={false}
              animate={{
                cx: isDark ? 17 : 30,
                cy: isDark ? 7 : 0,
              }}
              transition={spring}
            />
          </mask>

          <motion.circle
            cx="12"
            cy="12"
            fill="currentColor"
            mask="url(#moon-mask-mobile)"
            initial={false}
            animate={{
              r: isDark ? 9 : 5,
            }}
            transition={spring}
          />

          <motion.g
            initial={false}
            animate={{
              opacity: isDark ? 0 : 1,
              scale: isDark ? 0.5 : 1
            }}
            style={{ transformOrigin: 'center' }}
            transition={{ duration: 0.2 }}
          >
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </motion.g>
        </motion.svg>
      </button>
    </div>
  );
}
