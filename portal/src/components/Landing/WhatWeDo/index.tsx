import Aos from 'aos';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

type Feature = {
  id: string;
  title: string;
  desc: string;
  align: 'left' | 'right';
};

const features: Feature[] = [
  {
    id: '01',
    title: 'Structured Participation',
    desc: 'Access real estate opportunities structured through legally defined frameworks — including SPV-based co-ownership models — with clear documentation, defined participation terms, and professional asset presentation from day one.',
    align: 'left',
  },
  {
    id: '02',
    title: 'Verified Assets',
    desc: 'Every asset listed on House of Frac undergoes documentation review, financial assessment, legal title verification, and structured preparation before being presented to our registered Investor base.',
    align: 'left',
  },
  {
    id: '03',
    title: 'Transparent Records',
    desc: 'Platform activity, asset documents, Investor participation details, and distribution records are maintained with full transparency and are accessible through your dedicated Investor dashboard at any time.',
    align: 'right',
  },
  {
    id: '04',
    title: 'Structured Exit Pathways',
    desc: 'Where applicable, House of Frac facilitates structured exit mechanisms, resale opportunities, or buyback arrangements between members— clearly defined in each assets legal documentation so you always know your options before you commit.',
    align: 'right',
  },
];

export default function WhatWeDo() {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <section
      id="whatWeDo"
      className="w-full bg-[var(--bg)] text-[var(--fg)] py-20 overflow-hidden font-work"
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20 text-[var(--fg)] mt-5"
        >
          <h2 className="font-48 font-bold" data-aos="fade-down">
            What we do
          </h2>
          <p
            className="mt-4 font-medium max-w-[700px] mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            House of Frac is a technology-enabled platform designed to connect
            Investor with curated, professionally structured real estate and
            asset-backed participation opportunities across India. We bring
            transparency, discipline, and accessibility to a space that has
            traditionally been complex, opaque, and available only to
            large-ticket buyers.
          </p>
        </motion.div>

        {/* desktop version */}
        <div className="hidden lg:grid grid-cols-3 gap-10 items-center">
          <div data-aos="fade-right" className="space-y-20">
            {features
              .filter((f) => f.align === 'left')
              .map((item) => (
                <FeatureItem key={item.id} {...item} />
              ))}
          </div>

          <div className="relative flex justify-center">
            <div
              data-aos="zoom-in"
              className="absolute w-[450px] h-[450px] rounded-full
    bg-gradient-to-bl from-[#4f51c070] to-[#1a83f47a] opacity-35"
            />

            <motion.img
              src="/images/home/whatwedo/phone-left.webp"
              alt="mobile"
              initial={{ opacity: 0, scale: 0.9, x: -40 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative z-10 w-[250px] h-[420px] xl:h-[450px] "
              loading="lazy"
            />

            <motion.img
              src="/images/home/whatwedo/phone-right.webp"
              alt="mobile"
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative z-10 w-[230px] -ml-10 mt-15"
              loading="lazy"
            />
          </div>

          <div data-aos="fade-left" className="space-y-20">
            {features
              .filter((f) => f.align === 'right')
              .map((item) => (
                <FeatureItem key={item.id} {...item} align="right" />
              ))}
          </div>
        </div>

        {/* mob version */}
        <div className="md:hidden">
          <div data-aos="fade-left" className="space-y-6">
            {features.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.3 }}
                className="flex justify-start text-left"
              >
                <div className="max-w-[320px]">
                  <span className="block text-[20px] font-semibold text-[#4F86C0]">
                    {item.id}
                  </span>

                  <span className="block h-px w-24 bg-[#1F84F0] mt-1" />

                  <h3 className="pt-2 font-20 font-semibold text-black">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative flex justify-center mt-16"
            >
              <div
                data-aos="zoom-in"
                className="absolute w-[300px] h-[300px] bg-gradient-to-bl from-[#4f51c08e] to-[#1a83f47a] opacity-35 rounded-full"
              />
              <img
                src="/images/home/whatwedo/phone-left.webp"
                className="relative w-[150px] h-[260px]"
                alt="left phone image"
                loading="lazy"
              />
              <img
                src="/images/home/whatwedo/phone-right.webp"
                className="relative w-[150px] -ml-6 mt-6"
                loading="lazy"
                alt="right phone image"
              />
            </motion.div>
          </div>
        </div>

        {/* tab-version */}
        <div className="hidden md:block lg:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative flex justify-center mb-16"
          >
            <div
              data-aos="zoom-in"
              className="absolute w-[300px] h-[300px] bg-gradient-to-bl from-[#4f51c08e] to-[#1a83f47a] opacity-35 rounded-full"
            />
            <img
              src="/images/home/whatwedo/phone-left.webp"
              className="relative w-[150px] h-[260px]"
              alt="left phone image"
              loading="lazy"
            />
            <img
              src="/images/home/whatwedo/phone-right.webp"
              className="relative w-[150px] -ml-6 mt-6"
              alt="right phone image"
              loading="lazy"
            />
          </motion.div>
          <div className="space-x-2 space-y-2 grid grid-cols-2 ">
            {features.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="border rounded-xl p-6 shadow-sm"
              >
                <span className="text-blue-600 text-xl font-semibold">
                  {item.id}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeatureItem({
  id,
  title,
  desc,
  align = 'left',
}: {
  id: string;
  title: string;
  desc: string;
  align?: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: align === 'left' ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`max-w-[500px] bg-[var(--bg)] text-[var(--fg)] ${align === 'right' ? 'text-left mr-auto' : ''}`}
    >
      <div
        className={`${id === '02' || id === '04' ? 'pl-[80px] pt-[10px]' : ''}`}
      >
        <span className="text-[#4F86C0] text-left font-44 font-semibold w-full">
          {id}
        </span>
        <div
          className={`h-px bg-[#1F84F0] my-2 ml-0 mr-0 ${id === '3' ? 'w-full' : ''}`}
        />
        <h3 className="font-26 font-semibold ">{title}</h3>
        <p className="mt-2 font-16 ">{desc}</p>
      </div>
    </motion.div>
  );
}
