import { type JSX, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function AboutUs(): JSX.Element {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeInUp: any = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  };

  const { scrollY } = useScroll();
  const imageParallaxY = useTransform(scrollY, [0, 400], [0, -40]);

  const visionItems = [
    {
      title: 'Democratized Ownership',
      desc: 'Enable broader participation in premium assets by lowering entry barriers through structural investment.',
    },
    {
      title: 'Institutional Trust',
      desc: 'Set new benchmarks in governance, compliance, and Investor protection through trustee-led structures.',
    },
    {
      title: 'Transparent Investing',
      desc: 'Deliver clarity across asset selection, ownership, performance, and returns through technology.',
    },
    {
      title: 'Scalable Asset Ecosystem',
      desc: 'Build a future-ready platform connecting Investors, asset owners, Channel Partners, and trustees seamlessly.',
    },
  ];

  return (
    <div className="bg-[var(--bg)] text-[var(--fg)] font-work transition-colors duration-300 min-h-screen overflow-hidden">
      <section className="relative min-h-[600px]] lg:min-h-[820px] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 h-full relative z-10 flex flex-col md:flex-row items-center mt-12 xl:mt-20">
          <div className="w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1 relative z-10 space-y-8">
            <motion.h1
              className="font-64 md:text-[80px] font-bold leading-[1.1] tracking-tight text-[var(--fg)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              About House <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A76C0] to-[#60A5FA]">
                of Frac
              </span>
            </motion.h1>

            <motion.p
              className="font-20 md:font-24 text-[var(--fg)]/70 max-w-xl md:max-w-lg lg:max-w-lg  leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              House of Frac is making quality real estate accessible through
              structural ownership, enabling transparent, structured, and
              long-term participation in premium property investments.
            </motion.p>
            <motion.p
              className="font-20 md:font-24 text-[var(--fg)]/70 max-w-xl md:max-w-lg lg:max-w-lg leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              Real estate is a trusted investment in India, but high costs,
              legal complexities, and limited access have prevented many from
              investing in quality income-generating properties.
            </motion.p>
            <motion.p
              className="font-20 md:font-24 text-[var(--fg)]/70 max-w-xl md:max-w-lg lg:max-w-lg leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              House of Frac was founded to make real estate accessible through
              verified assets, transparent documentation, strong legal
              frameworks, and a secure digital-first co-ownership experience.
            </motion.p>
          </div>

          <div className="w-full md:w-1/2 flex justify-center order-1 md:order-2 mb-12 md:mb-0 relative">
            <motion.div
              style={{ y: imageParallaxY }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative z-10"
            >
              <img
                src="/images/about/hero.png"
                alt="House of Frac Dashboard"
                className="w-full max-w-[500px] lg:max-w-[650px] drop-shadow-2xl scale-110 xl:scale-125 origin-center"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-[var(--inner-card)] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            className="text-center mb-16 md:mb-24"
            {...fadeInUp}
            viewport={{ once: true, amount: 0.1 }}
          >
            <h2 className="font-48 font-bold text-[var(--fg)] mb-4">
              Our Mission
            </h2>
            <p className="font-20 text-[var(--fg)]/60 uppercase tracking-widest">
              Democratizing Access. Institutionalizing Trust.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <motion.div
              className="w-full md:w-1/2 relative flex justify-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-[2rem] blur-2xl transform scale-105 max-w-[620px] mx-auto"></div>
              <img
                src="/images/about/mission.png"
                alt="Mission"
                className="w-full max-w-[620px] rounded-[2rem] shadow-2xl relative z-10 border border-[var(--fg)]/10"
              />
            </motion.div>

            <motion.div
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="bg-[var(--card)] p-8 lg:p-12 rounded-[2rem] border border-[var(--fg)]/10 shadow-lg relative overflow-hidden">
                <p className="font-24 md:font-30 text-[var(--fg)] leading-relaxed font-light relative z-10">
                  To simplify{' '}
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#3A76C0] to-[#60A5FA]">
                    access to real estate and asset-backed opportunities
                  </span>{' '}
                  by combining structured legal frameworks, KYC-enabled
                  onboarding, professional asset presentation, and digital
                  Investor tools — in a platform that works for Investors, asset
                  owners, and channel partners alike.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[var(--bg)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            className="text-center mb-16 md:mb-20"
            {...fadeInUp}
            viewport={{ once: true, amount: 0.1 }}
          >
            <h2 className="font-36 md:font-48 font-bold text-[var(--fg)] mb-4">
              Our Vision
            </h2>
            <p className="font-18 text-[var(--fg)]/60 max-w-2xl mx-auto">
              To be India's most trusted platform for structured real estate
              participation — where every opportunity is discoverable, every
              process is transparent, and every participant is protected.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {visionItems.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-[var(--card)] p-8 rounded-[2rem] border border-[var(--fg)]/5 hover:border-[var(--fg)]/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden flex flex-col"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold font-20 mb-6 group-hover:scale-110 transition-transform">
                  0{idx + 1}
                </div>
                <h3 className="font-22 font-semibold text-[var(--fg)] mb-3">
                  {item.title}
                </h3>
                <p className="font-16 text-[var(--fg)]/70 leading-relaxed font-light">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[var(--inner-card)] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <motion.div
            className="text-center mb-16"
            {...fadeInUp}
            viewport={{ once: true, amount: 0.1 }}
          >
            <h2 className="font-48 font-bold text-[var(--fg)] mb-4">
              The Future We Are Building
            </h2>
            <p className="font-18 text-[var(--fg)]/60 max-w-3xl mx-auto">
              The way India participates in real estate is changing.
              Digital-first platforms, structured legal frameworks,, and a
              growing appetite for asset-backed wealth creation among a new
              generation of Investors are all pointing in the same direction.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Structural real estate participation',
              },
              {
                title: 'Asset-backed investment opportunities',
              },
              {
                title: 'Curated real estate listings',
              },
              {
                title: 'Investor and asset owner onboarding',
              },
              {
                title: 'Partner-led distribution',
              },
              {
                title: 'Structured documentation',
              },
              {
                title: 'Digital asset dashboards',
              },
              {
                title: 'Future-ready asset ownership models',
              },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-[var(--card)] min-h-[150px] px-8 py-10 rounded-[2rem] border-t-4 border-t-[#3A76C0] border border-[var(--fg)]/10 hover:border-[#3A76C0]/50 transition-all shadow-sm flex items-center justify-between"
              >
                {/* Left Content */}
                <h3 className="font-24 font-bold text-[var(--fg)] max-w-[70%] leading-snug">
                  {step.title}
                </h3>

                {/* Right Number */}
                <div className="flex items-center gap-5 ml-6">
                  <div className="w-px h-14 bg-[var(--fg)]/10" />

                  <div className="text-5xl md:text-6xl font-bold text-[#3A76C0]/10 leading-none">
                    0{idx + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[var(--bg)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            className="text-center mb-16"
            {...fadeInUp}
            viewport={{ once: true, amount: 0.1 }}
          >
            <h2 className="font-48 font-bold text-[var(--fg)] mb-4">
              Our Core Principles
            </h2>
            <p className="font-18 text-[var(--fg)]/60 max-w-3xl mx-auto leading-relaxed">
              House of Frac operates as a collaborative engine rooted in
              trust-first architecture, compliance-led design, and
              technology-driven transparency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                role: 'Transparency Above All',
                action:
                  'Complete asset information, clear documentation, defined risk disclosures, and honest commercial terms — no hidden fees.',
              },
              {
                role: 'Structure Before Speed',
                action:
                  'Every asset is verified, documented, and legally structured before Investors are invited to participate.',
              },
              {
                role: 'Access as a Right',
                action:
                  'Disciplined, smaller-ticket Investors deserve access to the same institutional-quality asset classes through structured opportunities.',
              },
              {
                role: 'Investor Protection First',
                action:
                  'KYC, trustee oversight, transparent documentation, and structured exit frameworks are built into every transaction.',
              },
              {
                role: 'Long-Term Relationships',
                action:
                  'Trust, repeat engagement, and shared success among Investors, asset owners, and partners.',
              },
            ].map((eco, idx: number, items) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-[var(--card)] p-8 lg:p-12 rounded-[2rem] border border-[var(--fg)]/10 hover:border-[var(--fg)]/20 transition-all relative overflow-hidden group shadow-sm flex flex-col justify-center
                  ${idx === items.length - 1 ? 'md:col-span-2 place-self-center w-full md:w-1/2' : ''}
                `}
              >
                <div className="absolute right-0 top-0 text-[100px] max-md:text-[75px] font-bold text-[var(--fg)]/[0.03] leading-[0.8] p-4 pointer-events-none group-hover:text-[var(--fg)]/[0.05] transition-colors">
                  0{idx + 1}
                </div>
                <h3 className="font-28 font-semibold text-[var(--fg)] mb-3 relative z-10">
                  {eco.role}
                </h3>
                <p className="font-18 text-[var(--fg)]/70 leading-relaxed font-light relative z-10">
                  {eco.action}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[var(--bg)] relative overflow-hidden flex items-center justify-center border-t border-[var(--fg)]/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#3A76C0]/5 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div
          className="relative z-10 text-center bg-[var(--card)]/80 backdrop-blur-2xl border border-[var(--fg)]/10 px-8 py-10 md:px-12 md:py-16 rounded-[3rem] w-full max-w-7xl mx-4 sm:mx-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h2
            className="font-48 md:text-[72px] font-bold text-[var(--fg)] mb-6 tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A76C0] to-[#60A5FA]">
              Future View
            </span>
          </motion.h2>
          <motion.p
            className="font-16 md:font-24 text-[var(--fg)]/70 font-light max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            The internet has changed how people discover, evaluate, and
            participate in financial opportunities. House of Frac is built on
            the belief that real estate and asset-backed ownership will become
            increasingly digital, transparent, and participation-led. This
            direction is aligned with the broader idea in the uploaded reference
            deck that digital ownership, provenance, KYC-led platforms, and
            Investor participation models are becoming more explicit in the Web3
            and asset-backed economy.
          </motion.p>
        </motion.div>
      </section>
    </div>
  );
}
