import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useOnboarding } from '@/hooks';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { HiArrowLongRight } from 'react-icons/hi2';
import {
  IoShieldOutline,
  IoTrendingUpOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function Hero() {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );
  const { needsOnboarding, isCompany, hasDirectors } = useOnboarding();
  const isUserKycCompleted = !isCompany && hasDirectors;

  const highlights = [
    { icon: <IoShieldOutline size={20} />, text: 'Authorized Partner' },
    { icon: <IoTrendingUpOutline size={20} />, text: 'Earn Commissions' },
    { icon: <IoPeopleOutline size={20} />, text: 'Global Network' },
  ];

  return (
    <section
      className={`relative overflow-hidden font-work bg-[var(--bg)] px-4 lg:px-10 transition-colors duration-500 ${
        !isAuthenticated
          ? 'pt-32 md:pt-40 pb-20'
          : isUserKycCompleted
            ? 'pt-32 pb-16'
            : needsOnboarding
              ? 'pt-44 md:pt-52 pb-20'
              : 'pt-32 lg:pt-44 pb-20'
      }`}
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="mx-auto max-w-[1600px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
          <motion.div
            className="lg:col-span-12 xl:col-span-7"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A76C0]/10 text-[#3A76C0] text-sm font-bold tracking-wide mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-[#3A76C0] animate-pulse" />
              CHANNEL PARTNER NETWORK
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] text-[var(--fg)] tracking-tight"
            >
              Drive Growth as a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A76C0] to-[#60A5FA]">
                Channel Partner
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg md:text-xl font-bold text-[var(--fg)]/90 leading-tight"
            >
              The Bridge Between{' '}
              <span className="text-[#3A76C0]">Investors</span> and{' '}
              <span className="text-[#3A76C0]">Premium Assets</span>
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-base md:text-lg text-[var(--fg)]/70 leading-relaxed"
            >
              Channel Partners connect verified Investors with quality assets,
              facilitating structural ownership opportunities while earning
              income through a compliant, professionally governed, and
              institutionally supported ecosystem.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-wrap gap-5"
            >
              <button
                // to={`${isAuthenticated ? '/properties' : '/login'}`}
                className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110"
              >
                Join The Network
                <span className="transition-transform group-hover:translate-x-1.5">
                  <HiArrowLongRight size={24} />
                </span>
              </button>

              {/* <button className="px-8 py-4 rounded-xl border-2 border-[var(--fg)]/10 text-[var(--fg)] text-lg font-bold hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all text-center">
                Explore Scale
              </button> */}
            </motion.div>

            <div className="mt-12 flex flex-wrap gap-6 border-t border-[var(--fg)]/5 pt-10">
              {highlights.map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={badgeVariants}
                  className="flex items-center gap-3 text-[var(--fg)]/60 font-medium"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--fg)]/10 flex items-center justify-center text-[#3A76C0] shadow-sm">
                    {item.icon}
                  </div>
                  <span className="text-[var(--fg)] opacity-90">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-12 xl:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="relative group">
              {/* Decorative Elements */}
              <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-[var(--card)] shadow-2xl p-1 bg-[var(--card)]">
                <div className="overflow-hidden rounded-[2rem]">
                  <img
                    src="/images/broker/hero.png"
                    alt="Channel Partner Connection"
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[4s]"
                  />
                </div>

                {/* Glassy Overlay for bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-[2px]" />
              </div>

              {/* Floating Commission Badge */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-8 right-1 lg:-right-8 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--fg)]/10 p-6 rounded-3xl shadow-2xl z-20 flex items-center gap-4"
              >
                <div className=" w-8 h-8 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <IoTrendingUpOutline size={32} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--fg)] opacity-70">
                    Earnings status
                  </p>
                  <p className="font-bold font-20 text-[var(--fg)]">Active</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
