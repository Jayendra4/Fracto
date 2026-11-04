import Congrats from '../Congrats';
import { useLocalUser } from '@/hooks/useLocalUser';
import { motion } from 'framer-motion';
import {
  BsBuildingCheck,
  BsShieldCheck,
  BsBriefcase,
  BsCloudUpload,
  BsArrowRightShort,
} from 'react-icons/bs';

const stepCards = [
  {
    id: 1,
    title: 'Company Basic Details',
    description:
      'Enter your company details to complete your company KYB form.',
    icon: BsBuildingCheck,
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-500',
  },
  {
    id: 2,
    title: 'Tax & Regulatory Details',
    description:
      'Enter your company’s text and regulatory details to complete your company KYB form.',
    icon: BsShieldCheck,
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-500',
  },
  {
    id: 3,
    title: 'Business Profile',
    description:
      'Provide details about your company’s business activity and operational footprint.',
    icon: BsBriefcase,
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-500',
  },
  {
    id: 4,
    title: 'Documents Upload',
    description:
      'Provide upload the required documents. It only takes a few minutes...',
    icon: BsCloudUpload,
    color: 'from-green-500/20 to-green-600/5',
    iconColor: 'text-green-500',
  },
];

interface KybStepProps {
  isStepCompleted: (step: number) => boolean;
  handleRouteForStep: (step: number) => void;
}

export default function KybStep({
  isStepCompleted,
  handleRouteForStep,
}: KybStepProps) {
  const user = useLocalUser() as {
    kybStatus?: string;
    kyb?: {
      status?: string;
      rejectionReason?: string;
    };
  };

  const kybStatus = user?.kybStatus?.toLowerCase();
  const rejectionReason = user?.kyb?.rejectionReason;
  const isRejected = kybStatus === 'rejected';

  if (isStepCompleted(1) && !isRejected) {
    const message =
      kybStatus === 'approved'
        ? 'Your company KYB has been approved.'
        : 'Your company KYB has been submitted and is under review.';

    return (
      <Congrats
        title="Company KYB"
        highlightText={message}
        showNext={!isStepCompleted(2)}
        onNext={() => handleRouteForStep(2)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col py-6 md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
            Company KYB
          </h2>
          <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400">
            Complete these 4 steps to verify your business identity
          </p>
        </div>

        <button
          onClick={() => handleRouteForStep(1)}
          className="group relative px-5 py-2.5 bg-[#1F4FE0] hover:bg-[#153eb2]
                     text-white font-12 font-semibold rounded-lg shadow-sm
                     hover:shadow-md transition-all duration-300
                     flex items-center gap-2 overflow-hidden cursor-pointer"
        >
          <span className="relative z-10">
            {isRejected ? 'Resubmit KYB' : 'Complete Now!'}
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
            KYB Rejected
          </div>
          <p className="font-12 text-red-500 dark:text-red-400/90 pl-3.5">
            {rejectionReason ||
              'Your company KYB was rejected. Please review the details and resubmit.'}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4">
        {stepCards.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-5 rounded-xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10
                       hover:shadow-md transition-all duration-300 cursor-default"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color}
                            rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />

            <div className="relative z-10 flex items-start gap-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${step.color} border border-[#E3E7EE] dark:border-white/10
                              group-hover:scale-110 transition-transform duration-500`}
              >
                <step.icon className={`text-xl ${step.iconColor}`} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                    Step {step.id}/4
                  </span>
                </div>
                <h3 className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="font-12 text-gray-500 dark:text-gray-400 leading-relaxed">
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
