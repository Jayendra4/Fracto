import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlinePresentationChartLine,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const capabilities = [
  {
    title: 'Institutional Lead Management',
    description:
      'Access a sophisticated CRM specialized for high-value real estate transactions and global Investors  tracking.',
    icon: HiOutlineUserGroup,
    gradient: 'from-blue-500/10 to-indigo-500/10',
  },
  {
    title: 'Asset Onboarding Engine',
    description:
      'Streamlined tools to submit property assets, legal documents, and valuation reports directly for trustee review.',
    icon: HiOutlineBuildingOffice2,
    gradient: 'from-indigo-500/10 to-purple-500/10',
  },
  {
    title: 'Performance Dashboards',
    description:
      'Real-time analytics on referral growth, conversion rates, and detailed commission settlement reports.',
    icon: HiOutlinePresentationChartLine,
    gradient: 'from-cyan-500/10 to-blue-500/10',
  },
  {
    title: 'Partner Verification',
    description:
      'Operate as a verified entity within our ecosystem, backed by institutional-grade KYC/KYB oversight.',
    icon: HiOutlineShieldCheck,
    gradient: 'from-blue-600/10 to-blue-400/10',
  },
];

export default function Capabilities() {
  return (
    <section className="w-full bg-[var(--bg)] py-16 lg:py-24 px-4 lg:px-10 transition-colors overflow-hidden font-work">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-10"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--fg)]">
                Unparalleled <br />
                <span className="text-[#4F46E5]">Partner Capabilities</span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] mt-6 rounded-full" />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-[var(--fg)]/60 leading-relaxed font-medium"
            >
              We provide the institutional-grade toolkit required to manage,
              scale, and succeed in the world of property structural
              co-ownership.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group p-6 rounded-[2rem] bg-[var(--card)] border border-[var(--fg)]/10 hover:border-[#4F46E5]/30 transition-all duration-300"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white transition-all duration-500`}
                  >
                    <cap.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--fg)] mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-[var(--fg)]/50 leading-relaxed">
                    {cap.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-20 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative overflow-hidden rounded-[3rem] shadow-2xl border-4 border-[var(--card)] p-2 bg-[var(--card)]">
              <div className="overflow-hidden rounded-[2.5rem]">
                <img
                  src="/images/broker/security.png"
                  alt="Capabilities interface"
                  className="w-full h-auto transform hover:scale-105 transition-transform duration-[5s]"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--bg)]/40 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
