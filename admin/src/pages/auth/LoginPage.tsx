import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setAdminProfile, setAuthCredentials } from '@/store/slices/authSlice';
import { useLazyGetAdminProfileQuery } from '@/store/api/adminApi';
import { requestNotificationPermission } from '@/utils/notifications';
import { LoginPanel } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const [fetchAdmin] = useLazyGetAdminProfileQuery();
  const [unauthorizedError, setUnauthorizedError] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // const onSubmit = async (data: LoginFormData) => {
  //   try {
  //     // 1️⃣ Login
  //     const auth = await login(data).unwrap();
  //     dispatch(setAuthCredentials(auth));

  //     // 2️⃣ Fetch admin profile ONLY after login
  //     if (auth.type === 'admin') {
  //       const admin = await fetchAdmin().unwrap();
  //       dispatch(setAdminProfile(admin));
  //     }

  //     await requestNotificationPermission();
  //     navigate('/dashboard');
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setUnauthorizedError(null);
      const payload = {
        ...data,
        loginPanel: LoginPanel.ADMIN,
      };

      const auth = await login(payload).unwrap();

      if (auth.type !== 'admin') {
        setUnauthorizedError({
          data: {
            message: 'Invalid email or password',
          },
        });
        return;
      }
      dispatch(setAuthCredentials(auth));

      const admin = await fetchAdmin().unwrap();
      dispatch(setAdminProfile(admin));

      await requestNotificationPermission();
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const clearUnauthorizedError = () => {
    if (unauthorizedError) setUnauthorizedError(null);
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to access your account
        </p>
      </div>

      {(error || unauthorizedError) && (
        <ErrorBanner
          type="error"
          title="Login Failed"
          message={
            (error as any)?.data?.message ||
            (unauthorizedError as any)?.data?.message ||
            'Invalid email or password'
          }
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register('email', {
              onChange: clearUnauthorizedError,
            })}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password', {
                onChange: clearUnauthorizedError,
              })}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
            />
            <Button
              type="button"
              variant="ghost"
              aria-label="view"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-blue-400" />
              ) : (
                <Eye className="h-4 w-4 text-blue-400" />
              )}
            </Button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        {/* <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div> */}

        <Button type="submit" aria-label="Loder " className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      {/* <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link to="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </div> */}
    </div>
  );
}
