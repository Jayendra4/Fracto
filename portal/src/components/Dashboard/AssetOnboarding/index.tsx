import { useOnboarding } from '@/hooks';
import KycHeader from '../KycHeader';
import CompanyForm from '@/components/Form/CompanyForm';
import {
  assetOnboardingGroup1,
  assetOnboardingGroup2,
  assetOnboardingGroup3,
  assetOnboardingGroup4,
} from '@/constants/assetOnboarding.constants';
import { useBrokerInvite } from '@/api/brokerInvite.api';
import { useState } from 'react';
import StatusModal from '@/components/Modals/Status';
import { useNavigate } from 'react-router-dom';
import KycGate from '@/components/KycGate';
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

export default function AssetOnboarding() {
  const { isCompany, hasDirectors } = useOnboarding();
  const isUserKycCompleted = !isCompany && hasDirectors;

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const [statusMessage, setStatusMessage] = useState('');

  const { mutateAsync: inviteBroker, isPending } = useBrokerInvite();
  const navigate = useNavigate();

  const handleSubmit = async (formData: any) => {
    const payload = {
      assetId: Number(formData.assetId), 
      assetOwnerEmail: formData.ownerEmail,
      firstName: formData.ownerFirstName,
      lastName: formData.ownerLastName,
      mobile: Number(formData.ownerMobile),
      proposedCommissionPct: Number(formData.proposedCommissionPct),
      brokerNote: formData.brokerNote,
    };

    try {
      const res = await inviteBroker(payload);

      if (!res?.success) {
        throw new Error(res?.message || 'Asset onboarding failed');
      }

      setStatusType('success');
      setStatusMessage(
        'Asset onboarding request has been submitted successfully.'
      );
      setStatusOpen(true);

      setTimeout(() => {
        navigate('/dashboard/referrals');
      }, 1500);
    } catch (error: any) {
      setStatusType('error');
      setStatusMessage(
        error?.message || 'Something went wrong while submitting the request.'
      );
      setStatusOpen(true);
    }
  };

  return (
    <section className="w-full text-[var(--fg)] font-work pt-36 xl:pt-40 pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* KYC Header */}
        {!isUserKycCompleted && (
          <motion.div
            variants={itemVariants}
            className="border-t border-b border-[#8AA2BC]"
          >
            <KycHeader />
          </motion.div>
        )}

        <div className="px-4 lg:px-10 w-full">
          <div className="max-w-[1600px] mx-auto space-y-4 w-full py-10 pt-4">
            {/* Heading */}
            <motion.div
              variants={itemVariants}
              className="flex items-start justify-between"
            >
              <div>
                <h1 className="text-2xl font-semibold">Asset Onboarding</h1>
                <p className="text-sm text-[var(--fg)]/40">
                  Step-by-step compliance-guided onboarding
                </p>
              </div>
            </motion.div>

            {/* Form */}
            <KycGate message="Asset onboarding is available only after KYC approval.">
              <motion.div
                variants={itemVariants}
                className="rounded-xl bg-gradient-to-r from-[var(--dark-card)] to-[var(--card)] border border-[var(--fg)]/5 shadow-sm p-6"
              >
                <CompanyForm
                  group1={assetOnboardingGroup1}
                  group2={assetOnboardingGroup2}
                  group3={assetOnboardingGroup3}
                  group4={assetOnboardingGroup4}
                  onSubmit={handleSubmit}
                  isAssetOnboarding={true}
                  button={{
                    label: isPending
                      ? 'Submitting...'
                      : 'Generate Onboarding Request',
                    variant: 'formButton',
                  }}
                />
              </motion.div>
            </KycGate>
          </div>
        </div>

        {/* Status Modal */}
        <StatusModal
          open={statusOpen}
          status={statusType}
          title={
            statusType === 'success'
              ? 'Onboarding Request Submitted'
              : 'Submission Failed'
          }
          message={statusMessage}
          onClose={() => {
            setStatusOpen(false);
            if (statusType === 'success') {
              navigate('/dashboard/referrals');
            }
          }}
          onContinue={() => {
            setStatusOpen(false);
            if (statusType === 'success') {
              navigate('/dashboard/referrals');
            }
          }}
        />
      </motion.div>
    </section>
  );
}
