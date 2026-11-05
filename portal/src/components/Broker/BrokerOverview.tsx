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

export default function BrokerOverview() {
  return (
    <section className="relative overflow-hidden bg-[#0A192F] text-white py-24 lg:py-32 font-work px-4 lg:px-10">
      {/* City Backgrounds */}
      <div className="pointer-events-none absolute top-0 right-0 opacity-20 transition-opacity duration-1000">
        <img
          src="/images/broker/city-1.svg"
          alt=""
          className="w-64 sm:w-80 lg:w-[450px]"
        />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 opacity-20 transition-opacity duration-1000">
        <img
          src="/images/broker/city-2.svg"
          alt=""
          className="w-64 sm:w-80 lg:w-[450px]"
        />
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20 lg:mb-32"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight"
          >
            Channel Partner <span className="text-[#4F46E5]">Overview</span>
          </motion.h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] mx-auto mt-6 rounded-full shadow-lg shadow-blue-500/40" />
          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-white/70 leading-relaxed font-semibold opacity-80"
          >
            Empower your network and drive property Structural Co-ownership
            while navigating a secure, institutional-grade digital ecosystem.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-12 xl:col-span-6 flex justify-center lg:justify-start"
          >
            <div className="relative group grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer">
              <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="overflow-hidden rounded-[2.5rem] border-4 border-white/5 shadow-2xl relative">
                <img
                  src="/images/broker/agree.png"
                  alt="Partner Agreement"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/60 to-transparent" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
            className="lg:col-span-12 xl:col-span-6 space-y-10"
          >
            {[
              {
                title: 'Gateway to Structural Co-ownership',
                text: 'Channel Partners connect asset owners with verified Investors, promote listed assets, facilitate structural ownership opportunities, and help unlock real estate liquidity professionally.',
                icon: '01',
              },
              {
                title: 'Full Ecosystem Access',
                text: 'Once approved after KYC/KYB verification, Channel Partners gain access to leads management, commission tracking, referral tools, property listings, and partner management features within a structured, professionally governed ecosystem.',
                icon: '02',
              },
              {
                title: 'Strategic Growth Pillar',
                text: 'Channel Partners drive platform growth by onboarding asset owners, introducing qualified Investors, and promoting opportunities, earning transparent, performance-based commissions aligned with successful outcomes.',
                icon: '03',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="group flex flex-col md:flex-row gap-6 p-8 rounded-[2rem] hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-500"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#2563EB] flex items-center justify-center text-white text-2xl font-bold shadow-lg transform group-hover:rotate-6 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#4F46E5] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-lg text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
