import { motion } from 'framer-motion';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { MdOutlineVerifiedUser } from 'react-icons/md';
import { RiMoneyRupeeCircleLine } from 'react-icons/ri';

const items = [
  {
    icon: HiOutlineOfficeBuilding,
    title: 'SPV-Based Legal Structure',
    description:
      'Asset participation is facilitated through Special Purpose Vehicles -- private limited companies or LLPs -- that hold the underlying property. Investors participate by holding equity shares or units in the SPV, as governed by the Companies Act, 2013 or LLP Act, 2008. This structure provides well-defined rights, clear documentation, and legal separation between the platform and the asset.',
    accent: 'from-[#3A76C0]/20 to-[#60A5FA]/10',
    iconColor: 'text-[#60A5FA]',
  },
  {
    icon: MdOutlineVerifiedUser,
    title: 'PMLA & KYC Compliance',
    description:
      'All onboarding follows the Prevention of Money Laundering Act, 2002 guidelines. KYC is conducted through certified processes, and suspicious activity is reported as required by law.',
    accent: 'from-green-500/20 to-emerald-400/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: RiMoneyRupeeCircleLine,
    title: 'Income Tax Compliance',
    description:
      'All distributions are subject to applicable TDS deductions under the Income Tax Act, 1961. House of Frac provides detailed distribution statements to assist Investors with their tax filings.',
    accent: 'from-amber-500/20 to-yellow-400/10',
    iconColor: 'text-amber-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

// const cardVariants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
// };

export default function ComplianceSection() {
  return (
    <section className="bg-[var(--bg)] px-4 lg:px-10 py-20 font-work transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto text-[var(--fg)]">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="font-44 font-semibold"
          >
            How We Approach Compliance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="mt-4 font-20 text-[var(--fg)]/60 max-w-2xl mx-auto font-light"
          >
            House of Frac is built with a clear understanding of the regulatory
            environment governing structured real estate participation in India.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                // variants={cardVariants}
                className="relative bg-[var(--card)]/90 backdrop-blur-md rounded-[2rem] border border-[var(--fg)]/10 hover:border-[var(--fg)]/20 p-8 flex flex-col gap-5 overflow-hidden group transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]`}
                />

                <div
                  className={`w-12 h-12 rounded-xl bg-[var(--bg)]/60 flex items-center justify-center shrink-0 relative z-10 ${item.iconColor}`}
                >
                  <Icon size={26} />
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="font-24 font-semibold text-[var(--fg)]">
                    {item.title}
                  </h3>
                  <p className="font-16 text-[var(--fg)]/70 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
