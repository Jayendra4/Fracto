import { CiCircleCheck } from 'react-icons/ci';
import { FaUser, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function WhoIsAssetOwner() {
  return (
    <section className="w-full bg-[var(--bg)] py-10 lg:py-32 font-work px-4 lg:px-10 transition-colors">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-[var(--fg)] tracking-tight"
          >
            Who Can List Assets on{' '}
            <span className="text-[#4F46E5]">Fracto</span>
          </motion.h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] mx-auto mt-6 rounded-full" />
          <motion.p
            variants={fadeUp}
            className="mt-6 text-base md:text-lg text-[var(--fg)]/70 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Fracto supports every type of asset owner with structured
            participation frameworks, compliance-led onboarding, and
            professional digital tools.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Individual Card */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            className="group relative rounded-[2.5rem] bg-[var(--card)] p-10 lg:p-12 text-left border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#4F46E5] to-[#2563EB]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full" />

            <div className="relative z-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F46E5]/10 text-[#4F46E5] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FaUser size={24} />
              </div>

              <h3 className="mb-3 text-xl lg:text-2xl font-bold tracking-tight text-[var(--fg)]">
                Individual Owners
              </h3>
              <p className="mb-6 text-base lg:text-base text-[var(--fg)]/70 leading-relaxed">
                Private Investors and individual property owners who wish to
                unlock value from their real estate holdings through a
                structured participation framework. Fracto supports
                individual owners with streamlined KYC verification, personal
                asset management tools, direct Investor engagement, and a
                professionally managed digital profile for their asset.
              </p>

              <ul className="space-y-4">
                {[
                  'Personal property structuring support',
                  'Streamlined KYC verification and onboarding',
                  'Individual wealth and asset management framework',
                  'Direct Investor discovery and engagement',
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[var(--fg)]/80 text-base lg:text-base"
                  >
                    <div className="flex-shrink-0 text-[#4F46E5]">
                      <CiCircleCheck size={20} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Corporate Card */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            className="group relative rounded-[2.5rem] bg-[var(--card)] p-10 lg:p-12 text-left border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#60A5FA] to-[#4F46E5]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full" />

            <div className="relative z-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F46E5]/10 text-[#4F46E5] transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                <FaBuilding size={24} />
              </div>

              <h3 className="mb-3 text-xl lg:text-2xl font-bold tracking-tight text-[var(--fg)]">
                Companies and Institutions
              </h3>
              <p className="mb-6 text-base lg:text-base text-[var(--fg)]/70 leading-relaxed">
                Corporates, funds, and institutional entities seeking to
                structure co-ownership of commercial real estate portfolios and
                access capital from a verified network of Investors. House of
                Frac provides institutional-grade tools for asset documentation,
                enhanced KYB due diligence, portfolio-level management, and
                access to institutional Investor networks.
              </p>

              <ul className="space-y-4">
                {[
                  'Commercial asset structural ownership support',
                  'Enhanced KYB due diligence and compliance framework',
                  'Portfolio-level management and reporting tools',
                  'Institutional Investor access and discovery',
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[var(--fg)]/80 text-base lg:text-base"
                  >
                    <div className="flex-shrink-0 text-[#4F46E5]">
                      <CiCircleCheck size={20} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
