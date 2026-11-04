import { type JSX } from 'react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const cardsData = [
  {
    heading: 'Verified Assets',
    para: 'Every property undergoes rigorous due diligence to ensure trust, safety, and complete transparency.',
  },
  {
    heading: 'Accessible Ownership',
    para: 'Invest in high-value real estate without heavy capital commitments.',
  },
  {
    heading: 'Liquidity & Flexibility',
    para: 'Trade your shares anytime, making real estate work with the fluidity of modern liquid assets.',
  },
  {
    heading: 'Seamless Management',
    para: 'We handle operations, compliance, and asset oversight so you can focus on growth.',
  },
  {
    heading: 'Channel Partner Portals',
    para: 'Trade your shares anytime, making real estate work with the fluidity of modern liquid assets.',
  },
  {
    heading: 'Structural Co-ownership as a Service',
    para: 'Easily fractionalise your real estate assets through our end-to-end infrastructure, enabling broader Investor access and smoother capital formation.',
  },
  {
    heading: 'Built for Trust',
    para: 'Built with a compliance-first approach and industry-grade verification to protect both Investors and asset owners.',
  },
  {
    heading: 'Property Types',
    para: 'Residential, commercial, hospitality, and high-yield rental assets — thoughtfully curated for performance and diversification.',
  },
];

export default function WhyChoose(): JSX.Element {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <section
      className="relative min-h-screen font-work py-10 md:py-20 px-4 lg:px-10 bg-black"
      style={{
        backgroundImage: 'url(/images/why-choose/why-choose-bg.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'contain',
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <div className="relative z-10 max-w-[1400px] mx-auto bg-black/40 h-full  flex flex-col justify-center items-center gap-8">
        <img
          src="/images/home/wchof.svg"
          className=" w-[95%] md:w-[91%] pb-5"
        />

        {/* <h2 className="text-white font-96 font-semibold leading-[100%] mb-4">
           House of Frac
        </h2> */}

        <div
          data-aos="fade-down"
          className="grid grid-cols-1 md:grid-cols-2 gap-7 text-white"
        >
          {cardsData.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1,
                translateY: -8,
                boxShadow: '0px 12px 30px rgba(0,0,0,0.25)',
                borderColor: '#FFB816',
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`rounded-[20px] border border-white py-9 px-6 flex flex-row gap-4 cursor-pointer
    ${
      i % 2 === 0
        ? 'bg-[linear-gradient(-35deg,#FFB81633_0%,transparent_13%)]'
        : 'bg-[linear-gradient(35deg,#FFB81633_0%,transparent_13%)]'
    }`}
            >
              <div
                className="bg-[#92690D] rounded-full p-5 aspect-square h-12 w-12 md:h-20 md:w-20 flex items-center justify-center
                shrink-0 font-semibold font-40 leading-none"
              >
                {`0` + (i + 1)}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-semibold font-32 leading-[100%]">
                  {item.heading}
                </h3>

                <p className="font-light font-new-14 leading-snug">
                  {item.para}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
