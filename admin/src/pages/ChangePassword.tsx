import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useChangePasswordMutation } from '@/store/api/adminApi';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useState } from 'react';
import toast from 'react-hot-toast';

/* -------------------- SCHEMA -------------------- */
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(8, 'Minimum 8 characters required'),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
  const [changePassword, { isLoading, error }] = useChangePasswordMutation();
  const [oldShowPassword, setOldShowPassword] = useState(false);
  const [newShowPassword, setNewShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).unwrap();
      reset();
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.error('Update failed', error);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="mr-2 h-5 w-5" />
          Password & Authentication
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={oldShowPassword ? 'text' : 'password'}
                placeholder="Enter Current Password"
                {...register('oldPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setOldShowPassword(!oldShowPassword)}
              >
                {oldShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.oldPassword && (
              <p className="text-sm text-destructive">{errors.oldPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={newShowPassword ? 'text' : 'password'}
                placeholder="Enter New Password"
                {...register('newPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setNewShowPassword(!newShowPassword)}
              >
                {newShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Input
                type={confirmShowPassword ? 'text' : 'password'}
                placeholder="Enter Confirm Password"
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-setConfirm hover:bg-transparent"
                onClick={() => setConfirmShowPassword(!confirmShowPassword)}
              >
                {confirmShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          {error && (
            <ErrorBanner
              type="error"
              title="Login Failed"
              message={(error as any)?.data?.message || 'Invalid email or password'}
            />
          )}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;
