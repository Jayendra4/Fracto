/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed login payloads, matches the pattern in rwa.api.ts */
import { useEffect, useState } from 'react';
import Form from '@/components/Form';
import { loginFields } from '@/constants/login.constants';
import { loginFields2 } from '@/constants/login2.constant';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthData } from '@/redux/slices/authLoginSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import type { IAuthLoginReq, IAuthSendCodeReq } from '@/interface';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import Loader from '@/components/Loader';
import SignupHeader from '@/components/SignUp/SignupHeader';
import { useLogin, useVerifyPassword } from '@/api';
import { useOtpFlow } from '@/hooks/useOtpFlow';
import { maskEmail, maskMobile } from '@/utils/mask.utils';
import { CiMail } from 'react-icons/ci';
import { FiPhone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useIsMobile from '@/hooks/Animation/useIsMobile';
import type { Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseApp } from '@/lib/firebase';
import { useRegisterDeviceToken } from '@/api';
import type { RootState } from '@/redux/store';
import StatusModal from '@/components/Modals/Status';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const [step, setStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [collected, setCollected] = useState<Record<string, any>>({});
  const location = useLocation();
  const groupId = location.state?.groupId;

  // const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'error' as 'success' | 'error',
    title: '',
    message: '',
  });

  const [otpSentKey, setOtpSentKey] = useState(0);
  const { mutate: registerDeviceToken } = useRegisterDeviceToken();
  const emailResendPayload =
    activeTab === 'email' && collected.email
      ? {
          email: collected.email,
          type: 'login',
        }
      : undefined;
  const mobileResendPayload =
    activeTab === 'phone' && collected.mobile
      ? {
          mobile: collected.mobile,
          country: collected.country || '',
          type: 'login',
        }
      : undefined;
  const { sendOtp, sending, error: otpError, clearError } = useOtpFlow();
  const { mutate: login, isPending: loggingIn } = useLogin();
  const { mutateAsync: verifyPassword } = useVerifyPassword();

  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';
  const bgImage = !isDark
    ? "bg-[url('/images/auth/auth-bg-dark.png')]"
    : "bg-[url('/images/auth/auth-bg-light.png')]";

  const registerFCMToken = async () => {
    try {
      const messaging = getMessaging(firebaseApp);
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        registerDeviceToken({ token });
      }
    } catch (e) {
      console.error('FCM token registration failed', e);
    }
  };

  // useEffect(() => {
  //   console.log(activeTab);
  // });

  // useEffect(() => {
  //   if (otpError) {
  //     setStatusModal({
  //       open: true,
  //       status: 'error',
  //       title: 'Error',
  //       message: otpError,
  //     });
  //   }
  // }, [otpError, clearError]);

  useEffect(() => {
    if (!otpError) return;

    setStatusModal({
      open: true,
      status: 'error',
      title: 'Error',
      message: otpError,
    });

    clearError(); // ✅ reset source state
  }, [otpError]);

  const extractCountryAndMobile = (raw: string) => {
    if (!raw.startsWith('+')) {
      return { country: '', mobile: raw };
    }
    const digits = raw.slice(1);

    if (digits.startsWith('971')) {
      return {
        country: '+971',
        mobile: raw,
      };
    }
    if (digits.startsWith('91')) {
      return {
        country: '+91',
        mobile: raw,
      };
    }
    return {
      country: '+' + digits.slice(0, digits.length - 10),
      mobile: raw,
    };
  };

  const handleSendOtp = async (formData: Record<string, any>) => {
    try {
      let verifyPayload: {
        email?: string;
        mobile?: string;
        password: string;
      };

      let otpPayload: IAuthSendCodeReq;

      if (activeTab === 'email') {
        verifyPayload = {
          email: formData.email,
          password: formData.password,
        };

        otpPayload = {
          email: formData.email,
          type: 'login',
        };

        setCollected(formData);
      } else {
        const { country, mobile } = extractCountryAndMobile(
          formData.mobile || ''
        );

        verifyPayload = {
          mobile,
          password: formData.password,
        };

        otpPayload = {
          country,
          mobile,
          type: 'login',
        };

        setCollected({
          ...formData,
          country,
          mobile,
        });
      }

      const verifyRes = await verifyPassword(verifyPayload);

      if (!verifyRes.success) {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: verifyRes.message || 'Invalid credentials',
        });

        return;
      }

      const success = await sendOtp(otpPayload);

      if (success) {
        setOtpSentKey(Date.now());
        setStep(2);
      }
    } catch (err: any) {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Error',
        message:
          err?.message || 'Unable to verify credentials. Please try again.',
      });
    }
  };

  const handleVerifyOtp = (formData: Record<string, any>) => {
    const otpArray = formData?.otp;

    if (
      !Array.isArray(otpArray) ||
      otpArray.length !== 6 ||
      otpArray.some((d: string) => !d || d.trim() === '')
    ) {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Error',
        message: 'Please enter the complete 6-digit OTP',
      });
      return;
    }

    const otp = otpArray.join('');

    const payload: IAuthLoginReq = {
      password: collected.password ?? '',
      loginPanel: 'User',

      ...(activeTab === 'email'
        ? {
            email: collected.email ?? '',
            emailVerificationCode: otp,
            mobileVerificationCode: '',
          }
        : {
            mobile: collected.mobile ?? '',
            emailVerificationCode: '',
            mobileVerificationCode: otp,
          }),
    };

    login(payload, {
      onSuccess: (res) => {
        if (!res.success) {
          setStatusModal({
            open: true,
            status: 'error',
            title: 'Error',
            message: res.message || 'Login failed',
          });
          return;
        }
        const token = res?.data?.accessToken || '';
        const role = res.data?.type ?? 'User';
        dispatch(setAuthData({ token, role, isAuthenticated: true }));
        registerFCMToken();
        runUserFetchFlow(token);
        // if (groupId) {
        //   navigate(`/primary-club-details/${groupId}`);
        // } else {
        //   navigate('/primary-club');
        // }
        navigate('/dashboard');
        localStorage.removeItem('hof_login_draft');
      },
      onError: (err: any) => {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: err.message || 'Login failed',
        });
      },
    });
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
      return;
    } else if (step === 2) {
      setStep(1);
      return;
    }
    setStep(1);
  };

  const maskedEmail = collected.email ? maskEmail(collected.email) : '';
  const maskedMobile = collected.mobile ? maskMobile(collected.mobile) : '';

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
      y: '75%',
      transition: { type: 'spring', stiffness: 120, damping: 24 },
    },
  };

  return (
    <section className="min-h-screen overflow-y-auto bg-[var(--auth-bg)] flex items-center justify-center text-[var(--fg)] font-work p-0 lg:p-5 xl:p-8 py-10">
      {(sending || loggingIn) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}
      <div
        className={`w-full lg:min-h-[800px] lg:h-full lg:rounded-[40px] overflow-hidden flex items-center ${bgImage} bg-no-repeat bg-cover bg-center`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full">
          <div className="flex flex-col justify-center items-center gap-5 text-[var(--fg)]  p-0 md:p-10   ">
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
            {/* <div className="w-full flex justify-center items-center px-4 xl:mt-[103px] md:px-8 lg:px-12 xl:py-0 py-8">
              <AuthPageAnime />
            </div>
            <motion.div
              className="flex flex-col justify-center items-center max-w-[650px] pt-0 md:pt-10 xl:pt-1 "
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="font-new-44 tracking-[-6%] font-semibold leading-[56px]">
                Welcome back
              </h2>
              <p className="px-4 py-2 text-center tracking-[-6%] font-16 leading-[100%] font-normal">
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
              className="max-w-[832px] lg:max-w-[522px] w-full min-h-fit flex flex-col items-center justify-start lg:justify-center bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-2xl
             rounded-tl-[30px] rounded-tr-[30px] rounded-bl-0 rounded-br-0 md:rounded-[30px] px-6 md:px-8 lg:px-12 py-6 xl:py-10 "
            >
              <div
                className="flex lg:hidden justify-center items-center pb-3 md:py-3"
                onClick={() => setSheetOpen(!sheetOpen)}
              >
                <div className="w-[80px] h-1 bg-[var(--fg)]/30 rounded-lg"></div>
              </div>
              {step === 1 && (
                <div className="flex w-full max-w-[500px] p-1 bg-[var(--fg)]/5 rounded-full mt-6 mb-8 relative">
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--inner-card)] border border-[var(--fg)]/10 rounded-full transition-all duration-300 shadow-sm ${
                      activeTab === 'phone'
                        ? 'translate-x-full'
                        : 'translate-x-0'
                    }`}
                  />
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`relative z-10 flex-1 flex gap-2 items-center justify-center py-2.5 rounded-full text-sm font-medium transition-colors ${
                      activeTab === 'email'
                        ? 'text-[var(--fg)]'
                        : 'text-[var(--fg)]/50'
                    }`}
                  >
                    <CiMail size={18} />
                    Email
                  </button>
                  <button
                    onClick={() => setActiveTab('phone')}
                    className={`relative z-10 flex-1 flex gap-2 items-center justify-center py-2.5 rounded-full text-sm font-medium transition-colors ${
                      activeTab === 'phone'
                        ? 'text-[var(--fg)]'
                        : 'text-[var(--fg)]/50'
                    }`}
                  >
                    <FiPhone size={18} />
                    Phone
                  </button>
                </div>
              )}

              {step === 1 && (
                <Form
                  isLogin
                  key={activeTab}
                  fields={activeTab === 'email' ? loginFields : loginFields2}
                  onSubmit={handleSendOtp}
                  className="!p-0 !max-w-[500px]"
                  button={{
                    label: sending ? 'Generating OTP...' : 'Generate OTP',
                    variant: 'formButton',
                  }}
                />
              )}

              {step === 2 && (
                <div className="flex flex-col gap-8 justify-between items-center">
                  <div className="py-2">
                    <h2 className="font-medium font-36 leading-[56px] text-center">
                      OTP Verification
                    </h2>
                    {activeTab === 'email' ? (
                      <p className="font-medium font-16 text-dark-grey text-center">
                        Enter OTP received in your email and start your journey!
                      </p>
                    ) : (
                      <p className="font-medium font-16 text-dark-grey text-center">
                        Enter OTP received in your phone and start your journey!
                      </p>
                    )}
                  </div>
                  <Form
                    fields={[
                      {
                        name: 'otp',
                        label:
                          activeTab === 'email'
                            ? 'Verify Email'
                            : 'Verify Phone',
                        type: 'otp',
                        inputType: activeTab,
                        required: true,
                      },
                    ]}
                    onSubmit={handleVerifyOtp}
                    className="!p-0 !max-w-[500px] "
                    emailMask={maskedEmail}
                    mobileMask={maskedMobile}
                    emailResendPayload={emailResendPayload}
                    mobileResendPayload={mobileResendPayload}
                    otpSentKey={otpSentKey}
                    autoFocus
                    isLogin
                    button={{
                      label: loggingIn ? 'Verifying...' : 'Login',
                      variant: 'formButton',
                    }}
                  />
                </div>
              )}
              <div className="w-full h-full flex flex-col items-center justify-center pt-8 gap-4">
                <div className="font-normal font-20 leading-[20px]">
                  Don’t have account?{' '}
                  <Link to="/signup" state={{ groupId: groupId }}>
                    <span className="text-blue hover:underline cursor-pointer">
                      Create Here!
                    </span>
                  </Link>{' '}
                  <br />
                  {/* <Link
                    to="/forgot-password"
                    className="font-16 flex flex-col items-center justify-center pt-1"
                  >
                    <span className="text-blue hover:underline cursor-pointer leading-none">
                      Forgot Password?
                    </span>
                  </Link> */}
                </div>
                <SignupHeader handleBack={handleBack} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        onContinue={() => setStatusModal((prev) => ({ ...prev, open: false }))}
      />
    </section>
  );
}
