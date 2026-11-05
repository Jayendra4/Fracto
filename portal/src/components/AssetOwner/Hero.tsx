import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useOnboarding } from '@/hooks';
import { IoShieldOutline } from 'react-icons/io5';
import { IoIosTrendingUp } from 'react-icons/io';
import { TbUserPin } from 'react-icons/tb';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { HiArrowLongRight } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const featureVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function AssetHero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );
  const { needsOnboarding, isCompany, hasDirectors } = useOnboarding();
  const isUserKycCompleted = !isCompany && hasDirectors;

  const features = [
    {
      icon: <IoShieldOutline className="h-6 w-6" />,
      title: 'Trustee Governed',
      subtitle: 'Regulated Framework',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: <IoIosTrendingUp className="h-6 w-6" />,
      title: 'Unlock Liquidity',
      subtitle: 'Access Capital Fast',
      gradient: 'from-indigo-500/20 to-purple-500/20',
    },
    {
      icon: <TbUserPin className="h-6 w-6" />,
      title: 'Global Reach',
      subtitle: 'Verified Investor',
      gradient: 'from-blue-600/20 to-blue-400/20',
    },
  ];

  return (
    <section
      className={`relative overflow-hidden bg-[var(--bg)] font-work px-4 lg:px-10 transition-colors duration-500 ${
        !isAuthenticated
          ? 'pt-32 md:pt-40 pb-20'
          : isUserKycCompleted
            ? 'pt-32 pb-16'
            : needsOnboarding
              ? 'pt-44 md:pt-52 pb-20'
              : 'pt-32 lg:pt-44 pb-20'
      }`}
    >
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="mx-auto max-w-[1600px] relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <motion.div
            className="lg:col-span-12 xl:col-span-7"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-[var(--fg)] tracking-tight"
            >
              Asset Owners at <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A76C0] to-[#60A5FA]">
                Fracto
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-xl hidden md:text-2xl font-bold text-[var(--fg)]/90 leading-tight"
            >
              Unlock Value from Real-World Assets{' '}
              <br className="hidden sm:block" />
              Through{' '}
              <span className="text-[#3A76C0]">Fractional Ownership</span>
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-base md:text-lg text-[var(--fg)]/70 leading-relaxed font-normal"
            >
              Fracto provides a structured, professionally governed
              platform for asset owners who wish to unlock the latent value
              within their real-world assets. Whether you are an individual
              property owner, a developer with a live or upcoming project, a
              commercial property holder, or an institution managing a portfolio
              of income-generating assets, Fracto offers a clear,
              compliant, and Investor-ready pathway to access capital without
              requiring a full outright sale.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-wrap gap-5"
            >
              <button
                // to={`${isAuthenticated ? '/properties' : '/login'}`}
                onClick={() =>
                  navigate(isAuthenticated ? '/primary-club' : '/login')
                }
                className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110"
              >
                Begin The Journey
                <span className="transition-transform group-hover:translate-x-1">
                  <HiArrowLongRight size={24} />
                </span>
              </button>

              {/* <Link
                to="/about-us"
                className="px-8 py-4 rounded-xl border-2 border-[var(--fg)]/10 text-[var(--fg)] text-lg font-bold hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all text-center"
              >
                Learn More
              </Link> */}
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-12 xl:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative overflow-hidden rounded-[1.5rem] border-4 border-[var(--card)] shadow-2xl">
                <img
                  src="/images/asset-owner/asset-owner-hero.png"
                  alt="Modern commercial building"
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[3s] max-h-[350px]"
                />
              </div>

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-6 left-1 sm:-left-6 bg-[var(--card)] backdrop-blur-md border border-[var(--fg)]/10 p-2 sm:p-5 rounded-2xl shadow-xl flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <IoShieldOutline size={28} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--fg)] opacity-70">
                    Security status
                  </p>
                  <p className="font-bold text-[var(--fg)]">Trustee Verified</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature Bar */}
        <div className="mt-20 lg:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={featureVariants}
              className="group relative p-6 rounded-[1.5rem] bg-[var(--card)] border border-[var(--fg)]/10 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3A76C0] to-[#60A5FA] flex items-center justify-center text-white shadow-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--fg)] group-hover:text-[#3A76C0] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--fg)]/60">
                    {feature.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
