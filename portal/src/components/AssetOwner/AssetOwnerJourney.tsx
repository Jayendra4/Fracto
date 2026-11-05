import {
  FaUserPlus,
  FaIdCard,
  FaFileAlt,
  FaGavel,
  FaCubes,
  FaCheckCircle,
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

type Step = {
  step: string;
  title: string;
  description: string;
  icon: React.ElementType;
  side: 'left' | 'right';
};

const steps: Step[] = [
  {
    step: '01',
    title: 'Account Creation',
    description:
      'Asset owners begin by registering on the Fracto platform with their basic business or personal information. The platform uses secure multi-factor authentication to protect all accounts from the moment of creation. Once registered, asset owners can access the platform, review available resources, and initiate their asset onboarding journey.',
    icon: FaUserPlus,
    side: 'left',
  },
  {
    step: '02',
    title: 'KYC/KYB Verification',
    description:
      'All asset owners are required to complete a thorough identity and business verification process before their assets can be listed. Individual asset owners complete KYC verification, while corporate entities and institutions undergo KYB verification, which includes business registration documents, directors identification, ownership structure, and other compliance documentation. This institutional-grade verification ensures that every asset owner on the platform is credible, legally compliant, and trustworthy.',
    icon: FaIdCard,
    side: 'right',
  },
  {
    step: '03',
    title: 'Asset Submission',
    description:
      'Once verified, asset owners can submit their assets for review. This involves providing comprehensive property details, legal ownership documentation, independent valuation reports, financial projections, and any other relevant information that Investors would need to make an informed decision. The submission process is guided by the Fracto team to ensure completeness and quality of documentation.',
    icon: FaFileAlt,
    side: 'left',
  },
  {
    step: '04',
    title: 'Trustee Review',
    description:
      'Every asset submitted to the Fracto undergoes a rigorous review by an independent trustee before it is approved for listing. The trustee independently evaluates the assets legal standing, documentation quality, commercial viability, and overall eligibility for structured Investors participation. This independent review is a cornerstone of the Fracto framework, ensuring that only credible, well-documented assets are presented to Investors.',
    icon: FaGavel,
    side: 'right',
  },
  {
    step: '05',
    title: 'Structured Co-ownership',
    description:
      'Once the asset has cleared the trustee review, it is structured into a defined purchase option that can be offered to verified Investors on the platform. The Structured Co-ownership process follows a legally sound and commercially transparent framework, with all unit economics, participation rights, returns structures, and exit provisions clearly documented.',
    icon: FaCubes,
    side: 'left',
  },
  {
    step: '06',
    title: 'Launch & Participation',
    description:
      'With the asset live on the platform, Investors can discover, review, and express their interest in participating. Fracto manages the Investors communication, documentation flow, and participation confirmation process, enabling asset owners to access capital efficiently while maintaining a professional Investors-facing experience.',
    icon: FaCheckCircle,
    side: 'right',
  },
];

export default function AssetOwnerJourney() {
  return (
    <section className="w-full bg-[var(--bg)] py-10 lg:py-32 px-4 lg:px-10 transition-colors overflow-hidden">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-24 lg:mb-32"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-[var(--fg)] tracking-tight"
          >
            The <span className="text-[#3A76C0]">Asset Owner</span> Journey
          </motion.h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-6 rounded-full" />
          <motion.p
            variants={fadeUp}
            className="mt-6 text-base md:text-lg text-[var(--fg)]/70 max-w-3xl mx-auto leading-relaxed font-semibold opacity-80"
          >
            Fracto has designed a seamless, institutionally governed path
            from initial registration to live asset participation. Every stage
            of the journey is supported by our trustee framework, ensuring that
            both asset owners and Investors operate within a legally sound and
            professionally managed ecosystem.
          </motion.p>
        </motion.div>

        <div className="relative mt-20">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#3A76C0] via-blue-400 to-[#3A76C0] opacity-20 hidden lg:block" />

          <div className="space-y-12 md:space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLeft = step.side === 'left';

              return (
                <div key={step.step} className="relative flex w-full">
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`flex w-full items-center ${isLeft ? 'justify-start lg:pr-1/2' : 'justify-start lg:justify-end lg:pl-1/2'}`}
                  >
                    <div
                      className={`relative w-full lg:max-w-[650px] ${isLeft ? 'lg:pr-16' : 'lg:pl-16'}`}
                    >
                      <div
                        className={`group relative p-6 lg:p-8 rounded-[1.5rem] bg-[var(--card)] border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500 font-work ${isLeft ? 'md:text-right border-r-4 border-[#3A76C0]' : 'md:text-left border-l-4 border-[#3A76C0]'}`}
                      >
                        <div
                          className={`flex items-center gap-4 mb-5 ${isLeft ? 'md:flex-row-reverse' : ''}`}
                        >
                          <span className="text-2xl font-bold text-[#3A76C0]/20">
                            0{index + 1}
                          </span>
                          <h3 className="text-lg lg:text-xl font-bold tracking-tight text-[var(--fg)]">
                            {step.title}
                          </h3>
                        </div>

                        <p className="text-sm lg:text-base text-[var(--fg)]/70 leading-relaxed font-medium">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Icon Node */}
                  <div className="absolute left-1/2 top-10 md:top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block z-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3A76C0] text-white shadow-xl shadow-blue-500/30 border-4 border-[var(--bg)]"
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
