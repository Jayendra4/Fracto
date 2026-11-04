import { motion } from 'framer-motion';
import { BsPatchCheck } from 'react-icons/bs';

type Props = {
  status: string;
  isCompany: boolean;
  rejectionReason?: string | null;
  onResubmit?: () => void;
};

const statusConfig: Record<
  string,
  {
    title: string;
    headline: string;
    message: string;
    color: string;
    badgeClass: string;
  }
> = {
  draft: {
    title: 'KYC Pending',
    headline: 'Complete your verification',
    message: 'Please complete the required steps to proceed.',
    color: '#B7791F',
    badgeClass:
      'bg-[#FFF4E0] text-[#B7791F] dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  submitted: {
    title: 'KYC Submitted',
    headline: 'Your details have been submitted',
    message: 'Our team is reviewing your information.',
    color: '#1F4FE0',
    badgeClass:
      'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-blue-400',
  },
  under_review: {
    title: 'Under Review',
    headline: 'Verification in progress',
    message: 'This usually takes 24–48 hours.',
    color: '#1F4FE0',
    badgeClass:
      'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-blue-400',
  },
  pending: {
    title: 'Under Review',
    headline: 'Verification in progress',
    message: 'This usually takes 24–48 hours.',
    color: '#1F4FE0',
    badgeClass:
      'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-blue-400',
  },
  approved: {
    title: 'Success',
    headline: 'Congratulations! You’re verified.',
    message: 'No further action is required at the moment.',
    color: '#0F9D58',
    badgeClass:
      'bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400',
  },
  rejected: {
    title: 'Verification Failed',
    headline: 'Your verification was rejected',
    message: 'Please review and resubmit your information.',
    color: '#C0392B',
    badgeClass:
      'bg-[#FBE3E0] text-[#C0392B] dark:bg-red-900/20 dark:text-red-400',
  },
};

export default function KycSuccess({
  status,
  rejectionReason,
  onResubmit,
}: Props) {
  const normalizedStatus = status?.toLowerCase();
  const config = statusConfig[normalizedStatus] ?? statusConfig.draft;

  return (
    <div className="h-full w-full flex items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[520px] rounded-xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm px-6 py-10 md:py-12 text-center flex flex-col gap-4 items-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 140 }}
          className="relative"
        >
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-20"
            style={{ backgroundColor: config.color }}
          />
          <BsPatchCheck
            size={44}
            style={{ color: config.color }}
            className="relative z-10"
          />
        </motion.div>

        <div className="space-y-2">
          <h2
            className="font-serif font-24 md:font-30 font-semibold"
            style={{ color: config.color }}
          >
            {config.title}
          </h2>

          <p className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white">
            {config.headline}
          </p>

          <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {config.message}
          </p>
        </div>

        {normalizedStatus === 'approved' && (
          <span
            className={`mt-2 px-4 py-2 rounded-lg font-12 font-bold ${config.badgeClass}`}
          >
            Verification Complete
          </span>
        )}

        {normalizedStatus === 'rejected' && rejectionReason && (
          <p
            className={`px-4 py-2 rounded-lg font-12 max-w-sm mx-auto ${config.badgeClass}`}
          >
            <span className="font-semibold">Reason: </span>
            {rejectionReason}
          </p>
        )}

        {normalizedStatus === 'rejected' && (
          <button
            type="button"
            onClick={onResubmit}
            className="mt-2 px-4 py-2 rounded-lg font-12 font-semibold text-white shadow-md transition hover:brightness-110"
            style={{ backgroundColor: config.color }}
          >
            Re-submit KYC
          </button>
        )}
      </motion.div>
    </div>
  );
}
