import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useSendFcmTokenMutation } from '@/store/api/notificationApi';
import {
  useGetCountriesQuery,
  useRegisterUserMutation,
  useSendOtpMutation,
  useLoginMutation,
} from '@/store/api/authApi';
import { useLazyGetAdminProfileQuery } from '@/store/api/adminApi';
import { useAppDispatch } from '@/hooks/redux';
import { setAdminProfile, setAuthCredentials } from '@/store/slices/authSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OtpInput } from '@/components/ui/otpInput';
import toast from 'react-hot-toast';
import { LoginPanel } from '@/types';
import { getFcmToken } from '@/utils/fcmUtils';

const registerSchema = z
  .object({
    firstname: z
      .string()
      .min(1, 'First name is required')
      .regex(
        /^[a-zA-Z]+(?: [a-zA-Z]+)*$/,
        'Only alphabets and single spaces between names allowed'
      ),
    lastname: z
      .string()
      .min(1, 'Last name is required')
      .regex(
        /^[a-zA-Z]+(?: [a-zA-Z]+)*$/,
        'Only alphabets and single spaces between names allowed'
      ),
    email: z.string().trim().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[\W_]/, 'Must contain at least one special character'),
    mobile: z
      .string()
      .trim()
      .min(1, 'Mobile number is required')
      .regex(/^\d+$/, 'Mobile number must contain only digits'),
    countryId: z.number(),
    dialCode: z.string(),
    accountType: z.enum([
      'Company',
      'Developer',
      'Spv',
      'Broker',
      'CorporateInvestor',
      'Trustee',
      'AssetOwner',
      'Director',
    ]),
  })
  .superRefine((data, ctx) => {
    if (data.dialCode === '+91' && data.mobile.length !== 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mobile'],
        message: 'Mobile number must be 10 digits',
      });
    }

    if (data.dialCode === '+971' && data.mobile.length !== 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mobile'],
        message: 'Mobile number must be 9 digits',
      });
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const OTP_RESEND_TIME = 120;

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [emailTimer, setEmailTimer] = useState<number>(0);
  const [mobileTimer, setMobileTimer] = useState<number>(0);
  const { data: countryList } = useGetCountriesQuery();
  const [registerUser, { isLoading: registerLoading, error: registerError }] =
    useRegisterUserMutation();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [fetchAdmin] = useLazyGetAdminProfileQuery();
  const [sendFcmToken] = useSendFcmTokenMutation();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState('1');
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailOtpError, setEmailOtpError] = useState('');
  const [mobileOtpError, setMobileOtpError] = useState('');
  const [emailOtpSendError, setEmailOtpSendError] = useState('');
  const [mobileOtpSendError, setMobileOtpSendError] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState<boolean>(false);
  const [mobileOtpSent, setMobileOtpSent] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      mobile: '',
      countryId: 1,
      dialCode: '+91',
      accountType: 'Trustee',
    },
  });

  const selectedCountry = countryList?.find((c) => String(c.id) === selectedCountryId);
  const dialCode = watch('dialCode');
  const mobileMaxLength = dialCode === '+91' ? 10 : dialCode === '+971' ? 9 : 15;

  /* ---------------- COUNTRY ---------------- */
  const handleCountryChange = (value: string) => {
    const country = countryList?.find((c) => String(c.id) === value);
    if (!country) return;

    setSelectedCountryId(value);
    setValue('countryId', country.id);
    setValue('dialCode', country.dialCode);
    void trigger(['mobile', 'dialCode']);
  };

  const getOtpValidationError = (otp: string, sent: boolean) => {
    if (!sent) return 'Please send OTP first';
    if (otp.length === 0) return 'OTP is required';
    if (otp.length !== 6) return 'Invalid OTP';
    return '';
  };

  /* ---------------- SEND OTP ---------------- */
  const handleSendOtp = async (type: 'email' | 'mobile') => {
    const fields = type === 'mobile' ? (['mobile', 'dialCode'] as const) : (['email'] as const);
    const isValid = await trigger(fields);

    if (!isValid) return;

    const data = getValues();
    const countryName = selectedCountry?.name;

    if (type === 'email') setEmailOtpSendError('');
    else setMobileOtpSendError('');

    try {
      if (type === 'email') {
        await sendOtp({
          email: data.email.toLowerCase(),
          country: countryName,
          type: 'register',
        }).unwrap();
        setEmailOtpSent(true);
        setEmailOtpError('');
        setEmailTimer(OTP_RESEND_TIME);
      }

      if (type === 'mobile') {
        await sendOtp({
          mobile: data.dialCode + data.mobile.trim(),
          country: countryName,
          type: 'register',
        }).unwrap();
        setMobileOtpSent(true);
        setMobileOtpError('');
        setMobileTimer(OTP_RESEND_TIME);
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to send OTP';
      if (type === 'email') setEmailOtpSendError(message);
      else setMobileOtpSendError(message);
      console.error('Send OTP failed', err);
    }
  };

  /* ---------------- REGISTER ---------------- */
  const onSubmit = async (data: RegisterFormData) => {
    const isFormValid = await trigger();

    if (!isFormValid) return;

    const emailOtpValidation = emailOtpSent ? getOtpValidationError(emailOtp, emailOtpSent) : '';

    const mobileOtpValidation = mobileOtpSent
      ? getOtpValidationError(mobileOtp, mobileOtpSent)
      : '';

    setEmailOtpError(emailOtpValidation);
    setMobileOtpError(mobileOtpValidation);

    if (emailOtpValidation || mobileOtpValidation) return;

    try {
      await registerUser({
        ...data,
        email: data.email.toLowerCase(),
        mobile: data.dialCode + data.mobile.trim(),
        emailVerificationCode: emailOtp,
        mobileVerificationCode: mobileOtp,
      }).unwrap();

      const auth = await login({
        email: data.email.toLowerCase(),
        password: data.password,
        loginPanel: LoginPanel.TRUSTEE,
      }).unwrap();

      dispatch(setAuthCredentials(auth));
      const admin = await fetchAdmin().unwrap();
      dispatch(setAdminProfile(admin));

      //  FCM Token Registration
      try {
        const token = await getFcmToken();
        if (token) {
          await sendFcmToken({ token }).unwrap();
          console.log('FCM Token registered successfully on registration');
        }
      } catch (fcmError) {
        console.error('FCM Registration failed during registration:', fcmError);
      }

      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed', err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer((t) => t - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emailTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (mobileTimer > 0) {
      interval = setInterval(() => {
        setMobileTimer((t) => t - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mobileTimer]);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Register</h1>

      {registerError && (
        <ErrorBanner
          type="error"
          title="Registration Failed"
          message={(registerError as any)?.data?.message || 'Something went wrong'}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input {...register('firstname')} placeholder="Enter First Name" />
          {errors.firstname && (
            <p className="text-sm text-destructive">{errors.firstname.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input {...register('lastname')} placeholder="Enter Last Name" />
          {errors.lastname && <p className="text-sm text-destructive">{errors.lastname.message}</p>}
        </div>

        {/* Email + OTP */}
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="flex gap-2">
            <Input type="email" {...register('email')} placeholder="Enter Email" />
            <Button type="button" onClick={() => handleSendOtp('email')} disabled={otpLoading}>
              Send OTP
            </Button>
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          {emailOtpSendError && !emailOtpSent && (
            <p className="text-sm text-destructive">{emailOtpSendError}</p>
          )}
          {(emailOtpSent || emailOtpError) && (
            <div className="mt-2">
              {emailOtpSent && (
                <OtpInput
                  value={emailOtp}
                  onChange={(value) => {
                    setEmailOtp(value);
                    setEmailOtpError('');
                  }}
                />
              )}
              {(emailOtpError || emailOtpSendError) && (
                <p className="text-sm text-destructive mt-1">
                  {emailOtpError || emailOtpSendError}
                </p>
              )}

              {emailOtpSent && (
                <p className="text-sm text-muted-foreground mt-3">
                  {emailTimer > 0 ? (
                    <>
                      Resend OTP in <span className="font-semibold">{emailTimer}s</span>
                    </>
                  ) : (
                    <span
                      className="text-primary cursor-pointer font-semibold"
                      onClick={() => handleSendOtp('email')}
                    >
                      Resend OTP
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={selectedCountryId} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryList?.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.flag} {c.name} ({c.dialCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile + OTP */}
        <div className="space-y-2">
          <Label>Mobile</Label>
          <div className="flex gap-2">
            <Input
              {...register('mobile')}
              placeholder="Enter Mobile Number"
              maxLength={mobileMaxLength}
              inputMode="numeric"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
              }}
            />
            <Button type="button" onClick={() => handleSendOtp('mobile')} disabled={otpLoading}>
              Send OTP
            </Button>
          </div>
          {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
          {mobileOtpSendError && !mobileOtpSent && (
            <p className="text-sm text-destructive">{mobileOtpSendError}</p>
          )}
          {!errors.mobile && (mobileOtpSent || mobileOtpError) && (
            <div className="mt-2">
              {mobileOtpSent && (
                <OtpInput
                  value={mobileOtp}
                  onChange={(value) => {
                    setMobileOtp(value);
                    setMobileOtpError('');
                  }}
                />
              )}
              {(mobileOtpError || mobileOtpSendError) && (
                <p className="text-sm text-destructive mt-1">
                  {mobileOtpError || mobileOtpSendError}
                </p>
              )}

              {mobileOtpSent && (
                <p className="text-sm text-muted-foreground mt-3">
                  {mobileTimer > 0 ? (
                    <>
                      Resend OTP in <span className="font-semibold">{mobileTimer}s</span>
                    </>
                  ) : (
                    <span
                      className="text-primary cursor-pointer font-semibold"
                      onClick={() => handleSendOtp('mobile')}
                    >
                      Resend OTP
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter Password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={registerLoading || loginLoading} className="w-full">
          {(registerLoading || loginLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <span
          onClick={() => navigate('/login')}
          className="cursor-pointer font-medium text-[#FFB816] hover:underline"
        >
          Sign in
        </span>
      </div>
    </div>
  );
}
