import {
  FaCoins,
  FaGlobe,
  FaRegEye,
  FaBalanceScale,
  FaUserTie,
  FaCogs,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const benefits = [
  {
    title: 'Unlock Liquidity',
    description:
      'House of Frac enables asset owners to convert illiquid real estate holdings into structured investment opportunities, accessing capital without the requirement of a full outright sale. This approach allows asset owners to retain a meaningful stake in their asset while simultaneously unlocking liquidity from qualified Investors.',
    icon: FaCoins,
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  {
    title: 'Global Reach',
    description:
      'By listing on House of Frac, asset owners gain exposure to a growing network of verified Investors. The platforms structured discovery and digital presentation tools ensure that your asset reaches the right audience in a professional, compliance-governed environment.',
    icon: FaGlobe,
    gradient: 'from-indigo-500/20 to-indigo-600/20',
  },
  {
    title: 'Transparency',
    description:
      'Every aspect of the assets profile — from ownership documentation and valuation reports to financial projections and legal agreements — is managed within a transparent, auditable framework. This level of transparency builds Investors confidence and supports more efficient capital-raising outcomes.',
    icon: FaRegEye,
    gradient: 'from-cyan-500/20 to-cyan-600/20',
  },
  {
    title: 'Compliance',
    description:
      'House of Frac trustee-governed framework ensures that every asset listed on the platform meets institutional-grade regulatory compliance standards. Asset owners can operate with confidence knowing that their listing is backed by independent oversight and structured legal documentation.',
    icon: FaBalanceScale,
    gradient: 'from-blue-600/20 to-indigo-600/20',
  },
  {
    title: 'Dual-Role Advantage',
    description:
      'House of Frac recognises that many asset owners are also active Investors. The platform is designed to support dual-role participation, enabling the same user to function as an asset owner on one hand and a corporate Investors on the other. This flexibility is a unique feature of the House of Frac ecosystem.',
    icon: FaUserTie,
    gradient: 'from-purple-500/20 to-purple-600/20',
  },
  {
    title: 'Seamless Management',
    description:
      'A fully digital asset management suite enables asset owners to monitor leads, track Investors growth, manage documentation, and review financial performance in real time. The platform brings all these functions together into a unified, easy-to-navigate interface.',
    icon: FaCogs,
    gradient: 'from-blue-400/20 to-blue-500/20',
  },
];

export default function AssetOwnerBenefits() {
  return (
    <section className="w-full bg-[var(--bg)] py-10 lg:py-32 px-4 lg:px-10 transition-colors">
      <div className="mx-auto max-w-[1500px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-[var(--fg)] tracking-tight"
          >
            Benefits for <span className="text-[#3A76C0]">Asset Owners</span>
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-6 rounded-full" />
          <motion.p
            variants={fadeUp}
            className="mt-8 text-xl md:text-2xl text-[var(--fg)]/70 max-w-3xl mx-auto leading-relaxed"
          >
            Join a new era of real estate where traditional assets meet cutting
            edge blockchain technology for superior liquidity and management.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative rounded-[2rem] bg-[var(--card)] p-8 lg:p-10 border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${benefit.gradient} blur-3xl rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3A76C0]/10 text-[#3A76C0] group-hover:bg-[#3A76C0] group-hover:text-white transition-all duration-500 shadow-sm transform group-hover:scale-110 group-hover:-rotate-3">
                    <Icon size={28} />
                  </div>

                  <h3 className="mb-4 text-2xl font-bold tracking-tight text-[var(--fg)] group-hover:text-[#3A76C0] transition-colors duration-500">
                    {benefit.title}
                  </h3>

                  <p className="text-sm text-[var(--fg)]/70 leading-relaxed group-hover:text-[var(--fg)]/90 transition-colors duration-500">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
