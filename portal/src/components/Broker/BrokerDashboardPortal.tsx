import type { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import { HiArrowLongRight } from 'react-icons/hi2';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function BrokerDashboardPortal() {
    const { isAuthenticated,role } = useSelector(
      (state: RootState) => state.authLogin
    );
  return (
    <section className="w-full pt-16 pb-0 lg:pt-24 font-work">
      <div className="relative mx-4 lg:mx-10 overflow-hidden rounded-[2rem] bg-[#0A192F] py-16 lg:py-24">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/images/broker/join-bg.png"
            className="w-full h-full object-cover"
            alt="Digital Portal background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/40 to-transparent" />
        </div>

        {/* Decorative Glows */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 px-6 text-center max-w-4xl mx-auto text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
          >
            Digital Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Partner Suite
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-xl text-base md:text-lg text-white/70 leading-relaxed font-medium"
          >
            Manage your entire partner journey—from lead generation to
            commission settlement—through our unified, institutional-grade
            digital portal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-14"
          >
            <Link
              to={`${isAuthenticated && role === 'Broker' ? '/dashboard' : '/login'}`}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] px-6 py-2.5 text-base font-bold text-white shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.05] active:scale-[0.95]"
            >
              Access Partner Portal
              <span className="transition-transform group-hover:translate-x-1.5">
                <HiArrowLongRight size={20} />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
