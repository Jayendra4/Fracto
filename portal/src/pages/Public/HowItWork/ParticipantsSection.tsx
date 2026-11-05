type Participant = {
  title: string;
  description: string;
};

const participants: Participant[] = [
  {
    title: 'For Investors',
    description:
      'Access curated real estate participation opportunities that were once available only to large-ticket or institutional buyers. Diversify across asset types and geographies, review complete documentation before committing, and track your holdings through a dedicated digital dashboard.',
  },
  {
    title: 'For Asset Owners',
    description:
      'Structure your property and present it to a network of verified, qualified Investors — without an outright sale. Raise capital in a disciplined, documented manner while retaining operational control and defined rights over your asset.',
  },
  {
    title: 'For Channel Partners',
    description:
      'Expand your professional portfolio into structured real estate participation. Earn through a transparent, agreement-based commission model by onboarding Investors and quality assets. Benefit from partner training, marketing support, and a dedicated conversion dashboard.',
  },
  {
    title: 'For Trustees',
    description:
      'Play a critical, independent fiduciary role within the Fracto ecosystem. Monitor asset performance, oversee distribution processes, verify compliance with agreed documentation, and safeguard Investor interests — independently of both the platform and the asset owner.',
  },
];
import { motion } from 'framer-motion';

export default function ParticipantsSection() {
  return (
    <section className="bg-[var(--bg)] px-4 lg:px-10 overflow-hidden font-work transition-colors duration-300">
      <div className="w-full pt-20 pb-24 relative">
        <div className="absolute inset-0 bg-[url('/images/howitwork/participantbg.png')] bg-cover bg-center bg-no-repeat opacity-50 dark:opacity-100 mix-blend-overlay pointer-events-none"></div>
        <div className="mx-auto max-w-[1400px] text-[var(--fg)] relative z-10">
          <div className="text-center mb-16 overflow-hidden">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="font-44 font-semibold"
            >
              A Platform Built for Everyone
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="mt-4 font-20 text-[var(--fg)]/70 max-w-3xl mx-auto font-light"
            >
              Fracto is designed to serve every stakeholder in the
              structured real estate ecosystem — seamlessly and professionally.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Investors - Large Left Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 bg-[var(--card)]/90 backdrop-blur-md p-8 lg:p-12 rounded-[2rem] border border-[var(--fg)]/10 hover:border-[var(--fg)]/20 transition-all duration-500 group relative overflow-hidden flex flex-col justify-center min-h-[300px] shadow-sm"
            >
              <div className="absolute right-4 top-4 text-[120px] font-bold text-[var(--fg)]/[0.03] leading-none group-hover:text-[var(--fg)]/[0.05] transition-colors duration-500 pointer-events-none">
                01
              </div>
              <h3 className="font-36 font-semibold mb-4 text-[var(--fg)] relative z-10">
                {participants[0].title}
              </h3>
              <p className="font-18 text-[var(--fg)]/80 leading-relaxed max-w-xl relative z-10 font-light">
                {participants[0].description}
              </p>
            </motion.div>

            {/* Asset Owners - Top Right Card */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="lg:col-span-5 bg-[var(--card)]/90 backdrop-blur-md p-8 rounded-[2rem] border border-[var(--fg)]/5 hover:border-[var(--fg)]/20 transition-all duration-500 group relative overflow-hidden shadow-sm flex flex-col justify-center"
            >
              <div className="absolute right-4 bottom-4 text-[100px] font-bold text-[var(--fg)]/[0.02] leading-none group-hover:text-[var(--fg)]/[0.04] transition-colors duration-500 pointer-events-none">
                02
              </div>
              <h3 className="font-28 font-semibold mb-3 text-[var(--fg)] relative z-10">
                {participants[1].title}
              </h3>
              <p className="font-16 text-[var(--fg)]/70 leading-relaxed relative z-10 font-light max-w-sm">
                {participants[1].description}
              </p>
            </motion.div>

            {/* Channel Partners - Bottom Left Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              className="lg:col-span-5 bg-[var(--card)]/90 backdrop-blur-md p-8 rounded-[2rem] border border-[var(--fg)]/5 hover:border-[var(--fg)]/20 transition-all duration-500 group relative overflow-hidden shadow-sm flex flex-col justify-center"
            >
              <div className="absolute right-4 bottom-4 text-[100px] font-bold text-[var(--fg)]/[0.02] leading-none group-hover:text-[var(--fg)]/[0.04] transition-colors duration-500 pointer-events-none">
                03
              </div>
              <h3 className="font-28 font-semibold mb-3 text-[var(--fg)] relative z-10">
                {participants[2].title}
              </h3>
              <p className="font-16 text-[var(--fg)]/70 leading-relaxed relative z-10 font-light max-w-sm">
                {participants[2].description}
              </p>
            </motion.div>

            {/* Trustees - Bottom Right Large Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
              className="lg:col-span-7 bg-[var(--card)]/90 backdrop-blur-md p-8 lg:p-12 rounded-[2rem] border border-[var(--fg)]/10 hover:border-[var(--fg)]/20 transition-all duration-500 group relative overflow-hidden flex flex-col justify-center shadow-sm"
            >
              <div className="absolute right-4 bottom-4 text-[120px] font-bold text-[var(--fg)]/[0.03] leading-none group-hover:text-[var(--fg)]/[0.05] transition-colors duration-500 pointer-events-none">
                04
              </div>
              <h3 className="font-36 font-semibold mb-4 text-[var(--fg)] relative z-10">
                {participants[3].title}
              </h3>
              <p className="font-18 text-[var(--fg)]/80 leading-relaxed max-w-xl relative z-10 font-light">
                {participants[3].description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
