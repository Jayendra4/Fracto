import { motion } from 'framer-motion';
// import { FiArrowRight } from 'react-icons/fi';
// import { Link } from 'react-router-dom';
export default function HowItWorkCTA() {
  return (
    <section className="bg-[var(--bg)] py-24 px-4 lg:px-10 font-work">
      <div className="mx-auto max-w-[1200px] text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="font-36 font-semibold text-[var(--fg)] leading-tight"
        >
          Register in minutes. Complete your KYC.
          <br />
          Browse curated, documented assets — and participate with confidence.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="mt-4 hidden font-18 text-[var(--fg)]/80"
        >
          Own Smart. Invest with Confidence.
        </motion.p>
        {/* 
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] px-8 py-4 font-18 font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-110 active:scale-[0.98]">
            Start Investing Today
            <FiArrowRight
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-2 "
            />
          </button>
        </motion.div> */}
      </div>
    </section>
  );
}
