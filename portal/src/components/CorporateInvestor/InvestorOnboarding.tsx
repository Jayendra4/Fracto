import { motion } from 'framer-motion';
import {
  HiOutlineBuildingOffice2,
  HiOutlineIdentification,
  HiOutlineChartBarSquare,
  HiOutlineBanknotes,
} from 'react-icons/hi2';

const steps = [
  {
    title: 'Account Creation',
    description:
      'Investors create a verified account, provide identification and contact details, and gain access to explore investment opportunities. Account creation involves providing basic identification details, contact information, and creating a secure login profile.',
    icon: HiOutlineBuildingOffice2,
    gradient: 'from-[#3A76C0] to-[#60A5FA]',
  },
  {
    title: 'KYC Verification & Trustee Approval',
    description:
      'Investors must complete KYC verification by submitting required identification and compliance documents. Upon trustee-approved verification, accounts are activated for investment participation.',
    icon: HiOutlineIdentification,
    gradient: 'from-[#60A5FA] to-[#3A76C0]',
  },
  {
    title: 'Investment Capabilities (Post-Approval)',
    description:
      'After KYC approval, Investors can explore vetted opportunities, review asset details and documents, track holdings, and manage participation through a secure Investor dashboard.',
    icon: HiOutlineChartBarSquare,
    gradient: 'from-[#3A76C0] to-[#60A5FA]',
  },
  {
    title: 'Income & Exit Opportunities',
    description:
      'House of Frac provides asset performance updates, return distributions, and eligible exit options, enabling transparent participation through structured, compliant, and professionally managed investments.',
    icon: HiOutlineBanknotes,
    gradient: 'from-[#60A5FA] to-[#3A76C0]',
  },
];

export default function InvestorOnboarding() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)] text-[var(--fg)] font-work py-16 lg:py-24">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5 dark:opacity-10">
        <img
          src="/images/corporateInvestor/top.svg"
          alt=""
          className="absolute top-0 left-0 w-1/3"
        />
        <img
          src="/images/corporateInvestor/bottom.svg"
          alt=""
          className="absolute bottom-0 right-0 w-1/3"
        />
      </div>

      <div className="px-4 lg:px-10 relative z-10">
        <div className="mx-auto max-w-[1600px]">
          <motion.div
            className="text-center max-w-4xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-48 font-bold leading-tight">
              Investor Onboarding & <br className="hidden sm:block" />
              <span className="text-[#3A76C0]">Access Model</span>
            </h2>
            <p className="mt-6 font-20 text-[var(--fg)]/70 max-w-2xl mx-auto">
              A comprehensive institutional-grade onboarding process designed
              for security, efficiency, and full regulatory compliance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  className="group relative p-8 lg:p-10 rounded-[2.5rem] bg-[var(--card)] border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  {/* Hover Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                  />

                  <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                    >
                      <Icon size={32} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-4xl font-bold opacity-10 group-hover:opacity-20 transition-opacity">
                          0{index + 1}
                        </span>
                        <h3 className="font-24 font-bold tracking-tight">
                          {step.title}
                        </h3>
                      </div>
                      <p className="font-18 text-[var(--fg)]/70 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
