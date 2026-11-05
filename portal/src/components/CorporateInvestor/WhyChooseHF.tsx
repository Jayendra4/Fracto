import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
};

function WhyChooseHF() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)] text-[var(--fg)] font-work py-16 lg:py-24 transition-colors">
      {/* Abstract Background Ornaments */}
      <div className="pointer-events-none absolute top-0 -right-20 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full animate-pulse z-0" />
      <div className="pointer-events-none absolute bottom-0 -left-20 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full z-0" />

      <div className="px-4 lg:px-10 relative z-10">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={fadeUp}
              className="font-48 font-bold tracking-tight"
            >
              Why Investor Choose{' '}
              <span className="text-[#3A76C0]">Fracto</span>
            </motion.h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-6 rounded-full" />
            <motion.p
              variants={fadeUp}
              className="mt-8 font-22 text-[var(--fg)]/70 leading-relaxed"
            >
              Fracto is designed for Investor who want exposure to real
              estate without the complexity of direct ownership, property
              management, legal paperwork, or large-ticket capital deployment.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className="order-2 lg:order-1"
            >
              <div className="p-8 lg:p-12 rounded-[2.5rem] bg-[var(--card)] border border-[var(--fg)]/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#3A76C0] to-[#60A5FA]" />
                <p className="font-26 font-medium leading-relaxed tracking-tight">
                  {/* Fracto combines{' '}
                  <span className="text-[#3A76C0]">
                    asset-backed investments
                  </span>
                  , fractional accessibility, and institutional-grade governance
                  to deliver a trusted investment ecosystem for modern
                  investors. */}
                  Our focus on transparency, structured documentation, asset
                  visibility, and verified participation, enabling prospective
                  co-owners to make informed decisions with confidence through a
                  well-governed platform.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-6 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3A76C0]" />
                    <span className="font-semibold text-sm uppercase tracking-wider">
                      Secured
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3A76C0]" />
                    <span className="font-semibold text-sm uppercase tracking-wider">
                      Transparent
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3A76C0]" />
                    <span className="font-semibold text-sm uppercase tracking-wider">
                      Liquid
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3A76C0]" />
                    <span className="font-semibold text-sm uppercase tracking-wider">
                      Managed
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
              className="flex justify-center order-1 lg:order-2"
            >
              <div className="relative group">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#3A76C0]/20 to-[#60A5FA]/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl w-full max-w-[620px] border-8 border-[var(--card)]">
                  <img
                    src="/images/corporateInvestor/choose.jpg"
                    alt="Why Choose Fracto"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s]"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseHF;
