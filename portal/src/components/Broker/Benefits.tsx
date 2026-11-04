import {
  FaCoins,
  FaGlobe,
  FaHandshake,
  FaChartPie,
  FaUserShield,
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
    title: 'Lucrative Commissions',
    description:
      'Earn competitive commissions for every successful property structural ownership facilitated and Investor onboarded through a transparent, performance-linked model.',
    icon: FaCoins,
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  {
    title: 'Global Connectivity',
    description:
      'Connect global capital with high-value, income-generating real estate assets and introduce Investors to premium opportunities.',
    icon: FaGlobe,
    gradient: 'from-indigo-500/20 to-indigo-600/20',
  },
  {
    title: 'Strategic Partnerships',
    description:
      'Build long-term relationships with verified asset owners, institutional Investors, and professional intermediaries.',
    icon: FaHandshake,
    gradient: 'from-cyan-500/20 to-cyan-600/20',
  },
  {
    title: 'Advanced Analytics',
    description:
      'Access real-time dashboards to track leads, commission payouts, property performance, and referral conversion metrics.',
    icon: FaChartPie,
    gradient: 'from-blue-600/20 to-indigo-600/20',
  },
  {
    title: 'Trustee Verification',
    description:
      'Operate within a trustee-governed, compliance-monitored framework that verifies assets, Investors, and transactions.',
    icon: FaUserShield,
    gradient: 'from-purple-500/20 to-purple-600/20',
  },
  {
    title: 'Digital Portal',
    description:
      'Manage leads, asset onboarding, Investor referrals, commission tracking, and compliance monitoring through a single digital portal.',
    icon: FaCogs,
    gradient: 'from-blue-400/20 to-blue-500/20',
  },
];

export default function Benefits() {
  return (
    <section className="w-full bg-[var(--bg)] py-20 lg:py-32 px-4 lg:px-10 transition-colors">
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
            Channel Partner <span className="text-[#3A76C0]">Benefits</span>
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-6 rounded-full" />
          <motion.p
            variants={fadeUp}
            className="mt-8 text-xl md:text-2xl text-[var(--fg)]/70 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Unlock unparalleled opportunities in the world of structural real
            estate ownership backed by blockchain transparency.
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
                className="group relative rounded-[2.5rem] bg-[var(--card)] p-10 lg:p-12 border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${benefit.gradient} blur-3xl rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3A76C0]/10 text-[#3A76C0] group-hover:bg-[#3A76C0] group-hover:text-white transition-all duration-500 shadow-sm transform group-hover:scale-110 group-hover:-rotate-3">
                    <Icon size={32} />
                  </div>

                  <h3 className="mb-4 text-2xl font-bold tracking-tight text-[var(--fg)] transition-colors duration-500 group-hover:text-[#3A76C0]">
                    {benefit.title}
                  </h3>

                  <p className="text-lg text-[var(--fg)]/70 leading-relaxed transition-colors duration-500 group-hover:text-[var(--fg)]/90">
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
