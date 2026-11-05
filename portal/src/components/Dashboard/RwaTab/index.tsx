import { Link, useLocation, useParams } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import {
  BsInfoCircle,
  BsCardChecklist,
  BsCurrencyDollar,
  BsArrowRightShort,
  BsPlusLg,
  BsQuestionDiamond,
} from 'react-icons/bs';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const rwaSteps = [
  {
    id: 1,
    title: 'Asset Basic Information',
    description:
      'Enter your Asset Basic Information to complete your company RWA form.',
    icon: BsInfoCircle,
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-500',
  },
  {
    id: 2,
    title: 'Ownership & Title Details',
    description:
      'Enter your ownership & title details to complete your company KYB form.',
    icon: BsCardChecklist,
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-500',
  },
  {
    id: 3,
    title: 'Financial & Valuation Details',
    description:
      'Provide Financial & Valuation Details. It only takes a few minutes...',
    icon: BsCurrencyDollar,
    color: 'from-green-500/20 to-green-600/5',
    iconColor: 'text-green-500',
  },
];

export default function RwaTab() {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.authLogin.user);
  const { assetId } = useParams();
  const rwaFormCount = user?.rwaFormCount || 0;
  const brokerReferredCount = user?.brokerReferredAssetsCount || 0;
  const hasAssets = rwaFormCount > 0 && user?.hasSubmittedRwaForm === true;

  const [showSuccess, setShowSuccess] = useState(false);
  const { role } = useSelector((state: RootState) => state.authLogin);
  const isBroker = role === 'Broker';

  useEffect(() => {
    if (location.state?.submissionSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="relative min-h-screen font-work">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[var(--primary)]/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-[1600px] mx-auto w-full flex-col space-y-12  pt-32 md:pt-40 text-[var(--fg)] px-4 lg:px-12 pb-7"
      >
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20, marginTop: 0 }}
              className="w-full bg-green-500/10 border border-green-500/20 backdrop-blur-md rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-green-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-500 p-2 rounded-full shadow-lg shadow-green-500/40">
                  <FaCheckCircle className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="text-green-500 font-bold text-lg">
                    Asset Successfully Submitted!
                  </h4>
                  <p className="text-sm text-[var(--fg)]/60">
                    Your RWA asset details are under review. You have now
                    onboarded{' '}
                    <span className="font-bold text-green-500">
                      {rwaFormCount}
                    </span>{' '}
                    {rwaFormCount === 1 ? 'asset' : 'assets'}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-green-500 hover:text-green-400 px-4 py-2 font-bold transition-colors uppercase text-xs tracking-widest bg-green-500/10 rounded-lg"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-4"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--fg)]">
              {hasAssets ? 'Manage Your Assets' : 'Master RWA Form'}
            </h2>
            <p className="font-18 text-[var(--fg)]/50 font-medium max-w-md">
              {hasAssets
                ? 'Review your onboarded assets or submit additional RWA forms below to expand your portfolio.'
                : 'Complete the three-step process to onboard your real-world assets into our ecosystem.'}
            </p>
          </div>

          <div
            className={`flex flex-col ${isBroker ? 'lg:flex-row' : 'xl:flex-row'}  items-center gap-4 w-full md:w-auto`}
          >
            {!isBroker && (
              <Link
                to={ROUTES.REFERRED_ASSETS}
                className={`flex-1 md:flex-none whitespace-nowrap flex items-center justify-center gap-3 text-[var(--fg)] bg-[var(--bg)]/40 backdrop-blur-sm border border-[var(--fg)]/10 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-[var(--fg)]/5 ${brokerReferredCount === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-[var(--bg)]/60'}`}
              >
                Broker Referred Assets
                {brokerReferredCount > 0 && (
                  <span className="bg-[#4F46E5] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/30">
                    {brokerReferredCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              to={ROUTES.ONBOARDED_ASSETS}
              className={`flex-1 md:flex-none whitespace-nowrap flex items-center justify-center gap-3 text-[var(--fg)] bg-[var(--bg)]/40 backdrop-blur-sm border border-[var(--fg)]/10 px-6 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-[var(--fg)]/5 ${
                isBroker
                  ? brokerReferredCount === 0
                    ? 'opacity-50 cursor-not-allowed pointer-events-none'
                    : 'hover:bg-[var(--bg)]/60'
                  : !hasAssets
                    ? 'opacity-50 cursor-not-allowed pointer-events-none'
                    : 'hover:bg-[var(--bg)]/60'
              }`}
            >
              Onboarded Assets
              {isBroker
                ? brokerReferredCount > 0 && (
                    <span className="bg-[#4F46E5] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/30">
                      {brokerReferredCount}
                    </span>
                  )
                : hasAssets && (
                    <span className="bg-[#4F46E5] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/30">
                      {rwaFormCount}
                    </span>
                  )}
            </Link>
            <Link
              to={`/dashboard/rwa/rwa-form/${assetId}`}
              className="flex-1 md:flex-none bg-gradient-to-r from-[#4F46E5] to-[#2563EB] shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 text-white cursor-pointer flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 group"
            >
              {hasAssets ? (
                <>
                  <BsPlusLg className="group-hover:rotate-90 transition-transform duration-300" />
                  <span>Submit Another Asset</span>
                </>
              ) : (
                <>
                  <span>Get Started Now</span>
                  <BsArrowRightShort className="text-2xl group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--fg)]/10 to-transparent"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rwaSteps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              custom={index}
              className="group relative p-8 rounded-3xl bg-[var(--inner-card)] border border-[var(--fg)]/5 
                         hover:shadow-2xl hover:shadow-[var(--primary)]/10 
                         transition-all duration-500 cursor-default flex flex-col items-center text-center space-y-6 overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} 
                              rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div
                className={`relative z-10 p-5 rounded-2xl bg-gradient-to-br ${step.color} border border-[var(--fg)]/5 
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}
              >
                <step.icon className={`text-4xl ${step.iconColor}`} />
              </div>

              <div className="relative z-10 space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-black text-[var(--fg)]/30 bg-[var(--fg)]/5 px-3 py-1 rounded-full">
                  Phase 0{step.id}
                </span>
                <h3 className="text-xl font-semibold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--fg)]/50 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              <div className="w-full h-1 bg-[var(--fg)]/5 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  className={`h-full bg-gradient-to-r ${step.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="p-10 rounded-[2rem] bg-gradient-to-br from-[var(--primary)]/5 via-[var(--inner-card)] to-transparent border border-[var(--fg)]/10 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-[var(--primary)]/10 transition-colors duration-500" />

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 group-hover:scale-110 transition-transform duration-300">
              <BsQuestionDiamond className="text-3xl text-[var(--primary)]" />
            </div>
            <div className="text-center md:text-left space-y-1">
              <h4 className="text-2xl font-semibold tracking-tight">
                Need Assistance?
              </h4>
              <p className="text-[var(--fg)]/60 font-medium max-w-md leading-relaxed">
                Connect with our expert team to navigate the RWA onboarding
                process seamlessly.
              </p>
            </div>
          </div>

          <button className="relative z-10 px-8 py-4 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group/btn">
            <span>Contact Support</span>
            <BsArrowRightShort className="text-2xl group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
