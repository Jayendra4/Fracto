import { FiCheckCircle } from 'react-icons/fi';
import { HiOutlineBell, HiOutlineBellAlert } from 'react-icons/hi2';
import { motion, useAnimation } from 'framer-motion';
import type { AppNotification } from './NotificationModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

export default function NotificationItem({
  data,
  onMarkRead,
}: {
  data: AppNotification;
  onMarkRead: () => void;
}) {
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const controls = useAnimation();
  const [animating, setAnimating] = useState(false);

  const handleMarkRead = async () => {
    if (animating) return;
    setAnimating(true);

    await controls.start({
      x: -18,
      transition: { duration: 0.12, ease: 'easeOut' },
    });

    await controls.start({
      x: 0,
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 18,
      },
    });

    await controls.start({
      scale: 1,
      transition: { duration: 0.12 },
    });

    onMarkRead();
    setAnimating(false);
  };

  return (
    <motion.div
      layout
      animate={controls}
      exit={{
        opacity: 0,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      }}
      className={`
        relative rounded-2xl border transition-all duration-300 group
        flex sm:flex-row flex-col items-start sm:items-center justify-between
        text-[var(--fg)] font-work overflow-hidden
        ${
          data.isRead
            ? `bg-[var(--card)] shadow-sm ${isDark ? 'border-white/5' : 'border-slate-200'}`
            : isDark
              ? 'bg-[#1e293b]/60 border-blue-500/30 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
              : 'bg-[var(--card)] border-blue-200 shadow-[0_4px_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-50'
        }
      `}
    >
      {/* Unread Glowing Dot Indicator */}
      {!data.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-2xl shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
      )}
      {data.isRead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-green-500 pointer-events-none"
        />
      )}

      {animating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.18, 0] }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-green-500 pointer-events-none"
        />
      )}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 sm:p-5 w-full pl-6">
        <div
          className={`
          flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors
          ${
            data.isRead
              ? `bg-[var(--inner-card)] border ${isDark ? 'border-white/5' : 'border-slate-200'}`
              : isDark
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'bg-blue-50 border border-blue-200 shadow-inner'
          }
        `}
        >
          {data.isRead ? (
            <HiOutlineBell
              className={`w-6 h-6 ${isDark ? 'text-[var(--fg)]/50' : 'text-slate-400'}`}
            />
          ) : (
            <HiOutlineBellAlert className="w-6 h-6 text-blue-500" />
          )}
        </div>

        <div className="flex-1">
          <h4
            onClick={() => {
              if (data.path) navigate(data.path);
            }}
            className={`font-medium font-16 tracking-wide leading-tight mb-1 ${data.path ? 'cursor-pointer hover:underline' : ''} ${!data.isRead ? (isDark ? 'text-blue-100' : 'text-blue-900') : 'text-[var(--fg)]'}`}
          >
            {data.title}
          </h4>
          <p className="font-14 text-[var(--fg)]/60 leading-relaxed">
            {data.description}
          </p>
        </div>
      </div>
      {!data.isRead && (
        <div className="sm:pr-5 pr-4 pb-4 sm:pb-0 self-end sm:self-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            disabled={animating}
            onClick={handleMarkRead}
            title="Mark as Read"
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              transition-colors duration-300
              ${animating ? 'bg-green-500/20 text-green-400' : 'bg-[var(--inner-card)] border border-white/5 text-[var(--fg)]/40 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10'}
            `}
          >
            <motion.span
              animate={{
                rotate: animating ? 360 : 0,
                scale: animating ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <FiCheckCircle size={18} />
            </motion.span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
