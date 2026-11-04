import { IoClose } from 'react-icons/io5';
import { FaCheck } from 'react-icons/fa';
import { MdErrorOutline } from 'react-icons/md';
import { FaArrowRight } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import CommonModal from '@/components/CommonModal';

type StatusType = 'success' | 'error';

interface StatusModalProps {
  open: boolean;
  redirect?: boolean;
  status: StatusType;
  title?: string;
  message?: string;
  subMessage?: string;
  onClose: () => void;
  onContinue?: () => void;
  onRedirect?: () => void;
}

const STATUS_CONFIG = {
  success: {
    bar: 'bg-green-500',
    title: 'text-green-500',
    button: 'bg-green-500 shadow-green-500/25',
    mobileIconBg: 'bg-green-500',
    mobileIcon: <FaCheck className="text-black text-sm" />,
    image: '/images/complete.svg',
    buttonText: 'Continue',
  },
  error: {
    bar: 'bg-red-500',
    title: 'text-red-500',
    button: 'bg-red-600 shadow-red-500/25',
    mobileIconBg: 'bg-red-500',
    mobileIcon: <MdErrorOutline className="text-black text-sm" />,
    image: '/images/error.svg',
    buttonText: 'Try Again',
  },
};

export default function StatusModal({
  open,
  status,
  title,
  message,
  subMessage,
  onClose,
  onContinue,
  onRedirect,
  redirect,
}: StatusModalProps) {
  if (!open) return null;

  const config = STATUS_CONFIG[status];

  return (
    <CommonModal
      isOpen={open}
      onClose={onClose}
      hideCloseButton={true}
      className="max-w-[420px]"
      contentClassName="p-0"
    >
      <div className={`h-1 w-full ${config.bar}`} />
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-[var(--fg)]/80 hover:text-[var(--fg)] z-10"
      >
        <IoClose size={22} />
      </button>

      <div className="p-6">
        <div className="hidden sm:flex flex-col items-center text-center gap-4">
          <img src={config.image} className="w-[100px] mb-6" alt="Status" />

          <h2 className={`text-xl font-semibold ${config.title}`}>
            {title ?? (status === 'success' ? 'Success' : 'Error')}
          </h2>

          <p className="text-[var(--fg)] text-sm">{message}</p>
          <p className="text-[var(--fg)]/60 text-sm">{subMessage}</p>

          {redirect ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRedirect}
              className={`group relative mt-4 w-full rounded-2xl py-3.5 px-6 font-semibold text-white transition-all shadow-lg overflow-hidden flex items-center justify-center gap-2 ${config.button}`}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center justify-center w-full gap-2">
                {config.buttonText}
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className={`group relative mt-4 w-full rounded-2xl py-3.5 px-6 font-semibold text-white transition-all shadow-lg overflow-hidden flex items-center justify-center gap-2 ${config.button}`}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center justify-center w-full gap-2">
                {config.buttonText}
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          )}
        </div>
        <div className="flex sm:hidden items-center gap-3">
          <img src={config.image} className="w-[40px] mb-6" alt="Status" />

          <div className="flex-1">
            <h3 className={`font-semibold ${config.title}`}>
              {title ?? (status === 'success' ? 'Success' : 'Error')}
            </h3>
            <p className="text-(--fg)/70 text-sm">{message}</p>
          </div>
        </div>
      </div>
    </CommonModal>
  );
}
