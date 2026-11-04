import { motion } from 'framer-motion';

const securityFeatures = [
  {
    title: 'Institutional KYB',
    description:
      'Multi-layered corporate verification for Channel Partners ensures institutional-grade trust and operational legitimacy. Every Channel Partner entity undergoes thorough business registration verification, director identification, and ownership structure review before being authorised to operate on the platform.',
    img: '/images/asset-owner/asset-man.svg',
  },
  {
    title: 'Trustee Oversight',
    description:
      'Every asset submission, Investor referral, and commission lead managed by a Channel Partner is transparently monitored within House of Frac independent, trustee-governed framework. This oversight ensures that all partner activities are compliant, credible, and aligned with the legal and regulatory requirements of the platform.',
    img: '/images/asset-owner/asset-check.svg',
  },
  {
    title: 'Real-time Audits',
    description:
      'Comprehensive digital transaction logging provides a secure, auditable trail for every commission settlement and lead conversion within the partner ecosystem. This real-time audit capability ensures complete accountability and transparency for all partner-related financial transactions and Investor introductions.',
    img: '/images/asset-owner/asset-dashboard.svg',
  },
];

export default function Security() {
  return (
    <section className="w-full bg-[var(--bg)] py-20 lg:py-32 font-work px-4 lg:px-10 transition-colors">
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] tracking-tight">
            Built On{' '}
            <span className="text-[#3A76C0]">Security & Governance</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-4 rounded-full" />
          <p className="mt-6 text-base md:text-lg text-[var(--fg)]/60 max-w-3xl mx-auto leading-relaxed font-medium">
            The House of Frac partner ecosystem is built on the same
            institutional-grade security and governance framework that underpins
            every other aspect of the platform. This ensures that Channel
            Partners, asset owners, and Investors all operate within a legally
            sound, transparent, and credible environment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {securityFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative rounded-[2.5rem] bg-[var(--card)] p-10 lg:p-12 border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#3A76C0]/10 text-white shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                  <img src={feature.img} alt="" className="w-10 h-10" />
                </div>

                <h3 className="mb-3 text-lg lg:text-xl font-bold text-[var(--fg)] group-hover:text-[#3A76C0] transition-colors">
                  {feature.title}
                </h3>

                <p className="text-base lg:text-lg leading-relaxed text-[var(--fg)]/60 group-hover:text-[var(--fg)]/80 transition-colors">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
