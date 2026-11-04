import {
  FaShieldAlt,
  FaFileAlt,
  FaGavel,
  FaChartLine,
  FaCoins,
  FaLayerGroup,
  FaPercentage,
  FaUsers,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

type ProgressItemProps = {
  label: string;
  value: number;
  icon: React.ElementType;
  color?: string;
};

function ProgressItem({
  label,
  value,
  icon: Icon,
  color = 'bg-yellow-400',
}: ProgressItemProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[var(--fg)]/80">
          <Icon className="h-5 w-5 text-[#3A76C0]" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="font-bold text-[var(--fg)]">{value}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-[var(--fg)]/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function AssetReviewFraction() {
  return (
    <section className="w-full bg-[var(--bg)] py-10 lg:py-32 px-4 lg:px-10 transition-colors">
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold text-[var(--fg)] tracking-tight"
          >
            Asset Review and{' '}
            <span className="text-[#3A76C0]">Structural Co-ownership</span>
          </motion.h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-6 rounded-full" />
          <motion.p
            variants={fadeUp}
            className="mt-8 text-lg md:text-xl text-[var(--fg)]/70 max-w-3xl mx-auto leading-relaxed font-semibold opacity-80"
          >
            Every asset undergoes rigorous structured verification before
            Structural Co-ownership, ensuring Investor protection and regulatory
            compliance.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[2.5rem] bg-[var(--card)] p-10 lg:p-14 border border-[var(--fg)]/10 shadow-xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#3A76C0]/10 flex items-center justify-center text-[#3A76C0]">
                  <FaShieldAlt size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--fg)]">
                    Trustee Governed
                  </h3>
                  <p className="text-lg text-[var(--fg)]/50">
                    Real-time compliance monitoring
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <ProgressItem
                  label="Document Verification"
                  value={100}
                  icon={FaFileAlt}
                  color="bg-green-500"
                />
                <ProgressItem
                  label="Legal Review"
                  value={100}
                  icon={FaGavel}
                  color="bg-green-500"
                />
                <ProgressItem
                  label="Valuation Assessment"
                  value={75}
                  icon={FaChartLine}
                  color="bg-blue-500"
                />
                <ProgressItem
                  label="Co - Ownership"
                  value={25}
                  icon={FaCoins}
                  color="bg-indigo-500"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[2.5rem] bg-[var(--card)] p-10 lg:p-14 border border-[var(--fg)]/10 shadow-xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#3A76C0]/10 flex items-center justify-center text-[#3A76C0]">
                  <FaLayerGroup size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--fg)]">
                    Structural Co-ownership Status
                  </h3>
                  <p className="text-lg text-[var(--fg)]/50">
                    Real-time asset readiness status
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-[var(--fg)]/5 rounded-2xl border border-[var(--fg)]/5">
                  <div className="flex items-center gap-3 text-[var(--fg)]/80 text-lg">
                    <FaCoins className="text-[#3A76C0]" />
                    <span>Total Structural Co-ownership</span>
                  </div>
                  <span className="text-2xl font-bold text-[var(--fg)]">
                    10,000
                  </span>
                </div>

                <div className="flex items-center justify-between p-6 bg-[var(--fg)]/5 rounded-2xl border border-[var(--fg)]/5">
                  <div className="flex items-center gap-3 text-[var(--fg)]/80 text-lg">
                    <FaPercentage className="text-[#3A76C0]" />
                    <span>Available Structural Co-ownership</span>
                  </div>
                  <span className="text-2xl font-bold text-[var(--fg)]">
                    10,000
                  </span>
                </div>

                <div className="flex items-center justify-between p-6 bg-[var(--fg)]/5 rounded-2xl border border-[var(--fg)]/5">
                  <div className="flex items-center gap-3 text-[var(--fg)]/80 text-lg">
                    <FaUsers className="text-[#3A76C0]" />
                    <span>Investor Interest</span>
                  </div>
                  <span className="text-2xl font-bold text-[var(--fg)] text-green-500">
                    Active
                  </span>
                </div>

                <div className="p-6 bg-[var(--fg)]/5 rounded-2xl border border-[var(--fg)]/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg text-[var(--fg)]/80">
                      Subscription Status
                    </span>
                    <span className="text-xl font-bold text-[var(--fg)]">
                      55%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[var(--fg)]/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '55%' }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#3A76C0] to-[#60A5FA]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
