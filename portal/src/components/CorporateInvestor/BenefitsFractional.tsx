import { motion } from 'framer-motion';
import {
  HiArrowDownTray,
  HiArrowsRightLeft,
  HiCurrencyRupee,
  HiOutlineArrowsRightLeft,
  HiShieldCheck,
  HiDevicePhoneMobile,
} from 'react-icons/hi2';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const Card = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    transition={{ delay }}
    className="relative group p-8 lg:p-10 rounded-[2.5rem] bg-[var(--card)] border border-[var(--fg)]/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-blue-500/10 transition-colors duration-500" />

    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-6 group-hover:bg-[#4F46E5] group-hover:text-white transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
        {icon}
      </div>
      <h4 className="font-24 font-bold mb-4 tracking-tight group-hover:text-[#4F46E5] transition-colors">
        {title}
      </h4>
      <p className="font-18 text-[var(--fg)]/70 leading-relaxed group-hover:text-[var(--fg)]/90 transition-colors">
        {description}
      </p>
    </div>
  </motion.div>
);

function BenefitsFractional() {
  return (
    <section className="overflow-hidden bg-[var(--bg)] text-[var(--fg)] font-work py-16 lg:py-24">
      <div className="px-4 lg:px-10">
        <div className="mx-auto max-w-[1600px]">
          <motion.div
            className="text-center max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-48 font-bold tracking-tight">
              Benefits of{' '}
              <span className="text-[#4F46E5]">Structural Investment</span>{' '}
              <br className="hidden lg:block" /> with Fracto
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] mx-auto mt-6 rounded-full" />
            <p className="mt-8 font-20 text-[var(--fg)]/70 max-w-2xl mx-auto">
              Empowering corporate entities to build a diversified portfolio of
              income-generating real estate with institutional-grade security.
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <Card
              delay={0}
              icon={<HiArrowDownTray size={28} />}
              title="Lower Capital Commitment"
              description="Participate in premium real estate opportunities with lower capital requirements, enabling diversified exposure, gradual portfolio growth, and more efficient capital allocation."
            />

            <Card
              delay={0.1}
              icon={<HiArrowsRightLeft size={28} />}
              title="Ownership Flexibility"
              description="Choose from commercial, residential, hospitality, or industrial assets, allowing participation aligned with individual financial objectives and preferred investment strategies."
            />

            <Card
              delay={0.2}
              icon={<HiCurrencyRupee size={28} />}
              title="Passive Income Generation"
              description="Access opportunities designed to generate recurring income through rentals, leases, or other asset-backed revenue streams, supporting long-term wealth creation."
            />

            <Card
              delay={0.3}
              icon={<HiOutlineArrowsRightLeft size={28} />}
              title="Liquidity Options"
              description="Benefit from structured exit pathways and resale mechanisms, offering flexibility to manage participation and adapt investment decisions when needed."
            />

            <Card
              delay={0.4}
              icon={<HiShieldCheck size={28} />}
              title="Secure & Transparent"
              description="Invest through a professionally governed platform with verified documentation, regulatory compliance, trustee oversight, and transparent reporting throughout the asset lifecycle."
            />

            <Card
              delay={0.5}
              icon={<HiDevicePhoneMobile size={28} />}
              title="Fully Digital Experience"
              description="Complete onboarding, verification, investment management, and performance tracking online through a seamless platform accessible anytime from anywhere."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BenefitsFractional;
