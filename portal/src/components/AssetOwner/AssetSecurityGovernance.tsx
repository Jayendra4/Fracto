import { motion } from 'framer-motion';

const features = [
  {
    title: 'Mandatory KYC Verification',
    description:
      'Every stakeholder on the platform undergoes comprehensive identity and compliance verification.',
    img: '/images/asset-owner/asset-man.svg',
  },
  {
    title: 'Trustee-led Approvals',
    description:
      'Independent trustees provide objective oversight and validation for all asset listings.',
    img: '/images/asset-owner/asset-check.svg',
  },
  {
    title: 'Transparent Dashboards',
    description:
      'Real-time access to performance metrics, distributions, and Investor activity data.',
    img: '/images/asset-owner/asset-dashboard.svg',
  },
  {
    title: 'Role-based Access',
    description:
      'Granular security controls ensure data integrity and privacy across all user roles.',
    img: '/images/asset-owner/asset-cube.svg',
  },
];

export default function AssetSecurityGovernance() {
  return (
    <section className="w-full bg-[var(--bg)] py-10 lg:py-32 font-work px-4 lg:px-10 transition-colors">
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--fg)] tracking-tight">
            Built On{' '}
            <span className="text-[#3A76C0]">Security & Governance</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-6 rounded-full" />
          <p className="mt-8 text-lg md:text-xl text-[var(--fg)]/60 max-w-3xl mx-auto leading-relaxed font-semibold opacity-80">
            Our institutional-grade security framework ensures that every asset
            and every transaction is legitimate, legal, and protected.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-12 xl:col-span-5 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-[var(--card)] p-2 bg-[var(--card)]"
          >
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src="/images/asset-owner/asset-security.png"
                alt="Security & Governance"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>

          <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative rounded-[2rem] bg-[var(--card)] p-8 border border-[var(--fg)]/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3A76C0]/10 text-white shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3">
                    <img src={feature.img} alt="" className="w-10 h-10" />
                  </div>

                  <h3 className="mb-4 text-2xl font-bold text-[var(--fg)] group-hover:text-[#3A76C0] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-lg leading-relaxed text-[var(--fg)]/60 group-hover:text-[var(--fg)]/80 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
