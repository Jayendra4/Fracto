import RwaAssetForm from '@/components/Form/RwaAssetForm';
import RwaForm from '@/components/Form/RwaForm';
import StatusModal from '@/components/Modals/Status';
import {
  assetGroup1,
  assetGroup2,
  assetGroup3,
  assetGroup4,
  OwnershipDocFields,
  ownershipFields,
  valuationFields,
  ValuationDocFields,
} from '@/constants/rwa';
import { rwaStepContent } from '@/constants/rwa/rwaStepContent';
import {
  assetOnboardingGroup1,
  assetOnboardingGroup2,
  assetOnboardingGroup3,
  assetOnboardingGroup4,
} from '@/constants/assetOnboarding.constants';
import { useRwaPersistence } from '@/hooks/useRwaPersistence';
import { useRwaSubmit } from '@/hooks/useRwaSubmit';
import { Link, useParams } from 'react-router-dom';
import StepProgress from '../CompanyKyb/StepProgress';
import { motion } from 'framer-motion';
import CompanyForm from '@/components/Form/CompanyForm';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useEffect, useState } from 'react';
import { getAssetByIdApi } from '@/api';
import {
  resetRwaAsset,
  saveStepData,
  saveStepDocuments,
} from '@/redux/slices/rwaAssetSlice';

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

export default function Rwa() {
  const [assetData, setAssetData] = useState<any>(null);
  const { assetId } = useParams();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const {
    step,
    goBack,
    persistStep,
    saveAllToLocalStorage,
    dispatch,
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    step1Docs,
    step2Docs,
    step3Docs,
    step4Docs,
  } = useRwaPersistence();

  const {
    isSubmitting,
    statusModal,
    setStatusModal,
    handleStep1Submit,
    handleStep2Submit,
    handleStep3Submit,
    handleBrokerInviteSubmit,
  } = useRwaSubmit({
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    step1Docs,
    step2Docs,
    step3Docs,
    step4Docs,
    persistStep,
    saveAllToLocalStorage,
    dispatch,
  });
  const { role } = useSelector((state: RootState) => state.authLogin);
  const isBroker = role === 'Broker';

  useEffect(() => {
    if (!assetId) return;

    const storedId = JSON.parse(localStorage.getItem('rwa_asset_id') || 'null');

    // 🔥 NEW ASSET → CLEAR OLD DATA
    if (storedId && String(storedId) !== String(assetId)) {
      dispatch(resetRwaAsset());

      localStorage.removeItem('rwa_asset_step');
      localStorage.removeItem('rwa_asset_step_data');
    }

    // always set current assetId
    localStorage.setItem('rwa_asset_id', JSON.stringify(assetId));
  }, [assetId]);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!assetId) return;

      try {
        const res = await getAssetByIdApi(assetId);

        if (res?.success) {
          setAssetData(res.data);
        }
      } catch (err) {
        console.error('GET ASSET ERROR', err);
      }
    };

    fetchAsset();
  }, [assetId]);

  const getMetaObj = (meta: any[]) => {
    return Object.fromEntries(meta?.map((m) => [m.metaKey, m.metaValue]) || []);
  };

  const mapApiToStep1 = (data: any) => {
    const meta = getMetaObj(data.meta);
    return {
      assetType: data.assetType,
      assetSubType: meta.assetSubType,
      assetTitle: data.assetTitle,
      currentOwnerName: data.currentOwnerName,
      shortDescription: meta.shortDescription,
      country: meta.country,
      state: meta.state,
      city: meta.city,
      pincode: meta.pincode,
      assetImages:
        data.documents
          ?.filter((d: any) => d.documentType === 'ASSET_IMAGE')
          .map((d: any, index: number) => ({
            id: `img-${index}`,
            file: null,
            previewUrl: d.documentUrl,
            filename: d.documentUrl.split('/').pop(),
            __isFile: false,
          })) || [],
    };
  };

  const mapApiToStep2 = (data: any) => {
    const meta = getMetaObj(data.meta);
    return {
      ownershipModel: data.ownershipModel,
      currentOwnerName: data.currentOwnerName,
      landArea: meta.landArea,
    };
  };

  const mapApiToStep3 = (data: any) => {
    const meta = getMetaObj(data.meta);

    return {
      marketValue: meta.marketValue,
      currency: meta.currency,
    };
  };

  const mapApiToStep4 = (data: any) => {
    const owner = data.assetOwner || {};

    const fullName = owner.name || '';
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');

    return {
      ownerFirstName: firstName || '',
      ownerLastName: lastName || '',
      ownerEmail: owner.email || '',
      ownerMobile: owner.mobile || '',
    };
  };

  useEffect(() => {
    if (!assetData || isPrefilled) return;

    const step1 = mapApiToStep1(assetData);
    const step2 = mapApiToStep2(assetData);
    const step3 = mapApiToStep3(assetData);
    const step4 = mapApiToStep4(assetData);

    dispatch(saveStepData({ step: 1, data: step1 }));
    dispatch(saveStepData({ step: 2, data: step2 }));
    dispatch(saveStepData({ step: 3, data: step3 }));
    dispatch(saveStepData({ step: 4, data: step4 }));

    dispatch(
      saveStepDocuments({
        step: 1,
        documents: assetData.documents,
      })
    );

    setIsPrefilled(true);
  }, [assetData, isPrefilled]);

  return (
    <section className="font-work relative pb-9 min-h-screen px-4 lg:px-10 bg-[var(--bg)]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto pt-42 space-y-6"
      >
        <motion.header
          variants={itemVariants}
          className="flex sm:flex-row flex-col items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <h2 className="font-medium font-30 text-[var(--fg)]">
              {rwaStepContent[step].title}
            </h2>
            <p className="text-gray-500 font-medium font-16">
              {rwaStepContent[step].desc}
            </p>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4 w-full">
            {/* <Link
              to="/dashboard/rwa/vendors"
              className="flex items-center gap-2 text-[var(--fg)] text-sm font-medium hover:text-[var(--primary-blue)] transition-colors md:p-2 rounded-md hover:bg-[var(--fg)]/5"
            >
              <BiSupport size={20} />
              <span>Do you need any help?</span>
            </Link> */}

            {isBroker && step !== 4 && (
              <Link
                to="/"
                className="hidden sm:flex items-center gap-2 text-[var(--fg)]/70 bg-[var(--inner-card)] border border-[var(--fg)]/10 px-5 py-2.5 rounded-xl font-semibold hover:bg-[var(--fg)]/5 hover:text-[var(--fg)] transition-all duration-300"
              >
                Do It Later
              </Link>
            )}
            <Link
              to="/"
              className="block sm:hidden text-[var(--fg)] font-medium text-[14px] hover:bg-[var(--bg)]/30 transition cursor-pointer border-b border-white"
            >
              Skip
            </Link>
          </div>
        </motion.header>
        <motion.div variants={itemVariants}>
          {isBroker ? (
            <StepProgress currentStep={step - 1} totalSteps={4} />
          ) : (
            <StepProgress currentStep={step - 1} totalSteps={3} />
          )}
        </motion.div>
        {step === 1 && (
          <RwaAssetForm
            group1={assetGroup1}
            group2={assetGroup2}
            group3={assetGroup3}
            group4={assetGroup4}
            initialValues={step1Data}
            onSubmit={handleStep1Submit}
            onBack={step > 1 ? goBack : undefined}
            isSubmitting={isSubmitting}
            button={{ label: 'Continue', variant: 'formButton' }}
          />
        )}

        {step === 2 && (
          // <motion.div variants={itemVariants}>
          <RwaForm
            fields={ownershipFields}
            docFields={OwnershipDocFields}
            initialValues={step2Data}
            initialDocuments={step2Docs}
            onSubmit={handleStep2Submit}
            onBack={goBack}
            button={{ label: 'Continue', variant: 'formButton' }}
          />
          // </motion.div>
        )}

        {step === 3 && (
          // <motion.div variants={itemVariants}>
          <RwaForm
            fields={valuationFields}
            docFields={ValuationDocFields}
            initialValues={step3Data}
            onSubmit={handleStep3Submit}
            onBack={goBack}
            button={{ label: 'Submit', variant: 'formButton' }}
          />
          // </motion.div>
        )}

        {isBroker && step === 4 && (
          <CompanyForm
            group1={assetOnboardingGroup1}
            group2={assetOnboardingGroup2}
            group3={assetOnboardingGroup3}
            group4={assetOnboardingGroup4}
            initialValues={step4Data}
            onSubmit={handleBrokerInviteSubmit}
            onBack={undefined}
            button={{
              label: 'Invite Broker',
              variant: 'formButton',
            }}
          />
        )}
      </motion.div>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        subMessage={statusModal.subMessage}
        onClose={() => setStatusModal({ ...statusModal, open: false })}
        onContinue={() => setStatusModal({ ...statusModal, open: false })}
      />
    </section>
  );
}
