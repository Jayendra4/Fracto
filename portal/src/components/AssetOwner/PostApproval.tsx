import { motion } from 'framer-motion';

import {
  HiOutlineMegaphone,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineInformationCircle,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2';

const features = [
  {
    icon: HiOutlineMegaphone,
    text: 'Track property promotions and lead generation real-time.',
  },
  {
    icon: HiOutlineUserGroup,
    text: 'Monitor global Investor engagement and portfolio growth.',
  },
  {
    icon: HiOutlineBuildingOffice2,
    text: 'Streamline new asset onboarding and distribution cycles.',
  },
  {
    icon: HiOutlineInformationCircle,
    text: 'Access an institutional-grade toolkit for advanced analytics.',
  },
  {
    icon: HiOutlineChartBarSquare,
    text: 'Analyze performance metrics for lead management and property activity.',
  },
];

export default function PostApproval() {
  return (
    <section className="overflow-hidden bg-[var(--bg)] text-[var(--fg)] px-4 lg:px-10 py-10 lg:py-32 transition-colors">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Post Approval <span className="text-[#3A76C0]">Capabilities</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] mx-auto mt-6 rounded-full" />
          <p className="mt-8 text-lg md:text-xl text-[var(--fg)]/60 max-w-2xl mx-auto leading-relaxed font-semibold opacity-80">
            After full authorization, Asset Owners unlock a powerful suite of
            management and growth tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <motion.div className="lg:col-span-12 xl:col-span-6 space-y-6">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group flex items-start gap-6 p-6 rounded-[1.5rem] hover:bg-[var(--card)] border border-transparent hover:border-[var(--fg)]/10 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#3A76C0]/10 flex items-center justify-center text-[#3A76C0] group-hover:bg-[#3A76C0] group-hover:text-white transition-all duration-500">
                    <Icon size={24} />
                  </div>
                  <p className="text-lg md:text-xl font-medium text-[var(--fg)]/80 group-hover:text-[var(--fg)] transition-colors py-1">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-12 xl:col-span-6 relative"
          >
            <div className="relative group">
              <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />
              <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-[var(--card)]">
                <img
                  src="/images/asset-owner/asset-overview.png"
                  alt="Asset management dashboard"
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-[5s]"
                />

                {/* Glassy Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--bg)]/80 to-transparent backdrop-blur-[2px]" />
              </div>

              {/* Floating Meta Data */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-10 -right-10 bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--fg)]/10 p-6 rounded-[2rem] shadow-2xl z-20 hidden md:block"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold opacity-50 tracking-widest uppercase text-[var(--fg)]">
                      Live Metrics
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[var(--fg)]">
                    +24.5%
                  </div>
                  <div className="text-sm text-[var(--fg)]/60">
                    Investor Growth rate
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
