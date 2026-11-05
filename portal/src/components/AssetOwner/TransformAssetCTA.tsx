import { motion } from 'framer-motion';
// import { HiArrowLongRight } from 'react-icons/hi2';

export default function TransformAssetCTA() {
  return (
    <section className="w-full py-15 ">
      <div className="relative mx-4 lg:mx-10 overflow-hidden rounded-[3rem] bg-[#0A192F] py-24 lg:py-32">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/asset-owner/transform-asset.png"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            alt="Real Estate background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/60 to-[#0A192F]/40" />
        </div>

        <div className="relative z-10 px-6 text-center max-w-4xl mx-auto text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
          >
            Transform Your Asset into an <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Investment Opportunity
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-white/70 leading-relaxed font-semibold opacity-80"
          >
            Discover the future of real estate liquidity with Fracto. Join our institutional-grade platform today.
          </motion.p>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <button
              type="button"
              className="group inline-flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-blue-500/20 transition-all hover:scale-[1.05] active:scale-[0.95]"
            >
              Begin Your Asset Owner Journey
              <span className="transition-transform group-hover:translate-x-2">
                <HiArrowLongRight size={24} />
              </span>
            </button>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
}
