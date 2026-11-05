import WhyTimeline from './WhyTimeline';
import { motion } from 'framer-motion';
// const points = [
//   'Curated, investment-ready assets',
//   'Trustee-led ownership protection',
//   'End-to-end digital experience',
//   'Transparent returns and reporting',
//   'Institutional-grade governance',
// ];

export default function WhyHouseOfFrac() {
  return (
    <section className="relative bg-[#123456] px-4 lg:px-16 py-20 overflow-hidden font-work">
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1600px] text-white">
        <h2 className="text-center font-36 font-semibold mb-16">
          Why Fracto
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col items-center lg:items-start"
          >
            <WhyTimeline />
          </motion.div>

          <div className="relative flex justify-center">
            <div className="absolute right-[-60px] top-[-60px] w-[200px] h-[200px] md:w-[240px] md:h-[240px] xl:w-[300px] xl:h-[300px] rounded-full bg-blue-400/20 z-0" />
            <div className="absolute left-[-20px] top-40 lg:top-32  md:w-[350px] md:h-[350px] xl:w-[450px] xl:h-[450px] rounded-full bg-blue-300/20 z-10" />

            <div className="relative z-20 w-full max-w-[600px] rounded-lg overflow-hidden shadow-2xl">
              <img
                src="/images/howitwork/whyhof-building.png"
                alt="Commercial real estate asset"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
