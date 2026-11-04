import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '@/components/Form/CompanyForm';
import { saveStepData } from '@/redux/slices/kybSlice';
import Cookies from 'js-cookie';
import {
  kycGroup1,
  kycGroup2,
  kycGroup3,
  kycGroup4,
} from '@/constants/UserKyc/userKycStepGroups';
import { UserKycDocumentsUploadStep } from '@/components/DocumentsUploadStep';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import { saveUserKycStep, resetUserKyc } from '@/redux/slices/userKycSlice';
import { useSubmitUserKyc } from '@/api/userKyc.api';
import { useCountries } from '@/api/location.api';
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

export default function UserKyc() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();

  const { mutateAsync: submitUserKyc, isPending } = useSubmitUserKyc();
  const { data: countriesRes } = useCountries();

  const stepperHeight = useSelector(
    (state: RootState) => state.ui.stepperHeight
  );
  const isStepperOpen = useSelector(
    (state: RootState) => state.ui.isStepperOpen
  );
  const savedData = useSelector((state: RootState) => state.kyb.step1Data);
  const step = useSelector((state: RootState) => state.userKyc.step);

  const token =
    useSelector((state: RootState) => state.authLogin.token) ||
    Cookies.get('hof_token') ||
    '';

  const [step1Data, setStep1Data] = useState<Record<string, any> | null>(null);

  const userCountry = useMemo(() => {
    try {
      const ls = localStorage.getItem('hof_user');
      if (!ls) return null;

      const parsed = JSON.parse(ls);
      if (parsed?.countryId === 1) return 'india';
      if (parsed?.countryId === 2) return 'uae';
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    try {
      const savedDataLS = localStorage.getItem('director_kyc_data');
      if (savedDataLS) {
        const parsed = JSON.parse(savedDataLS);
        dispatch(saveStepData({ step: 1, data: parsed }));
        setStep1Data(parsed);
      }
    } catch (err) {
      console.error('Failed to load user kyc data:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step]);

  const toIsoDate = (value: string | number | Date | null): string | null => {
    if (!value) return null;

    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const handleStep1Submit = async (data: Record<string, any>) => {
    localStorage.setItem('director_kyc_data', JSON.stringify(data));
    dispatch(saveStepData({ step: 1, data }));
    setStep1Data(data);
    dispatch(saveUserKycStep(2));
  };

  const handleStep2Submit = async ({ documents }: { documents: any[] }) => {
    if (!step1Data || !token) return;

    const countries = countriesRes?.success === true ? countriesRes.data : [];
    const selectedCountryObj = countries?.find(
      (c: { name: string; isoCode: string; id: number }) =>
        c.isoCode === step1Data.country
    );
    const resolvedCountryId = selectedCountryObj?.id || 1;
    const resolvedCountryName = selectedCountryObj?.name || step1Data.country;

    const payload = {
      firstname: step1Data.firstName,
      lastname: step1Data.lastName,
      dateOfBirth: toIsoDate(step1Data.dateOfBirth),
      panNumber: step1Data.panNumber,
      idNumber: step1Data.emiratesIdNumber,
      passportNumber: step1Data.passportNumber,
      email: step1Data.email,
      countryId: resolvedCountryId,
      mobileNumber: step1Data.mobileNumber,
      address: {
        line1: step1Data.addressLine1,
        line2: step1Data.addressLine2,
        city: step1Data.city,
        state: step1Data.state,
        country: resolvedCountryName,
        pincode: step1Data.pincode,
      },
      documents,
    };

    await submitUserKyc({ payload, token });

    localStorage.removeItem('director_kyc_data');
    dispatch(resetUserKyc());
    await runUserFetchFlow(token);
    navigate('/complete-profile');
  };

  const stepContent = {
    1: {
      title: 'Identity Information',
      desc: 'Enter your details to complete your KYC form. It only takes a few minutes...',
    },
    2: {
      title: 'Document Upload',
      desc: 'Upload your documents to complete your kyc form. It only takes a few minutes...',
    },
  };

  return (
    <section
      style={{
        background: 'url(/images/kyb/kyb-bg-img.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
      className="font-work relative pb-9 pt-15 md:py-20 min-h-screen"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          paddingTop: isStepperOpen ? `${stepperHeight + 40}px` : '60px',
        }}
        className="max-w-[1200px] mx-auto px-4 lg:px-10 transition-[padding-top,opacity]"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="font-medium font-30 text-white mb-4">
            {stepContent[step].title}
          </h2>
          <p className="font-16 text-dark-grey">{stepContent[step].desc}</p>
        </motion.div>

        {step === 1 && (
          <motion.div variants={itemVariants}>
            <CompanyForm
              group1={kycGroup1}
              group2={kycGroup2}
              group3={kycGroup3}
              group4={kycGroup4}
              initialValues={savedData}
              externalValues={{ nationality: userCountry }}
              onSubmit={handleStep1Submit}
              button={{ label: 'Next', variant: 'formButton' }}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div variants={itemVariants}>
            <UserKycDocumentsUploadStep
              onSubmit={handleStep2Submit}
              externalValues={{ nationality: userCountry }}
              onBack={() => dispatch(saveUserKycStep(1))}
              loading={isPending}
            />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
