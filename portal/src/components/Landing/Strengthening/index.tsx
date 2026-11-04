import { motion } from 'framer-motion';
export default function Strengthening() {
  return (
    <section className="w-full bg-gradient-to-r from-[#020B1A] to-[#07162E] py-10 lg:py-20 px-4 lg:px-10 font-work ">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="text-white flex flex-col items-center  lg:items-start justify-center lg:justify-start space-y-4 lg:space-y-6 text-center lg:text-start ">
          <div className="flex items-center lg:justify-start justify-center  ">
            <img
              src="images/hof-logo2.png "
              alt=""
              loading="lazy"
              height={36}
              width={36}
            />
          </div>

          <h2 className="font-44 font-medium 2xl:whitespace-nowrap">
            Strengthening Real Estate Professionals
          </h2>

          <p className="text-[#CCCCCC] font-20  text-justify lg:px-0 px-4">
            Partnering with House of FRAC to unlock new revenue streams through
            SM REITs while offering your clients secure, asset-backed commercial
            real estate opportunities.
          </p>

          <button className="inline-flex items-center justify-center gap-3 px-8 py-3.5 mt-4 lg:mt-2 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-18 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer">
            Collaborate With Us
          </button>
        </div>

        <div className="relative flex lg:justify-end justify-center">
          <motion.img
            src="/images/home/phone-1.webp"
            alt="mobile"
            initial={{ opacity: 0, scale: 0.9, y: -60 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{
              scale: 1.05,
              y: -8,
              rotate: -2,
            }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.9,
              ease: 'easeOut',
            }}
            className="w-[140px] md:w-[220px] rounded-2xl shadow-2xl rotate-[-4deg] pb-10 cursor-pointer will-change-transform"
            loading="lazy"
          />

          <motion.img
            src="/images/home/phone-1.webp"
            alt="mobile"
            initial={{ opacity: 0, scale: 0.9, y: 60 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{
              scale: 1.05,
              y: -8,
              rotate: 2,
            }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.9,
              ease: 'easeOut',
              delay: 0.15,
            }}
            className="w-[140px] md:w-[220px] rounded-2xl shadow-2xl rotate-[6deg] pt-10 cursor-pointer will-change-transform"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
