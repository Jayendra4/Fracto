import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Step1 from './Step1';
// Step2 (Occupation / Occupation Industry / Monthly Income) is no longer a
// separate step — Monthly Income moved into Step3, reducing the flow to 3 steps.
// import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import {
  updateKycData,
  setKycDataFromApi,
} from '@/redux/slices/UserKycNewSlice';
import UserKycHeader from './UserKycHeader';
import UserKycStepper from './UserKycStepper';
import KycSuccess from './KycSuccess';
import type { RootState } from '@/redux/store';
import { motion, AnimatePresence } from 'framer-motion';
import { fileToBase64, base64ToFile } from '@/utils/filePersistence';
import type { KycState } from '@/redux/slices/UserKycNewSlice';

const getFileNameFromUrl = (url?: string | null) => {
  if (!url) return '';

  try {
    return decodeURIComponent(url.split('?')[0].split('/').pop() || '');
  } catch {
    return url.split('?')[0].split('/').pop() || '';
  }
};

const toDateInputValue = (value?: string | null) =>
  value ? value.split('T')[0] : '';

const mapSecondaryIdType = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case 'passport':
      return 'passport';
    case 'license':
    case 'driving license':
      return 'license';
    case 'aadhaar':
    case 'aadhaar xml':
    case 'aadhar':
      return 'aadhaar';
    case 'voter':
    case 'voter id':
      return 'voter';
    default:
      return '';
  }
};

const mapAddressProofType = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case 'bank statement':
      return 'Bank Statement';
    case 'utility bill':
      return 'Utility Bill';
    case 'aadhaar xml':
    case 'aadhaar':
    case 'aadhar':
      return 'Aadhaar XML';
    default:
      return '';
  }
};

interface KycEntityDocument {
  documentDeveloperName: string;
  documentName?: string;
  url?: string;
}

const buildKycDataFromUser = (
  user: RootState['authLogin']['user']
): Partial<KycState> => {
  if (!user) return {};

  const documents: KycEntityDocument[] = Array.isArray(user.entityDocument)
    ? user.entityDocument
    : [];
  const findDocument = (developerName: string) =>
    documents.find((doc) => doc.documentDeveloperName === developerName);

  const panDocument = findDocument('pan_indian');
  const selfieDocument = findDocument('passport_size_photo');
  const secondaryIdDocument = findDocument('secondary_id');
  const addressProofDocument = findDocument('address_proof');
  const residentialAddress = user.currentAddress || user.permanentAddress || {};

  return {
    panNumber: user.meta?.panNumber || '',
    dateOfBirth: toDateInputValue(user.meta?.dateOfBirth),
    panFileUrl: panDocument?.url || '',
    panFileName: getFileNameFromUrl(panDocument?.url),
    occupation: user.meta?.occupation || '',
    occupationIndustry: user.meta?.occupationIndustry || '',
    monthlyIncome: user.meta?.monthlyIncome || '',
    residentialAddress: {
      addressLine1: residentialAddress?.addressLine1 || '',
      addressLine2: residentialAddress?.addressLine2 || '',
      city: residentialAddress?.city || '',
      state: residentialAddress?.state || '',
      country: residentialAddress?.country || 'India',
      pincode: residentialAddress?.pincode || '',
    },
    addressProofType: mapAddressProofType(addressProofDocument?.documentName),
    addressProofFileUrl: addressProofDocument?.url || '',
    addressProofFileName: getFileNameFromUrl(addressProofDocument?.url),
    selfieUrl: selfieDocument?.url || '',
    selfieFileName: getFileNameFromUrl(selfieDocument?.url),
    secondaryIdType: mapSecondaryIdType(secondaryIdDocument?.documentName),
    secondaryIdFileUrl: secondaryIdDocument?.url || '',
    secondaryIdFileName: getFileNameFromUrl(secondaryIdDocument?.url),
    licenseNumber:
      user.meta?.realEstateLicenseNumber || user.licenseNumber || '',
    licenseExpiry:
      toDateInputValue(user.meta?.licenseExpiry) ||
      toDateInputValue(user.licenseExpiry),
  };
};

export default function Kyc() {
  const location = useLocation();
  const isMyOnboarding = location.pathname.includes('my-onboarding');

  const [step, setStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('kyc_step');
    return savedStep ? Math.min(Number(savedStep), 3) : 1;
  });
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.authLogin.user);
  const kycData = useSelector((state: RootState) => state.userKycNew);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  useEffect(() => {
    const hydrate = async () => {
      const mappedUserData = buildKycDataFromUser(user);
      const saved = localStorage.getItem('kyc_data');
      let hydratedData: Record<string, unknown> = { ...mappedUserData };

      if (saved) {
        try {
          const data = JSON.parse(saved);

          // API data always wins for text/select fields.
          // localStorage only provides: (a) base64 file blobs (can't come from API),
          // and (b) values for fields the API returned empty.
          // This ensures the latest submitted data from the server is always shown.
          const merged: Record<string, unknown> = { ...data };
          for (const [key, apiVal] of Object.entries(mappedUserData)) {
            if (apiVal === null || apiVal === undefined || apiVal === '')
              continue;
            if (typeof apiVal === 'object' && !Array.isArray(apiVal)) {
              const savedNested =
                (merged[key] as Record<string, unknown>) ?? {};
              const mergedNested: Record<string, unknown> = {
                ...savedNested,
              };
              for (const [nk, nv] of Object.entries(
                apiVal as Record<string, unknown>
              )) {
                if (nv !== null && nv !== undefined && nv !== '') {
                  mergedNested[nk] = nv;
                }
              }
              merged[key] = mergedNested;
            } else {
              merged[key] = apiVal;
            }
          }
          hydratedData = merged;

          // Convert base64 back to File objects
          if (data.panBase64 && data.panFileName && data.panFileType) {
            hydratedData.panFile = base64ToFile(
              data.panBase64,
              data.panFileName,
              data.panFileType
            );
          }
          if (data.selfieBase64 && data.selfieFileName && data.selfieFileType) {
            hydratedData.selfie = base64ToFile(
              data.selfieBase64,
              data.selfieFileName,
              data.selfieFileType
            );
          }
          if (
            data.addressProofBase64 &&
            data.addressProofFileName &&
            data.addressProofFileType
          ) {
            hydratedData.addressProofFile = base64ToFile(
              data.addressProofBase64,
              data.addressProofFileName,
              data.addressProofFileType
            );
          }
          if (
            data.secondaryIdBase64 &&
            data.secondaryIdFileName &&
            data.secondaryIdFileType
          ) {
            hydratedData.secondaryIdFile = base64ToFile(
              data.secondaryIdBase64,
              data.secondaryIdFileName,
              data.secondaryIdFileType
            );
          }
        } catch (error) {
          console.error('Failed to hydrate KYC data', error);
        }
      }

      dispatch(setKycDataFromApi(hydratedData));
      setIsHydrated(true);
    };

    hydrate();
  }, [dispatch, user]);

  useEffect(() => {
    localStorage.setItem('kyc_step', step.toString());
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [step]);

  useEffect(() => {
    if (!isHydrated) return;

    const saveData = async () => {
      const dataToSave: Record<string, unknown> = { ...kycData };

      // Convert File objects to base64
      if (kycData.panFile instanceof File) {
        dataToSave.panBase64 = await fileToBase64(kycData.panFile);
        dataToSave.panFileName = kycData.panFile.name;
        dataToSave.panFileType = kycData.panFile.type;
      }
      if (kycData.selfie instanceof File) {
        dataToSave.selfieBase64 = await fileToBase64(kycData.selfie);
        dataToSave.selfieFileName = kycData.selfie.name;
        dataToSave.selfieFileType = kycData.selfie.type;
      }
      if (kycData.addressProofFile instanceof File) {
        dataToSave.addressProofBase64 = await fileToBase64(
          kycData.addressProofFile
        );
        dataToSave.addressProofFileName = kycData.addressProofFile.name;
        dataToSave.addressProofFileType = kycData.addressProofFile.type;
      }
      if (kycData.secondaryIdFile instanceof File) {
        dataToSave.secondaryIdBase64 = await fileToBase64(
          kycData.secondaryIdFile
        );
        dataToSave.secondaryIdFileName = kycData.secondaryIdFile.name;
        dataToSave.secondaryIdFileType = kycData.secondaryIdFile.type;
      }

      // Remove actual File objects temporarily for JSON.stringify if needed,
      // though they will be ignored by stringify anyway.
      delete dataToSave.panFile;
      delete dataToSave.selfie;
      delete dataToSave.addressProofFile;
      delete dataToSave.secondaryIdFile;
      delete dataToSave.passportPhoto;

      localStorage.setItem('kyc_data', JSON.stringify(dataToSave));
    };

    saveData();
  }, [kycData, isHydrated]);

  const kycStatus = user?.kycStatus;

  const isApproved = kycStatus === 'Approved';
  const isSubmitted = kycStatus === 'Submitted';
  const isUnderReview = kycStatus === 'UnderReview';
  const isRejected = kycStatus === 'Rejected';

  const verificationState = kycStatus;
  const isCompany = user?.type === 'Company';

  const showKycResult =
    !isResubmitting &&
    (isRejected || isSubmitted || isUnderReview || isApproved);
  // (isSubmitted || isUnderReview || isApproved) && !isRejected
  useEffect(() => {
    const flag = localStorage.getItem('kyc_resubmitting');
    if (!flag) {
      setIsResubmitting(false);
    }
  }, []);
  const isUserKycCompleted =
    isApproved || isSubmitted || isUnderReview || isRejected;

  // const { role } = useSelector((state: RootState) => state.authLogin);
  return (
    <div
      className={
        isMyOnboarding
          ? 'w-full text-[var(--fg)]'
          : 'w-full px-4 md:px-10 text-[var(--fg)] min-h-screen pt-34.5 md:pt-35 lg:pt-40'
      }
    >
      <section className="w-full flex justify-center pb-10 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[1600px]"
        >
          {!isUserKycCompleted && <UserKycHeader />}

          {showKycResult ? (
            <KycSuccess
              status={verificationState}
              isCompany={isCompany}
              rejectionReason={user?.kyc?.rejectionReason}
              onResubmit={() => {
                setIsResubmitting(true);
                setStep(1);
                localStorage.setItem('kyc_step', '1');
              }}
            />
          ) : (
            <>
              <UserKycStepper currentStep={step - 1} totalSteps={3} />

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step1
                      onNext={() => setStep(2)}
                      updateKycData={(data) => dispatch(updateKycData(data))}
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step3
                      onBack={() => setStep(1)}
                      onNext={() => setStep(3)}
                      updateKycData={(data) => dispatch(updateKycData(data))}
                    />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step4
                      onBack={() => setStep(2)}
                      updateKycData={(data: Partial<KycState>) =>
                        dispatch(updateKycData(data))
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </section>
    </div>
  );
}
