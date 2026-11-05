import { motion } from 'framer-motion';
// import { HiArrowLongRight } from 'react-icons/hi2';

export default function Bridge() {
  return (
    <section className="relative w-full py-24 lg:py-32 font-work bg-[var(--bg)] px-4 lg:px-10 overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#4F46E5]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-[1400px] relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--fg)] leading-tight"
        >
          The <span className="text-[#4F46E5]">Essential Link</span> in <br />
          Modern Real Estate
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-[var(--fg)]/60 leading-relaxed font-semibold"
        >
          Channel Partners bridge the gap between luxury assets and verified
          Investor. Through our digital framework, you ensure assets reach the
          right global pool efficiently, driving volume and professional growth
          for the entire ecosystem.
        </motion.p>
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <button className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] px-10 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/20 transition-all">
            Join The Network
            <span className="transition-transform group-hover:translate-x-1.5">
              <HiArrowLongRight size={24} />
            </span>
          </button>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mt-16 relative px-4 lg:px-20 flex justify-center"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-[var(--card)] p-1 bg-[var(--card)] max-w-4xl">
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src="/images/broker/hero.png"
                alt="Connecting sectors"
                className="w-full h-auto transform hover:scale-105 transition-transform duration-[8s]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
