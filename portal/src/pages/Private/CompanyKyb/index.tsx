import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import CompanyForm from '@/components/Form/CompanyForm';
import Loader from '@/components/Loader';
import StatusModal from '@/components/Modals/Status';
import { kybGroup1, kybGroup2, kybGroup3, kybGroup4 } from '@/constants/kyb';
import { taxAndRegDetailsFields } from '@/constants/kyb/taxAndRegDetailsFields';
import { businessProfileFields } from '@/constants/kyb/businessProfileFields';
import { companyKybStepContent } from '@/constants/kyb';
import { saveStep, saveStepData, setCompanyId } from '@/redux/slices/kybSlice';
import { persistStepUtil } from '@/utils/CompanyKyb';
import {
  submitCompanyBasicApi,
  submitCompanyTaxApi,
  submitBusinessProfileApi,
  uploadCompanyDocumentsApi,
  fetchCompanyApi,
  updateCompanyDocumentsApi,
} from '@/api';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import StepProgress from './StepProgress';
import KybDocUploadStep from '@/components/DocumentsUploadStep/KybDocUploadStep';
import { motion } from 'framer-motion';
import { setKybDataFromApi } from '@/redux/slices/kybSlice';

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

type DocumentType = {
  id: number;
  documentTypeId: number;
  companyId: number;
  directorId: number | null;
  accountId: number;
  url: string;
  documentIdentifier: string;
  isVerified: boolean;
  remark: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
};

export default function CompanyKyb() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const token =
    useSelector((state: RootState) => state.authLogin.token) ||
    Cookies.get('hof_token') ||
    null;

  const savedStep = useSelector((state: RootState) => state.kyb.step);
  const step1Data = useSelector((state: RootState) => state.kyb.step1Data);
  const step2Data = useSelector((state: RootState) => state.kyb.step2Data);
  const step3Data = useSelector((state: RootState) => state.kyb.step3Data);
  const companyId = useSelector((state: RootState) => state.kyb.companyId);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(savedStep || 1);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fade, setFade] = useState(true);

  const [errorModal, setErrorModal] = useState({
    open: false,
    message: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step]);

  const getLatestDocuments = (documents: any[]) => {
    return Object.values(
      documents.reduce((acc, doc) => {
        const key = doc.documentIdentifier;

        if (
          !acc[key] ||
          new Date(doc.uploadedAt) > new Date(acc[key].uploadedAt)
        ) {
          acc[key] = doc;
        }

        return acc;
      }, {})
    );
  };

  useEffect(() => {
    const fetchAndPopulate = async () => {
      if (!token) return;
      try {
        const res = await fetchCompanyApi(token);
        if (res.success && res.data) {
          const company = res.data;
          const meta = company.meta || {};
          const registeredAddress = company.registeredAddress || {};
          const documents = company?.documents || [];

          const latestDocuments = getLatestDocuments(documents);
          setDocuments((latestDocuments || []) as DocumentType[]);

          const mappedStep1Data = {
            legalEntityName: company.legalEntityName || '',
            tradeName: company.tradeName || '',
            cinOrTradeLicenseNo: company.cinOrTradeLicenseNo || '',
            dateOfIncorporation: company.dateOfIncorporation
              ? company.dateOfIncorporation.split('T')[0]
              : '',
            entityType: company.entityType || '',
            registeredCountry:
              registeredAddress.country ||
              company.registeredCountry ||
              company.country ||
              'IN',
            registeredState:
              registeredAddress.state || company.registeredState || '',
            registeredCity:
              registeredAddress.city || company.registeredCity || '',
            registeredPincode:
              registeredAddress.pincode || company.registeredPincode || '',
            registeredAddressLine1:
              registeredAddress.addressLine1 ||
              company.registeredAddressLine1 ||
              '',
            registeredAddressLine2:
              registeredAddress.addressLine2 ||
              company.registeredAddressLine2 ||
              '',
            industryType: meta.industryType || '',
            companyEmail: company.companyEmail || '',
            companyPhone: company.companyPhone || '',
            websiteUrl: company.websiteUrl || '',
          };

          const mappedStep2Data = {
            panNumber: meta.panNumber || '',
            gstNumber: meta.gstNumber || '',
            tanNumber: meta.tanNumber || '',
            tradeLicenseExpiry: meta.tradeLicenseExpiryDate
              ? meta.tradeLicenseExpiryDate.split('T')[0]
              : '',
            proofOfPlaceOfBusiness: meta.placeOfBusinessProofType || '',
          };

          const mappedStep3Data = {
            natureOfBusiness: meta.natureOfBusiness || '',
            countriesOfOperation: (meta.countriesOfOperation || []).map(
              (c: string) => {
                const reverseMap: Record<string, string> = {
                  India: 'IN',
                  UAE: 'AE',
                  india: 'IN',
                  uae: 'AE',
                };
                return reverseMap[c] || c;
              }
            ),
            expectedMonthlyTransactionVolume: String(
              meta.expectedMonthlyTransactionVolume || ''
            ),
            expectedSourceOfFunds: meta.expectedSourceOfFunds || '',
            businessDescription: meta.businessDescription || '',
            isCompanyPubliclyListed:
              meta.isCompanyPubliclyListed === true ? 'True' : 'False',
          };

          dispatch(
            setKybDataFromApi({
              step1Data: mappedStep1Data,
              step2Data: mappedStep2Data,
              step3Data: mappedStep3Data,
              companyId: String(company.id),
            })
          );
        }
      } catch (err) {
        console.error('Failed to fetch company data:', err);
      }
    };

    fetchAndPopulate();
    localStorage.removeItem('kyb_step_data');
    localStorage.removeItem('kyb_company_id');
  }, [token, dispatch]);

  useEffect(() => {
    try {
      const savedStepLS = localStorage.getItem('kyb_step');
      if (savedStepLS) dispatch(saveStep(JSON.parse(savedStepLS)));
    } catch (err) {
      console.error('Failed to restore KYB step:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('kyb_step');
    }
  }, [token]);

  useEffect(() => {
    setStep(savedStep);
  }, [savedStep]);

  const persistStep = (newStep: 1 | 2 | 3 | 4) => {
    setFade(false);
    setIsTransitioning(true);
    setTimeout(() => {
      persistStepUtil(dispatch, newStep, setStep);
      setFade(true);
      setIsTransitioning(false);
    }, 300);
  };

  const handleStep1Submit = async (data: Record<string, any>) => {
    try {
      setIsTransitioning(true);
      const res = await submitCompanyBasicApi(data);
      if (!res.success) throw new Error(res.message);

      const id = res.data?.id;
      if (id) {
        dispatch(setCompanyId(id));
      }

      dispatch(saveStepData({ step: 1, data }));
      persistStep(2);
    } catch (err) {
      setIsTransitioning(false);
      setErrorModal({
        open: true,
        message: (err as Error)?.message || 'Failed to submit company details.',
      });
    }
  };

  const handleStep2Submit = async (data: Record<string, any>) => {
    try {
      setIsTransitioning(true);
      if (!companyId) throw new Error('Company ID missing');

      const res = await submitCompanyTaxApi(data, companyId);
      if (!res.success) throw new Error(res.message);

      dispatch(saveStepData({ step: 2, data }));
      persistStep(3);
    } catch (err) {
      setIsTransitioning(false);
      setErrorModal({
        open: true,
        message: (err as Error)?.message || 'Failed to submit tax details.',
      });
    }
  };

  const handleStep3Submit = async (data: Record<string, any>) => {
    try {
      setIsTransitioning(true);
      if (!companyId) throw new Error('Company ID missing');

      const res = await submitBusinessProfileApi(data, companyId);
      if (!res.success) throw new Error(res.message);

      dispatch(saveStepData({ step: 3, data }));
      persistStep(4);
    } catch (err) {
      setIsTransitioning(false);
      setErrorModal({
        open: true,
        message:
          (err as Error)?.message || 'Failed to submit business profile.',
      });
    }
  };

  const kycStatus = useSelector(
    (state: RootState) => state.authLogin.user?.kycStatus
  );

  const handleDocumentsSubmit = async ({
    documents,
    extra,
  }: {
    documents: any[];
    extra?: any;
  }) => {
    try {
      setIsTransitioning(true);
      if (!companyId) throw new Error('Company ID missing');
      let res;

      if (kycStatus === 'Rejected') {
        res = await updateCompanyDocumentsApi(documents, extra, companyId);
      } else {
        res = await uploadCompanyDocumentsApi(documents, extra, companyId);
      }

      if (!res.success) throw new Error(res.message);

      localStorage.removeItem('kyb_step');
      localStorage.removeItem('kyb_step_data');
      localStorage.removeItem('kyb_company_id');

      if (!token) {
        navigate('/dashboard/onboarding');
        return;
      }

      await runUserFetchFlow(token);
      navigate('/dashboard/onboarding');
    } catch (err) {
      setIsTransitioning(false);
      setErrorModal({
        open: true,
        message: (err as Error)?.message || 'Failed to upload documents.',
      });
    }
  };

  const goBack = () => {
    if (step > 1) {
      persistStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  return (
    <section className="font-work relative pb-9 pt-15 md:py-20 min-h-screen bg-[var(--bg)]">
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="px-4 lg:px-10 pt-25 ">
        <motion.div
          key={step}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`max-w-[1600px] mx-auto transition-[padding-top,opacity] space-y-6 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-between gap-4 "
          >
            <div>
              <h2 className="font-medium font-30 text-[var(--fg)]">
                {companyKybStepContent[step].title}
              </h2>
              <p className="text-dark-grey font-14">
                {companyKybStepContent[step].desc}
              </p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <StepProgress currentStep={step - 1} totalSteps={4} />
          </motion.div>

          {step === 1 && (
            <motion.div variants={itemVariants}>
              <CompanyForm
                group1={kybGroup1}
                group2={kybGroup2}
                group3={kybGroup3}
                group4={kybGroup4}
                initialValues={step1Data}
                externalValues={step1Data}
                onSubmit={handleStep1Submit}
                button={{ label: 'Continue', variant: 'formButton' }}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div variants={itemVariants}>
              <CompanyForm
                group1={taxAndRegDetailsFields}
                initialValues={step2Data}
                externalValues={step1Data}
                onSubmit={handleStep2Submit}
                onBack={goBack}
                button={{ label: 'Continue', variant: 'formButton' }}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div variants={itemVariants}>
              <CompanyForm
                group1={businessProfileFields}
                initialValues={step3Data}
                externalValues={step1Data}
                onSubmit={handleStep3Submit}
                onBack={goBack}
                button={{ label: 'Continue', variant: 'formButton' }}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div variants={itemVariants}>
              <KybDocUploadStep
                externalValues={step1Data}
                documents={documents}
                onSubmit={handleDocumentsSubmit}
                onBack={goBack}
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      <StatusModal
        open={errorModal.open}
        status="error"
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: '' })}
        onContinue={() => setErrorModal({ open: false, message: '' })}
      />
    </section>
  );
}
