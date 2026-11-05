import { useOnboarding } from '@/hooks';
import { motion } from 'framer-motion';
const HowItWorkHero = () => {
  const { needsOnboarding, isCompany, hasDirectors } = useOnboarding();
  const isUserKycCompleted = !isCompany && hasDirectors;
  return (
    <section
      className={`relative w-full text-white font-work bg-[#14375B] ${
        isUserKycCompleted
          ? 'pt-18 lg:pt-20 pb-20 '
          : needsOnboarding
            ? 'pt-32 lg:pt-36 pb-20'
            : 'pt-18 lg:pt-20 pb-20'
      }`}
    >
      <div className="px-5 lg:px-10 max-w-[1600px] mx-auto pt-8">
        <div className="flex justify-center items-center lg:mb-16 px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="font-54 font-bold max-w-[600px] mx-auto text-center leading-tight tracking-wide"
          >
            How Fracto Works
          </motion.h2>
        </div>

        <div className="flex flex-col-reverse lg:flex-row justify-between items-start lg:gap-16 mt-8 lg:mt-0">
          <div className="w-full lg:w-1/2 space-y-6 lg:space-y-10 py-10 lg:py-0">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="font-20 lg:font-20 text-white/90 leading-relaxed font-light"
            >
              Structured real estate participation requires clarity,
              documentation, defined rights, and transparent processes. House of
              Frac ensures every step is clearly communicated before commitment.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              className="font-20 lg:font-20 text-white/90 leading-relaxed font-light"
            >
              Fracto connects Investors with curated opportunities
              through SPVs, ensuring asset-linked participation, legal
              separation, accountability, and clearly defined ownership rights.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
              className="font-20  lg:font-20 text-white/90 leading-relaxed font-light"
            >
              From KYC to distributions and exits, every interaction is
              documented, compliant, and transparent, providing participants
              with confidence, visibility, and a predictable experience.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full lg:w-1/2 flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[500px] lg:max-w-[700px] aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src="/images/howitwork/whyhof-building.png"
                alt="Fracto Building"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default HowItWorkHero;
