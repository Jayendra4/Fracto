import { TermsAndConditionFields } from '@/constants/termsandcondition';
import { motion } from 'framer-motion';

export default function TermsAndCondition() {
  return (
    <div className="bg-[var(--bg)] text-[var(--fg)] font-work transition-colors duration-300 min-h-screen">
      <section className="relative pb-24 pt-32 md:pt-40 lg:pt-48 overflow-hidden bg-[var(--inner-card)]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center relative z-10">
          <motion.h1
            className="font-48 md:text-[64px] font-bold mb-6 text-[var(--fg)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Terms & Conditions
          </motion.h1>
          <motion.p
            className="font-20 text-[var(--fg)]/60 font-light max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            Welcome to House of Frac. These Terms & Conditions govern your
            access to and use of our website, platform, mobile application, and
            any related services offered by House of Frac. Please read these
            Terms carefully before using the Platform. By accessing or using the
            Platform in any manner, you acknowledge that you have read,
            understood, and agree to be bound by these Terms.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-24 relative z-10 -mt-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            className="bg-[var(--card)] p-8 md:p-12 lg:p-16 rounded-[2rem] border border-[var(--fg)]/10 shadow-xl"
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="space-y-12">
              <motion.p
                className="font-18 text-[var(--fg)]/60 font-light leading-relaxed border-l-4 border-[#3A76C0] pl-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              >
                By accessing or using the Platform in any manner, you acknowledge that you have read, understood, and agree to be bound by these Terms. Please read them carefully before using the Platform.
              </motion.p>

              {TermsAndConditionFields.map((section, idx) => {
                const isDisclaimer = section.title === 'Important Disclaimer';
                return (
                  <motion.div
                    key={idx}
                    className="mb-6 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.4) }}
                  >
                    {isDisclaimer ? (
                      <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">⚠</span>
                          <h2 className="font-20 font-bold text-amber-500 uppercase tracking-wider">
                            {section.title}
                          </h2>
                        </div>
                        <p className="font-16 text-amber-400/80 leading-relaxed">
                          {section.content as string}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h2 className="font-28 md:text-[32px] font-semibold text-[var(--fg)] mb-4 border-b border-[var(--fg)]/5 pb-2">
                          {section.title}
                        </h2>
                        <p className="text-[var(--fg)]/70 leading-relaxed">
                          {Array.isArray(section.content)
                            ? section.content.map((line, i) => (
                                <span key={i} className="block mb-1">{line}</span>
                              ))
                            : section.content}
                        </p>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-16 pt-8 border-t border-[var(--fg)]/10 text-center">
              <p className="font-16 text-[var(--fg)]/50 italic">
                Last Updated: May 2026. House of Frac reserves the right to
                update these terms at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
