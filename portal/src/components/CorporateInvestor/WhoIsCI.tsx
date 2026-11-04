import { motion } from 'framer-motion';

export default function WhoIsCI() {
  return (
    <section className="overflow-hidden bg-[var(--bg)] text-[var(--fg)] font-work px-4 lg:px-10 py-16 lg:py-24">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-48 font-bold tracking-tight">
            Who Is a <span className="text-[#3A76C0]">Corporate Investor</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-4 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="relative p-8 rounded-[2rem] bg-[var(--card)] border border-[var(--fg)]/10 shadow-xl overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#3A76C0] to-[#60A5FA]" />
              <p className="font-20 leading-relaxed text-[var(--fg)]/90">
                A Corporate Investor on the House of Frac platform is an end
                user — whether an individual, a partnership, a private limited
                company, or another legal entity — who registers on the platform
                with the intention of participating in structured real estate
                and asset-backed investment opportunities.
              </p>
            </div>

            <div className="relative p-8 rounded-[2rem] bg-[var(--card)] border border-[var(--fg)]/10 shadow-xl overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#60A5FA] to-[#3A76C0]" />
              <p className="font-20 leading-relaxed text-[var(--fg)]/90">
                Rather than acquiring an entire property outright, Corporate
                Investors gain proportional economic participation by engaging
                with structured purchase option This model enables greater
                flexibility in capital deployment, meaningful portfolio
                diversification across asset types and geographies, and more
                efficient use of available capital.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#3A76C0]/20 to-[#60A5FA]/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative w-full max-w-[550px] aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[var(--card)]">
                <img
                  src="/images/corporateInvestor/building.png"
                  alt="Corporate Building"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
