import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '@/components/Form/CompanyForm';
import {
  kycGroup1,
  kycGroup2,
  kycGroup3,
} from '@/constants/kyc/directorKycStepGroups';
import { saveStepData } from '@/redux/slices/kybSlice';
import Cookies from 'js-cookie';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import Loader from '@/components/Loader';
import StatusModal from '@/components/Modals/Status';
import {
  saveDirectorKycStep,
  resetDirectorKyc,
} from '@/redux/slices/directorKycSlice';

import {
  useCreateDirector,
  useUploadDirectorDocuments,
} from '@/api/directorKyc.api';
import { useCountries } from '@/api/location.api';
import { kycStepContent } from '@/constants/kyc/kycStepContent';
import { Link } from 'react-router-dom';
import KycDocUploadStep from '@/components/DocumentsUploadStep/KycDocUploadStep';
import StepProgress from '../CompanyKyb/StepProgress';
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

type DirectorDocument = {
  id: number;
  documentTypeId: number;
  companyId: number | null;
  directorId: number | null;
  accountId: number | null;
  url: string | null;
  documentIdentifier: string;
  isVerified: boolean;
  remark: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
};

import { fetchCompanyApi } from '@/api';

export default function DirectorKyc() {
  const [directorId, setDirectorId] = useState<number | null>(null);
  const [directorDocs, setDirectorDocs] = useState<DirectorDocument[]>([]);
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const companyId = useCompanyId();

  const token =
    useSelector((state: RootState) => state.authLogin.token) ||
    Cookies.get('hof_token') ||
    undefined;

  const step = useSelector((state: RootState) => state.directorKyc.step);
  const savedData = useSelector((state: RootState) => state.kyb.step1Data);
  const { mutateAsync: createDirector, isPending: creatingDirector } =
    useCreateDirector();

  const kycStatus = useSelector(
    (state: RootState) => state.authLogin.user?.kycStatus
  );

  const { mutateAsync: uploadDocs, isPending: uploadingDocs } =
    useUploadDirectorDocuments(kycStatus == 'Rejected' ? false : true);

  const { data: countriesRes } = useCountries();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step]);

  const getLatestDocuments = (docs: DirectorDocument[]) => {
    const map = new Map<string, DirectorDocument>();

    docs.forEach((doc) => {
      const existing = map.get(doc.documentIdentifier);

      if (!existing) {
        map.set(doc.documentIdentifier, doc);
      } else {
        // latest choose karo (uploadedAt compare)
        if (new Date(doc.uploadedAt) > new Date(existing.uploadedAt)) {
          map.set(doc.documentIdentifier, doc);
        }
      }
    });

    return Array.from(map.values());
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const res = await fetchCompanyApi(token);
        if (res.success && res.data) {
          const company = res.data;
          const director = company.directors?.[0]; // Default to first director for now

          if (director) {
            setDirectorId(director.id);
            const permanentAddress = director.permanentAddress || {};
            const meta = director.directorMeta || {};
            const documents = director.documents;
            const latestDocs = getLatestDocuments(documents);
            setDirectorDocs(latestDocs);

            const mappedData = {
              firstName: director.firstName || '',
              lastName: director.lastName || '',
              roleInCompany: director.roleInCompany || '',
              dateOfBirth: director.dateOfBirth
                ? director.dateOfBirth.split('T')[0]
                : '',
              nationality: director.nationality || '',
              email: director.email || '',
              mobileNumber: director.mobileNumber || '',
              panNumber: meta.panNumber || director.panNumber || '',
              emiratesIdNumber:
                meta.emiratesIdNumber || director.emiratesIdNumber || '',
              passportNumber:
                meta.passportNumber || director.passportNumber || '',
              addressLine1:
                permanentAddress.addressLine1 || director.addressLine1 || '',
              addressLine2:
                permanentAddress.addressLine2 || director.addressLine2 || '',
              city: permanentAddress.city || director.city || '',
              state: permanentAddress.state || director.state || '',
              country: (() => {
                const val =
                  permanentAddress.country || director.country || 'IN';
                const reverseMap: Record<string, string> = {
                  India: 'IN',
                  UAE: 'AE',
                  india: 'IN',
                  uae: 'AE',
                };
                return reverseMap[val] || val;
              })(),
              pincode: permanentAddress.pincode || director.pincode || '',
            };

            dispatch(saveStepData({ step: 1, data: mappedData }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch director data:', err);
      }
    };

    fetchData();
    localStorage.removeItem('director_kyc_data');
    localStorage.removeItem('director_kyc_director_id');
  }, [token, dispatch]);

  const toIsoDate = (value: any): string | null => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const handleSubmit = async (data: any) => {
    if (!companyId) {
      setErrorModal({
        open: true,
        message:
          'Company information could not be found. Please complete Company KYB first.',
      });
      return;
    }

    try {
      const countries = countriesRes?.success === true ? countriesRes.data : [];
      const selectedCountryObj = countries?.find(
        (c: any) => c.isoCode === data.country
      );
      const resolvedCountryName = selectedCountryObj?.name || data.country;

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        roleInCompany: data.roleInCompany,
        dateOfBirth: toIsoDate(data.dateOfBirth),
        nationality: data.nationality,
        panNumber: data.panNumber,
        emiratesIdNumber: data.emiratesIdNumber,
        passportNumber: data.passportNumber,
        email: data.email,
        mobileNumber: data.mobileNumber,
        address: {
          line1: data.addressLine1,
          line2: data.addressLine2,
          city: data.city,
          state: data.state,
          country: resolvedCountryName,
          pincode: data.pincode,
        },
      };

      const res = await createDirector({ companyId, payload, token });
      if (!res.success) {
        throw new Error(res.message || res.error || 'Director creation failed');
      }
      const newId = res?.data?.director?.id;
      if (!newId) throw new Error('Director creation failed');

      setDirectorId(newId);
      dispatch(saveStepData({ step: 1, data }));
      dispatch(saveDirectorKycStep(2));
    } catch (err: any) {
      setErrorModal({ open: true, message: err.message });
    }
  };

  const submitStep2Apis = async ({ documents }: any) => {
    if (!companyId || !directorId) {
      console.error('BLOCKED SUBMIT', { companyId, directorId });
      return;
    }

    try {
      await uploadDocs({
        companyId,
        directorId,
        documents,
        token,
      });

      localStorage.removeItem('director_kyc_data');
      dispatch(resetDirectorKyc());

      if (!token) {
        navigate('/dashboard/onboarding');
        return;
      }

      await runUserFetchFlow(token);
      navigate('/dashboard/onboarding');
    } catch (err: any) {
      setErrorModal({ open: true, message: err.message });
    }
  };

  if (creatingDirector || uploadingDocs) {
    return <Loader />;
  }

  return (
    <section className="font-work relative pt-42 min-h-screen bg-[var(--bg)]">
      <div className="px-4 lg:px-10">
        <motion.div
          key={step}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-[1600px] mx-auto pb-20 space-y-6 "
        >
          <motion.header
            variants={itemVariants}
            className="flex items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <h2 className="font-medium font-30 text-[var(--fg)]">
                {kycStepContent[step].title}
              </h2>
              <p className="text-dark-grey font-medium font-16">
                {kycStepContent[step].desc}
              </p>
            </div>
            <div>
              <Link
                to="/"
                className="hidden whitespace-nowrap sm:block text-[var(--fg)]  bg-[var(--bg)]/70 border border-[var(--fg)]/40 px-3 py-2 rounded-sm font-medium hover:bg-[var(--bg)]/30 transition"
              >
                Do It Later
              </Link>
              <Link
                to="/"
                className="block sm:hidden text-[var(--fg)] font-medium text-[14px] hover:bg-[var(--bg)]/70 transition cursor-pointer border-b border-[var(--fg)]/40 "
              >
                Skip
              </Link>
            </div>
          </motion.header>
          <motion.div variants={itemVariants}>
            <StepProgress currentStep={step - 1} totalSteps={2} />
          </motion.div>

          {step === 1 && (
            <motion.div variants={itemVariants}>
              <CompanyForm
                group1={kycGroup1}
                group2={kycGroup2}
                group3={kycGroup3}
                initialValues={savedData}
                onSubmit={handleSubmit}
                button={{
                  label: companyId ? 'Next' : 'Complete Company KYB First',
                  variant: 'formButton',
                }}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div variants={itemVariants}>
              <KycDocUploadStep
                onSubmit={submitStep2Apis}
                externalValues={savedData}
                onBack={() => dispatch(saveDirectorKycStep(1))}
                directorDocs={directorDocs}
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
