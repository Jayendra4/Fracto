import { HiArrowLongRight } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useOnboarding } from '@/hooks';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' as const },
  },
};

const imageReveal = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.2, ease: 'easeOut' as const },
  },
};

export default function Hero() {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );
  const { needsOnboarding, isCompany, hasDirectors } = useOnboarding();
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';
  const isUserKycCompleted = !isCompany && hasDirectors;
  const navigate = useNavigate();
  const path = isAuthenticated ? '/primary-club' : '/login';
  // const path = isAuthenticated ? '/properties' : '/login';
  return (
    <section
      className={`relative overflow-hidden bg-[var(--bg)] font-work px-4 lg:px-10 transition-colors duration-500 ${
        !isAuthenticated
          ? 'pt-24 md:pt-32'
          : isUserKycCompleted
            ? 'pt-24'
            : needsOnboarding
              ? 'md:pt-50 pt-42'
              : 'pt-25 lg:pt-40'
      }`}
    >
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="pointer-events-none absolute inset-0 flex justify-end opacity-20 dark:opacity-40 pr-10">
        <img
          src="/images/corporateInvestor/logo.svg"
          alt=""
          className={`h-full object-contain object-right transform scale-110 ${!isDark ? 'invert' : ''}`}
        />
      </div>

      <div className="relative mx-auto max-w-[1600px] pb-10 lg:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 lg:gap-12">
          <motion.div
            className="text-[var(--fg)] max-w-xl pb-10 relative z-10"
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Institutional Access
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl lg:text-5xl font-bold leading-[1.1]"
              variants={fadeUp}
            >
              Own Real Estate.
              <br />
              {/* {' '} */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#2563EB]">
                Differently.
              </span>
            </motion.h2>

            <motion.p
              className="mt-6 font-20 font-medium text-[var(--fg)]/90 leading-relaxed"
              variants={fadeUp}
            >
              Fracto enables Investors to access curated real estate
              opportunities through a transparent, professionally managed,
              compliance-first investment platform.
            </motion.p>

            <motion.p
              className="mt-6 font-16 text-[var(--fg)]/70 leading-relaxed max-w-lg"
              variants={fadeUp}
            >
              Instead of acquiring entire properties, Investors can participate
              in structured real estate opportunities where economic rights,
              participation, and returns are offered in accessible formats,
              subject to legal documentation.
            </motion.p>

            <motion.button
              variants={fadeUp}
              className="group mt-10 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] px-6 py-3 font-16 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 cursor-pointer"
              onClick={() => navigate(path)}
            >
              Invest Now
              <span className="transition-transform group-hover:translate-x-1">
                <HiArrowLongRight size={20} />
              </span>
            </motion.button>
          </motion.div>

          <div className="relative h-[400px] sm:h-[450px] lg:h-[600px] w-full flex items-center justify-center">
            {/* Abstract Shape behind images */}
            <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-[60px] rotate-6 transform-gpu scale-90 blur-xl items-center justify-center flex">
              <div className="w-1/2 h-1/2 border border-blue-500/20 rounded-full animate-ping" />
            </div>

            <motion.div
              className="absolute left-4 top-0 lg:left-0 rounded-[40px] lg:rounded-[48px] overflow-hidden shadow-2xl z-20 border-4 border-[var(--bg)]"
              variants={imageReveal}
              initial="hidden"
              animate="visible"
            >
              <img
                src="/images/corporateInvestor/hero1.png"
                alt="Premium building"
                className="h-full w-full max-h-[220px] max-w-[220px] lg:max-h-[340px] lg:max-w-[340px] object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>

            <motion.div
              className="absolute right-4 bottom-0 lg:right-0 rounded-[40px] lg:rounded-[48px] overflow-hidden shadow-2xl z-10 border-4 border-[var(--bg)]"
              initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                transition: {
                  delay: 0.3,
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              viewport={{ once: true }}
            >
              <img
                src="/images/corporateInvestor/hero2.png"
                alt="Luxury towers"
                className="h-full w-full max-h-[220px] max-w-[220px] lg:max-h-[340px] lg:max-w-[340px] object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
