import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
export default function CTA() {
  return (
    <section className="bg-[var(--bg)]">
      <div
        style={{
          backgroundImage: 'url(/images/home/cta/cta-bg.webp)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="px-4 lg:px-10">
          <div className="mx-auto max-w-[1600px] pt-10">
            <div className="flex  lg:flex-row flex-col  items-center justify-between gap-4 md:gap-6 lg:gap-12 ">
              <div>
                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-[#7C5F1E] px-3 py-1.5 font-16 font-semibold text-white ">
                    Invest
                  </span>
                  <span className="rounded-full bg-[#7C5F1E] px-3 py-1.5 font-16 font-semibold text-white">
                    List Your Property
                  </span>
                  <span className="rounded-full bg-[#7C5F1E] px-3 py-1.5 font-16 font-semibold text-white">
                    Become A Channel Partner
                  </span>
                </div>

                <h1 className="font-36 font-semibold  text-[var(--fg)] sm:text-5xl">
                  Start Building Real Estate Ownership Today
                </h1>

                <p className="mt-6 max-w-xl font-20 font-normal text-[var(--fg)]">
                  Step into a smarter way of owning commercial real estate in
                  India through SM REITs—where real, income-generating assets
                  meet transparency and regulatory discipline. Invest with
                  confidence, earn predictable returns, and be part of India’s
                  next-generation real estate growth story.
                </p>

                <div className="mt-8">
                  <Link
                    to={'/primary-club'}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-18 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer"
                  >
                    {/* <span className="absolute inset-0  animate-[pulse_2.2s_ease-in-out_infinite]" /> */}
                    <span className="relative z-10">Explore Assets</span>
                    <FiArrowRight className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              <div className="">
                <motion.img
                  src="/images/home/cta/cta-building.webp"
                  alt="Modern skyscraper"
                  className="h-[380px] object-center lg:h-[500px] cursor-pointer"
                  loading="lazy"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  whileHover={{ scale: 1.03, y: -6 }}
                  transition={{
                    duration: 1.2,
                    ease: 'easeOut',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
