import { useOnboarding } from '@/hooks';
// import type { RootState } from '@/redux/store';
import { CiShare1 } from 'react-icons/ci';
// import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeaderBanner({
  scrolled,
}: {
  scrolled: boolean;
}) {
  const {
    isApproved,
    isRejected,
    isUnderReview,
    isCompany,
    kycMessage,
  } = useOnboarding();

  if (isApproved) return null;

  const title = (() => {
    if (isCompany) {
      if (isRejected) return 'KYB / Directors KYC Rejected';
      if (isUnderReview) return 'KYB & Directors KYC Under Review';
      return 'Complete Your KYB & Directors KYC';
    }

    if (isRejected) return 'KYC Rejected';
    if (isUnderReview) return 'KYC Under Review';
    return 'Complete Your KYC Verification';
  })();

  const ctaText = isRejected
    ? 'Resubmit Now'
    : isUnderReview
      ? 'View Status'
      : 'Complete Now';

const redirectPath = isCompany ? '/dashboard/onboarding' : '/dashboard/kyc';

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={
        scrolled ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }
      }
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden w-full bg-[#041221] flex md:flex-row flex-col items-center justify-between gap-3 sm:gap-4 py-3 px-[20px] lg:px-[50px] xl:px-[40px] 1xl:px-[30px] 2xl:px-[40px] 3xl:px-[150px]"
    >
      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none animate-pulse" />
      <div className="flex relative z-10 flex-col gap-1 text-white ">
        <h3
          className={`leading-[100%] whitespace-nowrap font-semibold ${
            scrolled ? '' : 'font-24'
          }`}
        >
          {title}
        </h3>

        <p
          className={`hidden md:block text-white/70 font-normal text-[12px] lg:text-[14px] leading-[20px] ${
            scrolled ? 'hidden' : 'block'
          }`}
        >
          {kycMessage}
        </p>
      </div>
      <Link
        to={redirectPath}
        className={`relative z-10 max-w-[160px] px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-[0_0_15px_rgba(96,165,250,0.5)] hover:shadow-[0_0_25px_rgba(96,165,250,0.8)] hover:-translate-y-0.5 hover:brightness-110 font-16 rounded-xl font-medium flex flex-row justify-center items-center gap-2 cursor-pointer whitespace-nowrap w-full md:w-auto transition-all duration-300 ${
          scrolled ? 'border-0 rounded-r-xl' : 'border-0'
        }`}
      >
        <CiShare1
          size={24}
          className="group-hover:rotate-12 transition-transform duration-300"
        />
        <span>{ctaText}</span>
      </Link>
    </motion.div>
  );
}
