import { PiMedalLight } from 'react-icons/pi';
import BasicInfoCard from './BasicInfoCard';
import LicenseCard from './LicenseCard';
import ProfileImageCard from './ProfileImageCard';
import PerformanceCard from './PerformanceCard';
import { useLocalUser } from '@/hooks/useLocalUser';
import { useState, useEffect } from 'react';
import { useMyBankAccounts } from '@/api';
import { useUpdateBankStatus } from '@/api/bank.api';
import BankDetailsCard from '../UserProfile/BankDetailsCard';
import AddBankAccountModal from '../../Wallet/AddBankAccountModal';
import KycDocuments from '../UserProfile/KycDocuments';
import { useMyUpiAccount, useUpdateUpiStatus } from '@/api/upi.api';
import AddUpiModal from '../UserProfile/AddUpiModal';
import UpiDetailsCard from '../UserProfile/UpiDetailCard';
import { FiCopy, FiCheck } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { motion } from 'framer-motion';

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

export default function BrokerProfile() {
  const user = useLocalUser();
  const { data } = useMyBankAccounts();
  const { mutate: updateBankStatus } = useUpdateBankStatus();
  const [openAddBank, setOpenAddBank] = useState(false);
  const { data: upiRes } = useMyUpiAccount();
  const { mutate: updateUpiStatus } = useUpdateUpiStatus();
  const [openAddUpi, setOpenAddUpi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const code = user?.referralCode || localStorage.getItem('referralCode');
    if (code) setReferralCode(code);
  }, [user]);

  const copyReferralCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const upis = upiRes?.success && Array.isArray(upiRes.data) ? upiRes.data : [];
  const banks = data?.success && Array.isArray(data.data) ? data.data : [];

  if (!user) {
    return (
      <section className="w-full text-[var(--fg)] p-10">
        Loading profile...
      </section>
    );
  }
  return (
    <section className="w-full text-[var(--fg)] font-work pt-38 lg:pt-44 pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className=" w-full max-w-[1600px] mx-auto space-y-6"
      >
        <motion.div
          variants={itemVariants}
          className="flex md:flex-row flex-col items-start justify-between pb-6 border-b border-gray-150 dark:border-white/10 gap-4"
        >
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-semibold text-[#0B2545] dark:text-white">
              Profile
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your Channel Partner profile and credentials.
            </p>
            {referralCode && (
              <div className="flex items-center gap-3 mt-4 bg-blue-50 dark:bg-blue-950/20 w-fit px-3 sm:px-5 py-2 rounded-xl border border-blue-200 dark:border-blue-900/30">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Your Referral Code:
                </span>
                <span className="text-base font-bold text-[#0B2545] dark:text-white tracking-widest">
                  {referralCode}
                </span>
                <button
                  onClick={copyReferralCode}
                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition relative group cursor-pointer"
                  title="Copy Referral Code"
                >
                  {copied ? (
                    <FiCheck className="text-emerald-500" size={16} />
                  ) : (
                    <FiCopy size={16} />
                  )}
                  {copied && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--fg)] text-[var(--bg)] text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl animate-bounce">
                      Copied!
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
          {!user?.isVerified && (
            <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm mt-4 md:mt-0">
              <PiMedalLight
                size={20}
                className="text-emerald-600 dark:text-emerald-400"
              />
              Certified Real Estate Channel Partner (CREB)
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            className="xl:col-span-2 space-y-6"
          >
            <BasicInfoCard user={user} />
            <LicenseCard user={user} />
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="space-y-6 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-xl h-fit overflow-hidden"
          >
            <ProfileImageCard user={user} />
            <PerformanceCard />
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <KycDocuments
            isDocumentUploaded={user.isDocumentUploaded}
            documents={user.entityDocument}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <BankDetailsCard
            banks={banks}
            onAddBank={() => setOpenAddBank(true)}
            onSetActive={(id, isActive) =>
              updateBankStatus({ bankId: id, payload: { isActive } })
            }
            onDelete={(id) =>
              updateBankStatus({ bankId: id, payload: { isDeleted: true } })
            }
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <UpiDetailsCard
            upis={upis}
            onAddUpi={() => setOpenAddUpi(true)}
            onSetActive={(id, isActive) =>
              updateUpiStatus({ upiId: id, payload: { isActive } })
            }
            onDelete={(id) =>
              updateUpiStatus({ upiId: id, payload: { isDeleted: true } })
            }
          />
        </motion.div>
      </motion.div>

      {openAddBank && (
        <AddBankAccountModal
          open={openAddBank}
          onClose={() => setOpenAddBank(false)}
        />
      )}
      {openAddUpi && (
        <AddUpiModal open={openAddUpi} onClose={() => setOpenAddUpi(false)} />
      )}
    </section>
  );
}

export function BrokerProfileInput({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 min-h-[38px] flex items-center">
        {value || '-'}
      </div>
    </div>
  );
}

export function BrokerStat({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: IconType;
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="group min-w-0 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 rounded-xl p-2 md:p-4 text-center shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div
        className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
      >
        <Icon className="w-3 h-3 md:w-4 md:h-4" />
      </div>
      <p className="text-[9px] md:text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight break-words">
        {label}
      </p>
      <p className="text-sm md:text-base font-bold text-[#0B2545] dark:text-white mt-1 md:mt-1.5 truncate">
        {value}
      </p>
    </div>
  );
}
