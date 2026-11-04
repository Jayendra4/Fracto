import { useOnboarding } from '@/hooks';
import { CiShare1 } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type KycHeaderProps = {
  scrolled?: boolean;
};

export default function KycHeader({ scrolled }: KycHeaderProps) {
  const {
    isApproved,
    isRejected,
    isUnderReview,
    isCompany,
    kycMessage,
    nextStepRoute,
  } = useOnboarding();

  if (isApproved) return null;

  const title = (() => {
    if (isCompany) {
      if (isRejected) return 'Verification Action Required';
      if (isUnderReview) return 'Verification Under Review';
      return 'Action Required: Complete Onboarding';
    }

    if (isRejected) return 'KYC Action Required';
    if (isUnderReview) return 'KYC Under Review';
    return 'Action Required: Complete KYC';
  })();

  const ctaText = isRejected
    ? 'Resubmit Now'
    : isUnderReview
      ? 'View Status'
      : 'Complete Now';

  // Map relative nextStepRoute to absolute dashboard routes
  const redirectPath = (() => {
    if (isCompany) return '/dashboard/onboarding';

    if (nextStepRoute) {
      if (nextStepRoute.startsWith('/dashboard')) return nextStepRoute;
      return `/dashboard${nextStepRoute}`;
    }

    // Fallbacks
    return '/dashboard/kyc';
  })();

  return (
    <AnimatePresence>
      {!scrolled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full text-white bg-gradient-to-r from-[#041221] via-[#0A1D31] to-[#041221] border-b border-white/5 overflow-hidden"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-[1600px] mx-auto px-4 lg:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex-1 space-y-1">
              <h3 className="text-center md:text-left font-20 md:font-24 font-bold tracking-tight text-white drop-shadow-sm">
                {title}
              </h3>
              <p className="text-center text-[#B0BCC8] md:text-left text-[12px] lg:text-[14px] leading-relaxed font-medium max-w-[900px]">
                {kycMessage}
              </p>
            </div>

            <Link
              to={redirectPath}
              className="group relative flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 font-bold text-sm lg:text-base rounded-xl active:scale-95"
            >
              <CiShare1 className="text-lg transition-transform group-hover:rotate-12" />
              <span>{ctaText}</span>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
