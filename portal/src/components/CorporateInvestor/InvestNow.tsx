import { motion } from 'framer-motion';
// import { HiArrowLongRight } from 'react-icons/hi2';
// import { useNavigate } from 'react-router-dom';

function InvestNow() {
  // const navigate = useNavigate()
  return (
    <section className="relative overflow-hidden bg-[#0A192F] text-white font-work py-20 lg:py-32">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="pointer-events-none absolute inset-0 flex justify-end opacity-20 pr-10">
        <img
          src="/images/corporateInvestor/logo-2.svg"
          alt=""
          className="h-full object-contain object-right transform scale-125"
        />
      </div>

      <div className="px-4 lg:px-10 relative z-10">
        <div className="relative mx-auto max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h2 className="font-60 font-bold leading-[1.1] mb-8">
              Invest with <span className="text-[#4F46E5]">Control</span>.<br />
              Earn with <span className="text-[#60A5FA]">Confidence</span>.
            </h2>

            <p className="font-24 text-white/70 max-w-2xl leading-relaxed mb-12">
              Own premium assets—Structural Co ownership—on Fracto. Join the future of institutional real estate investment.
            </p>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex cursor-pointer items-center gap-4 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] px-10 py-4 font-20 font-bold text-white shadow-2xl shadow-blue-500/40 transition-all hover:brightness-110"
              onClick={()=>navigate('/properties')}            
            >
              Start Investing Now
              <span className="transition-transform group-hover:translate-x-1">
                <HiArrowLongRight size={28} />
              </span>
            </motion.button> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default InvestNow;
