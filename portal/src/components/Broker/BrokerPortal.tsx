import { motion } from 'framer-motion';
import { CiCircleCheck } from 'react-icons/ci';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const cards = [
  {
    number: '01',
    title: 'Structuralize Existing Properties',
    description:
      'Channel Partners can promote listed properties, share referrals through integrated tracking tools, and facilitate secure Investor introductions using professional asset information and marketing resources.',
    points: [
      'Promote listed properties to global Investors ',
      'Seamless referral sharing via integrated tools',
      'Facilitate secure structural co-owner participation',
    ],
    gradient: 'from-blue-500/10 to-blue-600/10',
  },
  {
    number: '02',
    title: 'Onboarding New Properties',
    description:
      'Channel Partners connect asset owners with House of Frac, help onboard quality real estate assets, expand platform inventory, and earn compensation through the success-fee model.',
    points: [
      'Onboard institutional Asset Owners to the platform',
      'Negotiate commissions for successful asset introductions',
      'Asset listings undergo trustee approval for compliance and protection',
    ],
    gradient: 'from-indigo-500/10 to-indigo-600/10',
  },
  {
    number: '03',
    title: 'Global Investor Referral',
    description:
      'Channel Partners expand the Investor network through secure referral tracking, earning commissions on successful onboarding while monitoring referral performance in real time.',
    points: [
      'Secure referral tracking links',
      'Earn recurring onboarding commissions',
      'Real-time referral and conversion tracking',
    ],
    gradient: 'from-cyan-500/10 to-cyan-600/10',
  },
];

export default function BrokerPortal() {
  return (
    <section className="overflow-hidden bg-[var(--bg)] py-20 lg:py-32 font-work px-4 lg:px-10 transition-colors">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--fg)]"
          >
            Digital <span className="text-[#3A76C0]">Partner Portal</span>
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-6 rounded-full" />
          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-3xl mx-auto text-xl md:text-2xl text-[var(--fg)]/60 leading-relaxed font-medium"
          >
            House of Frac provides Channel Partners with an institutional-grade
            digital portal for lead generation, referrals, asset onboarding
            support, and commission management, enabling efficient and
            transparent operations.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative overflow-hidden rounded-[2.5rem] bg-[var(--card)] p-10 lg:p-12 border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              {/* Massive Backdrop Number */}
              <span className="pointer-events-none absolute -top-10 -right-5 text-[180px] font-bold text-[var(--fg)]/5 select-none leading-none group-hover:text-[#3A76C0]/10 transition-colors duration-500">
                {card.number}
              </span>

              <div className="relative z-10">
                <h3 className="mb-6 text-3xl font-bold tracking-tight text-[#3A76C0] leading-tight">
                  {card.title}
                </h3>

                <p className="mb-10 text-lg text-[var(--fg)]/70 font-medium">
                  {card.description}
                </p>

                <ul className="space-y-5">
                  {card.points.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 text-[var(--fg)]/60 text-lg leading-snug group-hover:text-[var(--fg)]/90 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1 text-[#3A76C0]">
                        <CiCircleCheck size={24} />
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Accent */}
              <div
                className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r ${card.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-500`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
