import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useGetCountriesQuery, useLoginMutation } from '@/store/api/authApi';
import { useSendFcmTokenMutation } from '@/store/api/notificationApi';
import { useLazyGetAdminProfileQuery } from '@/store/api/adminApi';
import { useAppDispatch } from '@/hooks/redux';
import { setAdminProfile, setAuthCredentials } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoginPanel } from '@/types';
import { getFcmToken } from '@/utils/fcmUtils';

const schema = z
  .object({
    mobile: z
      .string()
      .nonempty('Required mobile number')
      .regex(/^\d+$/, 'Only numbers are allowed'),

    password: z.string().min(1, 'Password is required'),

    dialCode: z.string(),
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

type FormData = z.infer<typeof schema>;

export function MobileLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [dialCode, setDialCode] = useState('+91');

  const { data: countries } = useGetCountriesQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();
  const [sendFcmToken] = useSendFcmTokenMutation();
  const [fetchAdmin] = useLazyGetAdminProfileQuery();

  const maxLength = dialCode === '+91' ? 10 : 9;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dialCode: '+91',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const auth = await login({
        mobile: dialCode + data.mobile.trim(),
        password: data.password,
        loginPanel: LoginPanel.TRUSTEE,
      }).unwrap();

      dispatch(setAuthCredentials(auth));

      const admin = await fetchAdmin().unwrap();
      dispatch(setAdminProfile(admin));

      // 🔔 FCM Token Registration
      try {
        const token = await getFcmToken();

        if (token) {
          await sendFcmToken({ token }).unwrap();
          console.log('FCM Token registered successfully on mobile login');
        }
      } catch (fcmError) {
        console.error('FCM Registration failed during mobile login:', fcmError);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {error && (
        <ErrorBanner
          type="error"
          title="Login Failed"
          message={(error as any)?.data?.message || 'Invalid credentials'}
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 border border-input p-4 md:p-8 lg:p-12 rounded-[20px]"
      >
        <div className="grid grid-cols-6 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Dial Code</Label>
            <div className="relative">
              <select
                value={dialCode}
                onChange={(e) => {
                  const value = e.target.value;

                  setDialCode(value);

                  setValue('dialCode', value, {
                    shouldValidate: true,
                  });
                }}
                className="
        flex h-10 w-full rounded-md border border-input bg-background
        px-2 py-2 text-md ring-offset-background
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        appearance-none
      "
              >
                {countries?.map((c) => (
                  <option key={c.id} value={String(c.dialCode)}>
                    {c.flag} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-span-4 space-y-2">
            <Label required>Mobile</Label>

            <Input
              {...register('mobile')}
              placeholder="Enter Mobile Number"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');

                e.target.value = value.slice(0, maxLength);
              }}
            />

            {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label required>Password</Label>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter Password"
              className="pr-10"
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>

          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}

          <div className="flex justify-end">
            <span
              onClick={() => navigate('/forgot-password')}
              className="text-sm cursor-pointer font-medium text-[#FFB816] hover:underline"
            >
              Forgot password?
            </span>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </>
  );
}
