/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import Congrats from '../Congrats';
import { useLocalUser } from '@/hooks/useLocalUser';
import { motion } from 'framer-motion';
import {
  BsPersonBadge,
  BsCloudUpload,
  BsArrowRightShort,
  BsFillPersonCheckFill,
} from 'react-icons/bs';

export default function DirectorsOrUserKycStep({
  stepKey,
  currentStep,
  isStepCompleted,
  handleRouteForStep,
}: any) {
  const user = useLocalUser() as {
    kycStatus?: string;
    kyc?: {
      status?: string;
      rejectionReason?: string;
    };
  };

  const kycStatus = user?.kycStatus?.toLowerCase();
  const rejectionReason = user?.kyc?.rejectionReason;

  const isDirectors = stepKey === 'directors';
  const title = isDirectors ? 'Directors KYC' : 'User KYC';
  const subtitle = isDirectors
    ? 'Verify director identity in two simple steps'
    : 'Complete your personal identity verification';

  const isRejected = kycStatus === 'rejected';

  const stepCards = [
    {
      id: 1,
      title: isDirectors ? 'Director Identity Info' : 'Identity Information',
      description: 'Provide basic identity details for verification.',
      icon: isDirectors ? BsFillPersonCheckFill : BsPersonBadge,
      color: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-500',
    },
    {
      id: 2,
      title: 'Documents Upload',
      description: 'Upload required identification documents securely.',
      icon: BsCloudUpload,
      color: 'from-green-500/20 to-green-600/5',
      iconColor: 'text-green-500',
    },
  ];

  if (isStepCompleted(currentStep) && !isRejected) {
    const message =
      kycStatus === 'approved'
        ? isDirectors
          ? 'Your Directors KYC has been approved.'
          : 'Your KYC has been approved.'
        : isDirectors
          ? 'Your Directors KYC has been submitted and is under review.'
          : 'Your KYC has been submitted and is under review.';

    return (
      <Congrats
        title={title}
        highlightText={message}
        showNext={!isStepCompleted(3)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col py-5 md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
            {title}
          </h2>
          <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <button
          onClick={() => handleRouteForStep(currentStep)}
          className="group relative px-5 py-2.5 bg-[#1F4FE0] hover:bg-[#153eb2]
                     text-white font-12 font-semibold rounded-lg shadow-sm
                     hover:shadow-md transition-all duration-300
                     flex items-center gap-2 overflow-hidden cursor-pointer"
        >
          <span className="relative z-10">
            {isRejected ? 'Resubmit KYC' : 'Complete Now!'}
          </span>
          <BsArrowRightShort className="relative z-10 text-lg group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {isRejected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20"
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1 font-12 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            KYC Rejected
          </div>
          <p className="font-12 text-red-500 dark:text-red-400/90 pl-3.5">
            {rejectionReason ||
              'Your KYC was rejected. Please review and resubmit.'}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stepCards.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-6 rounded-xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10
                       hover:shadow-md transition-all duration-300 cursor-default overflow-hidden"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color}
                            rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />

            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div
                className={`p-3.5 rounded-xl bg-gradient-to-br ${step.color} border border-[#E3E7EE] dark:border-white/10
                              group-hover:scale-110 transition-all duration-500 shadow-sm`}
              >
                <step.icon className={`text-2xl ${step.iconColor}`} />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                  Step {step.id}/2
                </span>
                <h3 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="font-12 text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
