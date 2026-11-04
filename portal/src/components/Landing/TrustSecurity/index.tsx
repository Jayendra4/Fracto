import { motion } from 'framer-motion';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

const FEATURES = [
  {
    title: 'SPV-Based Participation Structure',
    description:
      'Investor participation is facilitated through Special Purpose Vehicles — dedicated legal entities that hold the underlying asset. This structure provides legal clarity, asset segregation, and well-defined participation rights for every Investor.',
    image: '/images/home/trustSecurity/chart.png',
  },
  {
    title: 'KYC & AML Compliant',
    description:
      'Every Investor, asset owner, and channel partner completes mandatory KYC verification and AML screening before accessing the platform. Our onboarding process is aligned with PMLA, 2002 requirements, ensuring a trusted, verified ecosystem.',
    image: '/images/home/trustSecurity/loop.svg',
  },
  {
    title: 'Document-First Approach',
    description:
      'No participation is processed without fully executed legal agreements. Every opportunity includes subscription agreements, risk disclosures, asset information memorandums, and all applicable transaction documents — reviewed and signed before any commitment is made.',
    image: '/images/home/trustSecurity/block.svg',
  },
  {
    title: 'Independent Asset Verification',
    description:
      'Asset valuations, legal title searches, financial projections, and compliance checks are reviewed by independent professionals before any asset is approved for listing. You see only what has been verified.',
    image: '/images/home/trustSecurity/shield.svg',
  },
  {
    title: 'Trustee-Monitored Framework',
    description:
      'Where applicable, assets are held under independent trustee oversight — ensuring that Investor interests are monitored at every stage and that distributions are processed strictly in accordance with agreed documentation.',
    image: '/images/home/trustSecurity/icon.svg',
  },
];

const TrustSecurity = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }, []);
  return (
    <section className="w-full py-16 lg:py-24 bg-[var(--bg)] text-[var(--fg)] font-work">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-48 font-bold " data-aos="fade-down">
            Built on Structure. Grounded in Compliance.
          </h2>
          <p
            className="mt-4 font-medium max-w-[700px] mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            At House of Frac, Investor protection is not a feature — it is the
            foundation. Every aspect of the platform, from onboarding to asset
            listing to distributions, is designed around structured processes,
            verified documentation, and regulatory awareness.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            {FEATURES.map((item, index) => (
              <div
                key={item.title}
                data-aos="fade-right"
                data-aos-delay={index * 100}
                className="
                  group
                  flex gap-4 p-3 rounded-xl
                  bg-white
                  border border-[#E5E7EB]
                  shadow-[0_6px_16px_rgba(0,0,0,0.12)]
                  transition-all duration-300 ease-out
                  hover:bg-[#4F86C0]
                  hover:text-white
                  hover:border-transparent
                  hover:shadow-[0_8px_22px_rgba(0,0,0,0.25)]
                "
              >
                <div className="flex flex-col gap-1">
                  <div
                    className="
                      flex items-center justify-center
                      w-8 h-8 rounded-md shrink-0
                      text-[var(--fg)]
                      transition-colors duration-300
                    "
                  >
                    <img
                      src={item.image}
                      alt="icon"
                      className={` group-hover:invert`}
                      height={28}
                      width={28}
                    />
                  </div>

                  <div>
                    <h3
                      className="
                        font-24 font-semibold
                        text-gray-900
                        transition-colors duration-300
                        group-hover:text-white
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                      font-16
                      text-gray-500
                      transition-colors duration-300
                      group-hover:text-blue-100
                    "
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <TrustImage3D />
        </div>
      </div>
    </section>
  );
};

export default TrustSecurity;

//-----compo---
const TrustImage3D = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-50, 50], [12, -12]), {
    stiffness: 10,
    damping: 28,
  });

  const rotateY = useSpring(useTransform(x, [-50, 50], [-12, 12]), {
    stiffness: 10,
    damping: 28,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;

    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[400px] p-4 lg:p-0 md:h-[730px] perspective-[1200px]"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative w-full h-full rounded-3xl overflow-hidden
                   shadow-[0_40px_90px_rgba(0,0,0,0.35)]
                   will-change-transform"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-600/20 opacity-0 hover:opacity-100 transition-opacity duration-500 z-10" />

        <motion.img
          src="/images/home/trustSecurity/trust-building.webp"
          alt="Trust & Security"
          className="w-full h-full object-cover"
          style={{ transform: 'translateZ(40px)' }}
          loading="lazy"
        />
      </motion.div>
    </motion.div>
  );
};
