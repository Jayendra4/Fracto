import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useLoginMutation } from '@/store/api/authApi';
import { useSendFcmTokenMutation } from '@/store/api/notificationApi';
import { useLazyGetAdminProfileQuery } from '@/store/api/adminApi';
import { useAppDispatch } from '@/hooks/redux';
import { setAdminProfile, setAuthCredentials } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { LoginPanel } from '@/types';
import { getFcmToken } from '@/utils/fcmUtils';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function EmailLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();
  const [sendFcmToken] = useSendFcmTokenMutation();
  const [fetchAdmin] = useLazyGetAdminProfileQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const auth = await login({
        email: data.email.toLowerCase(),
        password: data.password,
        loginPanel: LoginPanel.TRUSTEE,
      }).unwrap();

      dispatch(setAuthCredentials(auth));

      const admin = await fetchAdmin().unwrap();
      dispatch(setAdminProfile(admin));
      try {
        const token = await getFcmToken();
        if (token) {
          await sendFcmToken({ token }).unwrap();
          console.log('FCM Token registered successfully on login');
        }
      } catch (fcmError) {
        console.error('FCM Registration failed during login:', fcmError);
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
        <div className="space-y-2">
          <Label required>Email</Label>
          <Input {...register('email')} placeholder="Enter Email" className="autofill:bg-transparent" />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label required>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter Password"
              className="pr-10 autofill:bg-transparent"
              
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
