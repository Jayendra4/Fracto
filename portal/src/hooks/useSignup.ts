/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed signup payloads, matches the pattern in rwa.api.ts */
import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import {
  saveRegistrationData,
  clearRegistrationData,
} from '@/redux/slices/authSlice';
import { useSendOtp, useRegister, useCheckIdentifier } from '@/api';
import {
  splitDialAndMobile,
  safeLoadJSON,
  safeSaveJSON,
} from '@/utils/signup.utils';
import type {
  IAuthSendCodeReq,
  ISignupModalPayload,
  SignupStep,
} from '@/interface';
import {
  signupFields,
  verifyOtps,
  passwordFields,
} from '@/constants/resgistration';
import { buildFinalStepFields } from '@/constants/resgistration';
import { useNavigate } from 'react-router-dom';
import { setAuthData } from '@/redux/slices/authLoginSlice';
import { useCountries } from '@/api';
import { useFetchUserDataFlow } from './useFetchUserDataFlow';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseApp } from '@/lib/firebase';
import { useRegisterDeviceToken } from '@/api';

interface UseSignupReturn {
  step: SignupStep;
  setStep: Dispatch<SetStateAction<SignupStep>>;
  loading: boolean;
  collected: any;
  otpSentKey: number;
  emailResendPayload?: IAuthSendCodeReq;
  mobileResendPayload?: IAuthSendCodeReq;
  setGroupId: Dispatch<SetStateAction<number>>;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  modalPayload: ISignupModalPayload | null;

  handleSignupSubmit: (formData: Record<string, any>) => Promise<void>;
  handleCountrySubmit: (formData: Record<string, any>) => Promise<void>;
  handlePasswordSubmit: (formData: Record<string, any>) => Promise<void>;
  handleFinalSubmit: (formData: Record<string, any>) => Promise<void>;
  handleModalContinue: () => void;

  signupFields: typeof signupFields;
  verifyOtps: typeof verifyOtps;
  passwordFields: typeof passwordFields;
  finalStepFields: ReturnType<typeof buildFinalStepFields>;

  errorModal: {
    open: boolean;
    message: string;
  };
  setErrorModal: Dispatch<SetStateAction<{ open: boolean; message: string }>>;
}

interface SignupCollectedData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  number?: string;
  dialCode?: string;
  mobile?: string;
  countryId?: string;
  accountType?: string;
  registerUserType?: 'end-user' | 'business';
  sourceRole?: 'investor' | 'asset-owner' | 'broker';
  emailOTP?: string[] | string;
  mobileOTP?: string[] | string;
  verified?: boolean;
  referralCode?: string;
}

export const useSignup = (): UseSignupReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [otpSentKey, setOtpSentKey] = useState(0);
  const [groupId, setGroupId] = useState(0);
  console.log(groupId);
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: '',
  });
  const collected = useSelector(
    (state: RootState) => (state.auth.registration as SignupCollectedData) ?? {}
  );
  const emailResendPayload = collected.email
    ? {
        email: collected.email,
        type: 'register',
      }
    : undefined;
  const mobileResendPayload =
    collected.mobile && collected.dialCode
      ? {
          mobile: collected.mobile,
          country: collected.dialCode,
          type: 'register',
        }
      : undefined;

  const sourceRole = collected.sourceRole;
  const [step, setStep] = useState<SignupStep>(0);
  const [showModal, setShowModal] = useState(false);
  const [modalPayload, setModalPayload] = useState<ISignupModalPayload | null>(
    null
  );
  const [postSignupToken, setPostSignupToken] = useState<string | null>(null);
  const [postSignupRole, setPostSignupRole] = useState<string | null>(null);
  const { mutateAsync: sendOtp, isPending: isSendingOtp } = useSendOtp();
  const { mutateAsync: checkIdentifier, isPending: isCheckingIdentifier } =
    useCheckIdentifier();
  const { mutateAsync: registerUser, isPending: isRegistering } = useRegister();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const loading = isSendingOtp || isRegistering || isCheckingIdentifier;
  const { data: countryRes } = useCountries();
  const { mutate: registerDeviceToken } = useRegisterDeviceToken();
  const countries = countryRes?.success
    ? (countryRes.data ?? []).map(
        (c: { id: number; name: string; dialCode: string }) => ({
          ...c,
          id: String(c.id),
          name: c.name?.trim().toLowerCase() === 'uae' ? 'UAE' : c.name,
          dialCode: c.dialCode,
        })
      )
    : [];

  const finalStepFields = buildFinalStepFields(countries)
    .filter((field) => {
      // Always hide the accountType selector
      if (field.name === 'accountType') {
        return false;
      }

      // If user role is broker, do not show referral code input
      if (sourceRole === 'broker' && field.name === 'referralCode') {
        return false;
      }

      return true;
    })
    .map((field) =>
      // A referral code that arrived via the ?ref= URL param is
      // auto-filled — lock it so the user can't overwrite it.
      field.name === 'referralCode' && collected.referralCode
        ? { ...field, disabledByDefault: true }
        : field
    );

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

  useEffect(() => {
    const savedStep = Number(localStorage.getItem('hof_registration_step'));
    if ([0, 1, 2, 3, 4].includes(savedStep)) {
      setStep(savedStep as SignupStep);
    }

    const draft = safeLoadJSON('hof_registration_draft');

    const registerUserType = localStorage.getItem('hof_register_user_type');

    if (draft || registerUserType) {
      dispatch(
        saveRegistrationData({
          ...draft,
          ...(registerUserType ? { registerUserType } : {}),
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('hof_registration_step', step.toString());
  }, [step]);

  const persist = (payload: Record<string, any>) => {
    dispatch(saveRegistrationData(payload));
    safeSaveJSON('hof_registration_draft', { ...collected, ...payload });
  };

  const handleSignupSubmit = async (formData: Record<string, any>) => {
    try {
      persist(formData);

      const combined = formData.number ?? collected.number ?? '';
      const { dialCode, mobile, country } = splitDialAndMobile(combined);

      const checkRes = await checkIdentifier({
        email: formData.email,
        mobile,
      });

      if (checkRes.success && checkRes.data?.exists) {
        throw new Error(
          checkRes.data.message || 'Email or mobile already exists'
        );
      }

      const res = await sendOtp({
        email: formData.email,
        country,
        mobile,
        type: 'register',
      });

      if (!res.success) throw new Error(res.message);
      setOtpSentKey(Date.now());
      persist({ dialCode, mobile });
      setStep(3);
    } catch (err: any) {
      setErrorModal({
        open: true,
        message: err?.message || 'Failed to send OTP. Please try again.',
      });
    }
  };

  const handlePasswordSubmit = async (formData: Record<string, any>) => {
    persist(formData);
    setStep(4);
  };

  const handleFinalSubmit = async (formData: Record<string, any>) => {
    try {
      persist(formData);

      const finalData: SignupCollectedData = {
        ...collected,
        ...formData,
        accountType:
          sourceRole === 'broker'
            ? 'Broker'
            : sourceRole === 'asset-owner'
              ? 'Business'
              : 'CorporateInvestor',
      };

      const emailVerificationCode = Array.isArray(finalData.emailOTP)
        ? finalData.emailOTP.join('')
        : (finalData.emailOTP ?? '');

      const mobileVerificationCode = Array.isArray(finalData.mobileOTP)
        ? finalData.mobileOTP.join('')
        : (finalData.mobileOTP ?? '');

      const { mobile } = splitDialAndMobile(finalData.number ?? '');

      persist({ verified: true });

      const firstname = finalData.firstName?.trim();
      const lastname = finalData.lastName?.trim();
      const email = finalData.email?.trim();
      const password = finalData.password;
      const confirmPassword = finalData.confirmPassword;

      if (!firstname || !lastname || !email || !password || !confirmPassword) {
        throw new Error('Missing required registration fields');
      }

      // Final payload logging removed
      const selectedCountry = countries?.find(
        (c) => c.id === finalData.countryId
      );
      const regRes = await registerUser({
        firstname,
        lastname,
        email,
        password,
        confirmPassword,
        dialCode: selectedCountry?.dialCode ?? '+91',
        mobile,
        countryId: finalData.countryId!,
        accountType: finalData.accountType!,
        emailVerificationCode,
        mobileVerificationCode,
        referralCode: finalData.referralCode || undefined,
      });

      if (!regRes.success) throw new Error(regRes.message);

      setPostSignupToken(regRes.data?.accessToken ?? null);

      const resolvedRole = regRes.data?.type ?? finalData.accountType ?? 'User';
      // Success logging removed

      setPostSignupRole(resolvedRole);

      dispatch(clearRegistrationData());
      localStorage.removeItem('hof_registration_draft');
      localStorage.removeItem('hof_registration_step');
      localStorage.removeItem('hof_register_user_type');

      setModalPayload({
        title: 'Congratulations!',
        subtitle: [
          'Your account has been created,',
          'Let’s continue with the next step...',
        ],
        text: finalData.accountType === 'company' ? 'KYB' : 'KYC',
      });

      setShowModal(true);
    } catch (err: any) {
      setErrorModal({
        open: true,
        message: err?.message || 'Registration failed. Please try again.',
      });
    }
  };

  const handleModalContinue = async () => {
    try {
      if (!postSignupToken) {
        throw new Error('Authentication token missing.');
      }

      dispatch(
        setAuthData({
          token: postSignupToken,
          role: postSignupRole ?? 'user',
          isAuthenticated: true,
        })
      );

      await registerFCMToken();
      await runUserFetchFlow(postSignupToken);

      // const normalizedRole = postSignupRole?.toLowerCase?.() ?? 'user';

      // const redirectPath =
      //   normalizedRole === 'corporateinvestor'
      //     ? '/dashboard'
      //     : '/complete-profile';

      // if (groupId) {
      //   navigate(`/primary-club-details/${groupId}`);
      // } else {
      //   navigate('/primary-club');
      // }

      navigate('/dashboard');
    } catch (err: any) {
      setErrorModal({
        open: true,
        message: err?.message || 'Failed after registration.',
      });
    }
  };

  const handleCountrySubmit = async (formData: Record<string, any>) => {
    try {
      persist(formData);
      setStep(2);
    } catch {
      setErrorModal({
        open: true,
        message: 'Failed to save country and account type.',
      });
    }
  };

  return {
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
    handleModalContinue,
    signupFields,
    verifyOtps,
    passwordFields,
    finalStepFields,
    errorModal,
    setErrorModal,
    otpSentKey,
    emailResendPayload,
    mobileResendPayload,
    setGroupId,
  };
};
