import { useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import { useRef } from 'react';

export function CountUp({
  prefix,
  value,
  suffix = '',
}: {
  prefix?: string;
  value: number;
  suffix?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const shouldReduceMotion = useReducedMotion();

  const motionValue = useMotionValue(0);

  const rounded = useTransform(motionValue, (latest) =>
    value % 1 === 0 ? Math.round(latest).toLocaleString() : latest.toFixed(1)
  );

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(motionValue, value, {
      duration: shouldReduceMotion ? 0 : 1.4,
      ease: 'easeOut',
    });

    return controls.stop;
  }, [isInView, value, motionValue, shouldReduceMotion]);

  return (
    <motion.span ref={ref}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  );
}

type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

const stats: Stat[] = [
  { value: 5, suffix: 'Cr+', label: 'Assets Facilitated' },
  { value: 50000, suffix: '+', label: 'Registered & Verified Users' },
  { value: 11000, suffix: '+', label: 'Listed Asset Opportunities' },
  { value: 4.5, suffix: '', label: 'Platform Rating' },
];

export default function BottomCard() {
  return (
    <section className="relative w-full bg-[var(--bg)] text-[var(--fg)] font-work">
      <div className="absolute inset-0 backdrop-blur-md" />

      <motion.div
        className="absolute inset-0 backdrop-blur-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.4 }}
      />

      <div className="relative z-10 py-4 shadow-[0_4px_15px_2px_rgba(0,0,0,0.25)]">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((item, i) => (
              <div
                key={item.label}
                className="relative flex flex-col items-center justify-center text-center py-6"
              >
                {i !== stats.length - 1 && (
                  <span className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-full w-px bg-[var(--fg)]/70" />
                )}

                {(i === 0 || i === 1) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] h-px bg-[var(--fg)]/70 lg:hidden" />
                )}

                <h3 className="font-30 lg:text-[30px] font-semibold ">
                  <CountUp value={item.value} suffix={item.suffix} />
                </h3>

                <p className="mt-1 font-20 lg:text-[18px] text-[var(--fg)]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
