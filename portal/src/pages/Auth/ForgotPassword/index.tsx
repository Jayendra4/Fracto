import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotForm from './ForgotForm';
import StatusModal from '@/components/Modals/Status';
import HandleBack from '@/components/UI/Handleback';

import { getForgotFields, isValidMobile } from './forgotPassword.constants';
import { resetFields } from './resetPassword.constants';

import { useForgotPassword, useResetPassword } from '@/api';
import { CiMail } from 'react-icons/ci';
import { FiPhone } from 'react-icons/fi';
import { maskEmail, maskMobile } from '@/utils/mask.utils';
import { motion, type Variants } from 'framer-motion';
import useIsMobile from '@/hooks/Animation/useIsMobile';
import Loader from '@/components/Loader';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

type Step = 'forgot' | 'reset';
type ContactTab = 'email' | 'mobile';

export default function ForgotPassword() {
  const navigate = useNavigate();
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
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';
  const bgImage = !isDark
    ? "bg-[url('/images/auth/auth-bg-dark.png')]"
    : "bg-[url('/images/auth/auth-bg-light.png')]";
  const [step, setStep] = useState<Step>('forgot');
  const [activeTab, setActiveTab] = useState<ContactTab>('email');
  const [otpSentKey, setOtpSentKey] = useState<number>(0);

  const [collected, setCollected] = useState<Record<string, any>>({});
  const maskedEmail = collected.email ? maskEmail(collected.email) : '';
  const maskedMobile = collected.mobile ? maskMobile(collected.mobile) : '';

  const [status, setStatus] = useState({
    open: false,
    type: 'success' as 'success' | 'error',
    message: '',
  });

  const forgotOtp = useForgotPassword();
  const resetPassword = useResetPassword();

  //send-otp
  const handleSendOtp = (data: any) => {
    const payload: any = {};

    if (activeTab === 'email') {
      payload.email = data.email;
    } else {
      const mobile = data.mobile; // ← STRING like "+919988997788"

      if (!mobile || !isValidMobile(mobile)) {
        setStatus({
          open: true,
          type: 'error',
          message: 'Enter a valid mobile number',
        });
        return;
      }

      payload.mobile = mobile;
    }

    forgotOtp.mutate(payload, {
      onSuccess: (res: any) => {
        if (!res.success) {
          setStatus({
            open: true,
            type: 'error',
            message: res.message,
          });
          return;
        }

        setCollected({ ...payload, activeTab });
        setOtpSentKey(Date.now());
        setStep('reset');
      },
      onError: (err: any) => {
        setStatus({
          open: true,
          type: 'error',
          message: err?.response?.data?.message || 'Failed to send OTP...',
        });
      },
    });
  };

  //reset-password
  const handleReset = (data: any) => {
    resetPassword.mutate(
      {
        email: collected.activeTab === 'email' ? collected.email : undefined,
        mobile: collected.activeTab === 'mobile' ? collected.mobile : undefined,
        code: data.otp.join(''),
        newPassword: data.password,
      },
      {
        onSuccess: (res: any) => {
          if (res.success) {
            setStatus({
              open: true,
              type: 'success',
              message: res.message || 'Password updated successfully',
            });
          } else {
            setStatus({
              open: true,
              type: 'error',
              message: res.message || 'Reset failed...',
            });
          }
        },
        onError: (err: any) => {
          setStatus({
            open: true,
            type: 'error',
            message: err?.response?.data?.message || 'Reset failed...',
          });
        },
      }
    );
  };

  return (
    <section className="min-h-screen overflow-y-auto bg-[var(--auth-bg)] flex items-center justify-center text-[var(--fg)] font-work p-0 lg:p-5 xl:p-8 py-10">
      {(forgotOtp.isPending || resetPassword.isPending) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}
      <div
        className={`w-full lg:min-h-[800px] lg:h-full lg:rounded-[40px] overflow-hidden flex items-center ${bgImage} bg-no-repeat bg-cover bg-center`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full">
          <div className="flex flex-col justify-center items-center gap-5 text-[var(--fg)]  p-0 md:p-10 ">
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
          </div>

          <motion.div
            className="fixed lg:static bottom-0 left-0 w-full
             flex flex-col items-center justify-start lg:justify-center
             p-0 md:p-4 lg:p-8 z-30"
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
                className="flex lg:hidden justify-center items-center pb-3"
                onClick={() => setSheetOpen(!sheetOpen)}
              >
                <div className="w-[80px] h-1 bg-[var(--fg)]/30 rounded-lg"></div>
              </div>
              {step === 'forgot' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full text-center"
                >
                  <h1 className="font-28 font-semibold">Forgot Password</h1>
                  <p className="font-18 text-[var(--fg)]/60 mt-1">
                    Securely recover your account
                  </p>
                </motion.div>
              )}

              {/* --tab-- */}
              {step === 'forgot' && (
                <div className="flex w-full p-1 bg-[var(--fg)]/5 rounded-full mt-6 mb-8 relative font-18">
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--inner-card)] border border-[var(--fg)]/10 rounded-full transition-all duration-300 shadow-sm ${activeTab === 'mobile'
                      ? 'translate-x-full'
                      : 'translate-x-0'
                      }`}
                  />
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`relative z-10 flex-1 flex gap-2 items-center justify-center py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'email'
                      ? 'text-[var(--fg)]'
                      : 'text-[var(--fg)]/50'
                      }`}
                  >
                    <CiMail size={18} />
                    Email
                  </button>

                  <button
                    onClick={() => setActiveTab('mobile')}
                    className={`relative z-10 flex-1 flex gap-2 items-center justify-center py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'mobile'
                      ? 'text-[var(--fg)]'
                      : 'text-[var(--fg)]/50'
                      }`}
                  >
                    <FiPhone size={18} />
                    Phone
                  </button>
                </div>
              )}

              {step === 'forgot' && (
                <ForgotForm
                  isForgot
                  key={activeTab}
                  fields={getForgotFields(activeTab)}
                  onSubmit={handleSendOtp}
                  className="!p-0 w-full !font-32"
                  button={{
                    label: forgotOtp.isPending
                      ? 'Generating OTP...'
                      : 'Generate OTP',
                    variant: 'formButton',
                  }}
                />
              )}

              {step === 'reset' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <ForgotForm
                    isForgot={true}
                    fields={resetFields}
                    onSubmit={handleReset}
                    emailMask={maskedEmail}
                    mobileMask={maskedMobile}
                    emailResendPayload={
                      collected.activeTab === 'email'
                        ? { email: collected.email, type: 'resetpassword' }
                        : undefined
                    }
                    mobileResendPayload={
                      collected.activeTab === 'mobile'
                        ? { mobile: collected.mobile, type: 'resetpassword' }
                        : undefined
                    }
                    otpSentKey={otpSentKey}
                    className="!p-0 w-full !font-32"
                    button={{
                      label: resetPassword.isPending
                        ? 'Resetting...'
                        : 'Reset Password',
                      variant: 'formButton',
                    }}
                  />
                </motion.div>
              )}

              <div className="pt-4 pb-2">
                <HandleBack />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <StatusModal
        open={status.open}
        status={status.type}
        message={status.message}
        onClose={() => {
          setStatus((s) => ({ ...s, open: false }));
          if (status.type === 'success') navigate('/login');
        }}
        onContinue={() => {
          setStatus((s) => ({ ...s, open: false }));
          if (status.type === 'success') navigate('/login');
        }}
      />
    </section>
  );
}
