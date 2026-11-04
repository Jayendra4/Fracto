import { useEffect, useState, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSignup } from '@/hooks/useSignup';
import { useRef } from 'react';
import type { SignupStep } from '@/interface';

import {
  // SignupProgressBar,
  SignupHeader,
  SignupStep0Welcome,
  SignupStep3Password,
  SignupModal,
} from '@/components/SignUp';

import { maskEmail, maskMobile } from '@/utils/mask.utils';
import SignupStep1 from '@/components/SignUp/SignupStep1';
import SignupStep2Form from '@/components/SignUp/SignupStep2Form';
import SignupStep4OTP from '@/components/SignUp/SignupStep4OTP';
import StatusModal from '@/components/Modals/Status';
import Loader from '@/components/Loader';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import useIsMobile from '@/hooks/Animation/useIsMobile';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { saveRegistrationData } from '@/redux/slices/authSlice';
// import AuthPageAnime from '@/components/Animation/AuthPageAnime';

export default function Signup(): JSX.Element {
  const navigate = useNavigate();
  const [fade, setFade] = useState(true);
  const [stepLoading, setStepLoading] = useState(false);
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const groupId = location.state?.groupId;

  const {
    step,
    setStep,
    loading,
    collected,
    showModal,
    setShowModal,
    modalPayload,
    handleSignupSubmit,
    handleCountrySubmit,
    handlePasswordSubmit,
    handleFinalSubmit,
    signupFields,
    verifyOtps,
    passwordFields,
    finalStepFields,
    handleModalContinue,
    errorModal,
    setErrorModal,
    otpSentKey,
    emailResendPayload,
    mobileResendPayload,
    setGroupId,
  } = useSignup();

  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';
  const bgImage = !isDark
    ? "bg-[url('/images/auth/auth-bg-dark.png')]"
    : "bg-[url('/images/auth/auth-bg-light.png')]";

  useEffect(() => {
    if (groupId) {
      setGroupId(groupId);
    }
  }, [groupId, setGroupId]);

  useEffect(() => {
    setFade(false);
    setStepLoading(true);

    const t = setTimeout(() => {
      setFade(true);
      setStepLoading(false);
    }, 300);

    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (initializedFromUrl) return;

    const searchParams = new URLSearchParams(location.search);
    const urlRoleOrType = searchParams.get('role') || searchParams.get('type');
    const urlReferral =
      searchParams.get('referral') || searchParams.get('ref') || undefined;
    const urlStepRaw = searchParams.get('step');
    const urlStep = urlStepRaw ? Number(urlStepRaw) : NaN;

    if (!urlRoleOrType && !urlReferral && Number.isNaN(urlStep)) {
      setInitializedFromUrl(true);
      return;
    }

    const payload: {
      registerUserType?: 'end-user' | 'business';
      sourceRole?: 'investor' | 'asset-owner' | 'broker';
      referralCode?: string;
    } = {};

    if (urlRoleOrType) {
      const normalized = urlRoleOrType.toLowerCase();

      let registerUserType: 'end-user' | 'business' = 'end-user';
      let sourceRole: 'investor' | 'asset-owner' | 'broker' | undefined;

      if (normalized.includes('broker')) {
        registerUserType = 'business';
        sourceRole = 'broker';
      } else if (normalized.includes('asset')) {
        registerUserType = 'business';
        sourceRole = 'asset-owner';
      } else {
        registerUserType = 'end-user';
        sourceRole = 'investor';
      }

      payload.registerUserType = registerUserType;
      if (sourceRole) {
        payload.sourceRole = sourceRole;
      }

      localStorage.setItem('hof_register_user_type', registerUserType);
    }

    if (urlReferral) {
      payload.referralCode = urlReferral;
    }

    if (Object.keys(payload).length > 0) {
      dispatch(saveRegistrationData(payload));
    }

    if (!Number.isNaN(urlStep) && [0, 1, 2, 3, 4].includes(urlStep)) {
      setStep(urlStep as SignupStep);
    } else if (urlRoleOrType) {
      setStep(1);
    }

    setInitializedFromUrl(true);
  }, [location.search, dispatch, setStep, initializedFromUrl]);

  const initialForSignup = {
    firstName: collected.firstName ?? '',
    lastName: collected.lastName ?? '',
    email: collected.email ?? '',
    number: collected.number ?? '',
  };

  const initialForOTP = {
    emailOTP: collected.emailOTP ?? Array(6).fill(''),
    mobileOTP: collected.mobileOTP ?? Array(6).fill(''),
  };

  const initialForPassword = {
    password: collected.password ?? '',
    confirmPassword: collected.confirmPassword ?? '',
  };

  const initialForFinal = {
    accountType: collected.accountType ?? '',
    countryId: collected.country ?? '',
    referralCode: collected.referralCode ?? '',
  };

  const maskedEmail = maskEmail(collected.email || '');
  const maskedMobile = maskMobile(collected.mobile || '');

  const handleBack = () => {
    if (step === 0) {
      navigate('/');
      return;
    }
    setStep((s) => (s > 0 ? ((s - 1) as SignupStep) : 0));
  };

  const modalPayloadForUI =
    modalPayload && Array.isArray(modalPayload.subtitle)
      ? {
          ...modalPayload,
          subtitle: (
            <span>
              <span className="font-medium">{modalPayload.subtitle[0]}</span>{' '}
              {modalPayload.subtitle[1]}
            </span>
          ),
        }
      : modalPayload;

  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    if (autoCollapsed) return;

    const t = setTimeout(() => {
      setSheetOpen(true);
      setAutoCollapsed(true);
    }, 1500);

    return () => clearTimeout(t);
  }, [autoCollapsed]);

  const sheetVariants: Variants = {
    open: {
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 24 },
    },
    collapsed: {
      y: '70%',
      transition: { type: 'spring', stiffness: 120, damping: 24 },
    },
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [step]);

  return (
    <section
      className="min-h-screen overflow-y-auto bg-[var(--auth-bg)]
 flex items-center justify-center text-[var(--fg)] font-work p-0 lg:p-5 xl:p-10 py-10"
    >
      {(loading || stepLoading) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div
        className={`w-full lg:min-h-[800px] lg:h-full lg:rounded-[40px] overflow-hidden flex items-center ${bgImage} bg-no-repeat bg-cover bg-center`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden w-full">
          <div className="flex flex-col justify-center items-center gap-5 text-[var(--fg)] ">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-30 font-medium text-center"
            >
              Smart Real Estate Investment Benefits
            </motion.h2>
            {isDark ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                src="/images/auth/signup-hero-dark.png"
                className={`w-full max-w-[620px]`}
                alt="Logo"
              />
            ) : (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                src="/images/auth/signup-hero-light.png"
                className={`w-full max-w-[620px]`}
                alt="Logo"
              />
            )}

            {/* <div className="w-full flex  flex-col-reverse lg:fl justify-center items-center px-4 xl:mt-[73px] md:px-8 lg:px-12 py-8">
              <AuthPageAnime />
            </div> */}

            {/* <motion.div
              className="flex flex-col justify-end items-center max-w-[650px] mt-16 lg:mt-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="font-new-44 tracking-[-6%] font-semibold leading-[56px]">
                Welcome back
              </h2>
              <p className="p-4 text-center tracking-[-6%] font-16 leading-[100%] font-normal">
                Access your fractional investments, track property performance,
                and manage your digital real estate portfolio—all in one place.
                Invest Smarter. Own Fractionally. Grow Confidently.
              </p>
            </motion.div> */}
          </div>

          <motion.div
            className="fixed lg:static bottom-0 left-0 w-full
             flex flex-col items-center justify-start lg:justify-center
             p-0 md:p-8 z-30"
            variants={isMobile ? sheetVariants : undefined}
            initial={isMobile ? 'open' : false}
            animate={isMobile ? (sheetOpen ? 'open' : 'collapsed') : false}
            drag={isMobile ? 'y' : false}
            dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
            dragElastic={isMobile ? 0.2 : 0}
            onDragEnd={
              isMobile
                ? (_, info) => {
                    if (info.offset.y > 80) setSheetOpen(false);
                    if (info.offset.y < -80) setSheetOpen(true);
                  }
                : undefined
            }
          >
            <div
              className={`max-w-[832px] lg:max-w-[690px] w-full min-h-fit lg:min-h-[640px] flex flex-col justify-start lg:justify-center bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-2xl rounded-tl-[30px] rounded-tr-[30px] rounded-bl-0 rounded-br-0 md:rounded-[30px] px-4 md:px-8 pt-0 py-4 lg:py-6 transition-all duration-300 ${fade ? 'opacity-100' : 'opacity-0'} `}
            >
              <div
                className="flex lg:hidden justify-center items-center pt-3"
                onClick={() => setSheetOpen(!sheetOpen)}
              >
                <div className="w-[80px] h-1 bg-[var(--fg)]/30 rounded-lg"></div>
              </div>

              <div className="w-full h-auto lg:h-full flex flex-col justify-start lg:justify-center items-center gap-2">
                <div className="gap-3 text-[var(--fg)]">
                  {step < 3 && (
                    <h2 className="font-medium font-36 leading-[56px] text-center whitespace-nowrap ">
                      Create Your Account
                    </h2>
                  )}

                  {step === 3 && (
                    <h2 className="font-medium font-36 leading-[56px] text-center">
                      Create Password
                    </h2>
                  )}

                  {step === 4 && (
                    <h2 className="font-medium font-36 leading-[56px] text-center">
                      OTP Verification
                    </h2>
                  )}

                  {(step === 0 || step === 1 || step === 2) && (
                    <p className="font-normal font-16 leading-[20px] tracking-[0%] text-dark-grey pb-2  text-center">
                      Enter your details to get started. It only takes a few
                      minutes...
                    </p>
                  )}

                  {/* {step === 1 && (
                    <p className="font-medium font-16 text-dark-grey pb-4 text-center">
                      Enter your details to get started. It only takes a few
                      minutes...
                    </p>
                  )}

                  {step === 2 && (
                    <p className="font-medium font-16 text-dark-grey pb-4 text-center">
                      Enter your details to get started. It only takes a few
                      minutes...
                    </p>
                  )} */}

                  {step === 3 && (
                    <p className="font-medium font-16 text-dark-grey text-center">
                      Create a strong password that meets all security
                      requirements.
                    </p>
                  )}

                  {step === 4 && (
                    <p className="font-medium font-16 text-dark-grey text-center">
                      Enter OTP received in your email and start your journy!
                    </p>
                  )}
                </div>
                <div
                  ref={scrollRef}
                  className={`w-full mx-auto flex-1 pr-1 overscroll-contain scrollbar-thin scrollbar-ui scrollbar-thumb-[var(--fg)]/20 
                  ${step === 0 || step === 1 ? 'overflow-y-auto lg:overflow-hidden' : 'overflow-y-auto'}`}
                >
                  {step === 0 && <SignupStep0Welcome setStep={setStep} />}
                  {step === 1 && (
                    <SignupStep1
                      loading={loading}
                      onSubmit={handleCountrySubmit}
                      initialValues={initialForFinal}
                      fields={finalStepFields}
                    />
                  )}
                  {step === 2 && (
                    <SignupStep2Form
                      loading={loading}
                      onSubmit={handleSignupSubmit}
                      initialValues={initialForSignup}
                      fields={signupFields}
                    />
                  )}
                  {step === 3 && (
                    <SignupStep3Password
                      loading={loading}
                      onSubmit={handlePasswordSubmit}
                      initialValues={initialForPassword}
                      fields={passwordFields}
                    />
                  )}
                  {step === 4 && (
                    <SignupStep4OTP
                      loading={loading}
                      onSubmit={handleFinalSubmit}
                      initialValues={initialForOTP}
                      fields={verifyOtps}
                      emailMask={maskedEmail}
                      mobileMask={maskedMobile}
                      emailResendPayload={emailResendPayload}
                      mobileResendPayload={mobileResendPayload}
                      otpSentKey={otpSentKey}
                      autoFocus
                    />
                  )}

                  {step < 2 ? (
                    <div className="pt-2 ">
                      <SignupHeader handleBack={handleBack} />
                    </div>
                  ) : (
                    <div className="pb-2"></div>
                  )}
                </div>
                {step >= 2 && step < 5 ? (
                  <SignupHeader handleBack={handleBack} />
                ) : (
                  ' '
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <SignupModal
        showModal={showModal}
        setShowModal={setShowModal}
        modalPayload={modalPayloadForUI}
        handleModalContinue={handleModalContinue}
      />

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
